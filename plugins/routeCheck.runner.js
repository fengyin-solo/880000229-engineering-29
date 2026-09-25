/**
 * 构建期路由校验入口（由 vite 插件在 `vite build` 时以子进程调用）。
 *
 * 使用独立的中间件模式 Vite 服务与全新的 Vue 插件实例，
 * 与外层构建进程完全隔离，避免共享插件状态或模块图。
 * 校验通过进程退出码反馈：0 通过，1 失败（错误信息打印到 stderr）。
 */
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

const VALIDATION_MODULE_ID = '/src/router/navigationValidation.js'

const server = await createServer({
  root: process.cwd(),
  configFile: false,
  logLevel: 'error',
  envFile: false,
  plugins: [vue()],
  server: { middlewareMode: true },
})

try {
  const mod = await server.ssrLoadModule(VALIDATION_MODULE_ID)
  await mod.assertNavigationReachable()
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  await server.close()
}
