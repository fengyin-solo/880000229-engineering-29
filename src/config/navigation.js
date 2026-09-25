import DashboardView from '../views/DashboardView.vue'
import BatchLibraryView from '../views/BatchLibraryView.vue'
import TaskBoardView from '../views/TaskBoardView.vue'
import NotFoundView from '../views/NotFoundView.vue'

/**
 * 工作台导航的唯一配置来源：
 * - 侧边栏入口（label/to）
 * - 路由记录（path/name/component）
 * - 当前页高亮判断（isActiveNavigationEntry）
 * - 不可达地址兜底（fallbackRouteRecord）
 *
 * 新增页面时只需在此登记一条记录，路由与导航会同时生效；
 * 配置异常由 src/router/navigationValidation.js 在启动与构建时统一校验。
 */
export const navigationEntries = [
  {
    name: 'dashboard',
    path: '/',
    label: '修复总览',
    component: DashboardView,
  },
  {
    name: 'batches',
    path: '/batches',
    label: '批次档案',
    component: BatchLibraryView,
  },
  {
    name: 'tasks',
    path: '/tasks',
    label: '任务清单',
    component: TaskBoardView,
  },
]

/** 直接访问任何未登记地址时命中的兜底路由名称。 */
export const fallbackRouteName = 'not-found'

/**
 * 不可达地址统一兜底：未登记路径（含直接访问/刷新）直接渲染提示页，
 * 浏览器地址保持原样，刷新后仍是同一个兜底页。
 */
export const fallbackRouteRecord = {
  path: '/:pathMatch(.*)*',
  name: fallbackRouteName,
  component: NotFoundView,
  props: true,
}

/** 导航配置生成的业务路由记录，供路由器与启动校验共用。 */
export const entryRouteRecords = navigationEntries.map(({ name, path, component }) => ({
  path,
  name,
  component,
}))

/**
 * 当前页判断：导航入口与路由 name 一一对应，精确匹配。
 * 例如访问 /batches 时仅高亮「批次档案」，不会顺带高亮根路径入口。
 */
export function isActiveNavigationEntry(entry, currentRouteName) {
  return entry.name === currentRouteName
}

/** 供侧边栏渲染的导航项，附带当前页激活状态。 */
export function getNavigationItems(currentRouteName) {
  return navigationEntries.map((entry) => ({
    ...entry,
    to: entry.path,
    active: isActiveNavigationEntry(entry, currentRouteName),
  }))
}
