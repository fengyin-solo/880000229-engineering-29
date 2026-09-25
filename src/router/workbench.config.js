/**
 * 工作台导航统一配置。
 *
 * 侧边栏入口、当前页判断、路由表和不可达地址回退全部从这份配置派生，
 * 本地开发（vite dev）与构建（vite build）启动时都会对它执行校验，
 * 因此这里保持纯数据与纯函数，不引入任何 .vue 文件，方便 Node 侧复用。
 */
export const workbenchEntries = [
  {
    path: '/',
    name: 'dashboard',
    label: '修复总览',
    view: 'DashboardView.vue',
  },
  {
    path: '/batches',
    name: 'batches',
    label: '批次档案',
    view: 'BatchLibraryView.vue',
  },
  {
    path: '/tasks',
    name: 'tasks',
    label: '任务清单',
    view: 'TaskBoardView.vue',
  },
]

// 未匹配到任何入口的地址统一回退到修复总览，保证陌生链接也有明确去向。
export const unreachableRedirect = '/'

// 侧边栏入口直接复用路由配置，避免入口文案与路由表脱节。
export const workbenchNavItems = workbenchEntries.map(({ path, label }) => ({
  to: path,
  label,
}))

/**
 * 当前页判断：仅当当前地址与入口路径完全一致时视为命中，
 * 与扁平路由结构对应，首页入口不会在其它页面误高亮。
 */
export function isWorkbenchEntryActive(item, currentPath) {
  return item.to === currentPath
}
