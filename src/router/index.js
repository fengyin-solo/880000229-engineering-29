import { createRouter, createWebHistory } from 'vue-router'

import {
  unreachableRedirect,
  workbenchEntries,
  workbenchNavItems,
} from './workbench.config'
import {
  formatWorkbenchProblems,
  validateWorkbenchConfig,
} from './validateWorkbenchConfig'

// 视图组件按统一配置中的 view 字段解析，保持与原先的静态引入一致的打包行为。
const viewModules = import.meta.glob('../views/*.vue', { eager: true })

function resolveView(view) {
  const module = viewModules[`../views/${view}`]
  return module ? module.default : undefined
}

// 应用启动检查：入口缺失、重复路径、直接访问失败都会在此明确报出并中断启动。
const startupProblems = validateWorkbenchConfig({
  entries: workbenchEntries,
  navItems: workbenchNavItems,
  unreachableRedirect,
  viewExists: (view) => Boolean(resolveView(view)),
})

// 过滤掉缺字段的条目，保证配置错误时由上面的校验报出清晰信息，
// 而不是在 createRouter 内部抛出难以定位的异常。
const routes = workbenchEntries
  .filter((entry) => entry.path && entry.name)
  .map((entry) => ({
    path: entry.path,
    name: entry.name,
    component: resolveView(entry.view),
    meta: { label: entry.label },
  }))

// 不可达地址处理：未匹配的地址统一回退到配置指定的入口。
routes.push({
  path: '/:pathMatch(.*)*',
  redirect: unreachableRedirect,
})

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// 直接访问检查：每个入口地址都必须解析到自身的命名路由，而不是落入回退。
for (const entry of workbenchEntries) {
  if (!entry.path) {
    continue
  }
  const resolved = router.resolve(entry.path)
  if (resolved.name !== entry.name) {
    startupProblems.push(
      `直接访问失败：${entry.path} 未解析到路由「${entry.name}」，实际命中 ${String(
        resolved.name || resolved.path,
      )}。`,
    )
  }
}

if (startupProblems.length > 0) {
  throw new Error(formatWorkbenchProblems(startupProblems))
}

export default router
