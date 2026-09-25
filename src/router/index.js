import { createRouter, createWebHistory } from 'vue-router'

import {
  entryRouteRecords,
  fallbackRouteRecord,
} from '../config/navigation.js'
import { assertNavigationConfig } from './navigationValidation.js'

// 浏览器启动时先做同步结构校验：入口缺失、重复路径/名称会在此明确抛出。
assertNavigationConfig()

const router = createRouter({
  history: createWebHistory(),
  routes: [...entryRouteRecords, fallbackRouteRecord],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
