import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import {
  unreachableRedirect,
  workbenchEntries,
  workbenchNavItems,
} from './src/router/workbench.config.js'
import {
  formatWorkbenchProblems,
  validateWorkbenchConfig,
} from './src/router/validateWorkbenchConfig.js'

const viewsDir = fileURLToPath(new URL('./src/views', import.meta.url))

// 工作台路由启动检查：本地开发（vite dev）与构建（vite build）都会执行，
// 入口缺失、重复路径或直接访问失败时明确报出并中断启动。
function workbenchRouteCheck() {
  return {
    name: 'workbench-route-check',
    buildStart() {
      const problems = validateWorkbenchConfig({
        entries: workbenchEntries,
        navItems: workbenchNavItems,
        unreachableRedirect,
        viewExists: (view) => existsSync(join(viewsDir, view)),
      })

      if (problems.length > 0) {
        this.error(formatWorkbenchProblems(problems))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), workbenchRouteCheck()],
  server: {
    open: false,
  },
})
