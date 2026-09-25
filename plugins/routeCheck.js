import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const runnerPath = fileURLToPath(new URL('./routeCheck.runner.js', import.meta.url))

/**
 * 本地开发与构建共用的路由校验插件。
 *
 * - `vite`（开发）：服务启动前以隔离子进程执行完整校验，
 *   入口缺失、重复路径或直接访问失败会直接中断启动并打印原因。
 * - `vite build`：构建开始前执行同一个子进程校验，
 *   失败则构建退出（退出码 1）。
 *
 * 校验子进程使用独立的中间件模式 Vite 服务（全新的 Vue 插件实例），
 * 与外层开发服务/构建完全隔离；浏览器端另由 src/router/index.js 中的
 * assertNavigationConfig() 在挂载前兜底。
 */
export function routeCheckPlugin() {
  let command = 'serve'

  return {
    name: 'workbench-route-check',

    configResolved(config) {
      command = config.command
    },

    configureServer(server) {
      runRouteCheck('开发启动检查', (message) =>
        server.config.logger.info(message),
      )
    },

    buildStart() {
      // 开发服务初始化时也会触发 buildStart，此时以 configureServer 的检查为准。
      if (command !== 'build') {
        return
      }
      // Vite 8 会为 client/ssr 两个环境各触发一次 buildStart，只需检查一次。
      if (this.environment?.name && this.environment.name !== 'client') {
        return
      }
      // 构建上下文中的信息会自动带上 [plugin workbench-route-check] 前缀。
      runRouteCheck('构建检查', (message) => this.info(message))
    },
  }
}

function runRouteCheck(label, report) {
  const result = spawnSync(process.execPath, [runnerPath], {
    cwd: process.cwd(),
    encoding: 'utf8',
  })

  if (result.error) {
    throw new Error(`[路由校验] 无法执行${label}：${result.error.message}`)
  }

  if (result.status !== 0) {
    throw new Error(
      `[路由校验] ${label}未通过，已中止启动：\n${
        result.stderr?.trim() || result.stdout?.trim() || '未知错误'
      }`,
    )
  }

  report(
    `[路由校验] ${label}通过：导航入口完整、路径无重复、直接访问与刷新可达。`,
  )
}
