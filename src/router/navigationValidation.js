import { createRouter, createMemoryHistory } from 'vue-router'

import {
  navigationEntries,
  entryRouteRecords,
  fallbackRouteRecord,
  fallbackRouteName,
} from '../config/navigation.js'

/**
 * 工作台导航与路由的统一校验。
 *
 * - assertNavigationConfig()：纯同步结构校验，浏览器导入 router 时执行一次。
 * - assertNavigationReachable()：在结构校验之外，用内存路由器模拟
 *   「直接访问 / 刷新」每个入口路径，并验证未登记地址一定命中兜底路由。
 *   该函数只依赖内存历史，不访问 window，可在 Vite SSR（开发/构建插件）中运行。
 *
 * 任一项失败都会聚合成带编号的中文错误列表抛出，由启动检查直接呈现。
 */

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0

function collectConfigProblems() {
  const problems = []

  if (!Array.isArray(navigationEntries) || navigationEntries.length === 0) {
    problems.push('导航入口缺失：navigationEntries 必须至少包含一条工作台入口。')
    return problems
  }

  navigationEntries.forEach((entry, index) => {
    const where = `第 ${index + 1} 条导航入口`

    if (!entry || typeof entry !== 'object') {
      problems.push(
        `${where}缺失：入口必须是包含 name/path/label/component 的对象。`,
      )
      return
    }

    if (!isNonEmptyString(entry.name)) {
      problems.push(`${where}缺少路由名称 name。`)
    }

    if (!isNonEmptyString(entry.path)) {
      problems.push(`${where}缺少访问路径 path。`)
    } else if (!entry.path.startsWith('/')) {
      problems.push(
        `${where}的路径 "${entry.path}" 必须是以 / 开头的绝对路径，无法直接访问。`,
      )
    }

    if (!isNonEmptyString(entry.label)) {
      problems.push(`${where}缺少导航文案 label。`)
    }

    if (!entry.component) {
      problems.push(
        `${where}缺少页面组件 component，访问该入口将没有内容可渲染。`,
      )
    }
  })

  const seenPaths = new Map()
  navigationEntries.forEach((entry) => {
    if (!isNonEmptyString(entry?.path)) return
    if (seenPaths.has(entry.path)) {
      problems.push(
        `导航路径重复："${entry.path}" 同时被「${seenPaths.get(entry.path)}」和「${
          entry.label ?? '(未命名)'
        }」使用。`,
      )
    } else {
      seenPaths.set(entry.path, entry.label)
    }
  })

  const seenNames = new Map()
  navigationEntries.forEach((entry) => {
    if (!isNonEmptyString(entry?.name)) return
    if (seenNames.has(entry.name)) {
      problems.push(
        `路由名称重复："${entry.name}" 同时被路径 "${seenNames.get(entry.name)}" 和 "${
          entry.path
        }" 使用。`,
      )
    } else {
      seenNames.set(entry.name, entry.path)
    }
  })

  const allRecords = [...entryRouteRecords, fallbackRouteRecord]
  const recordPaths = new Set()
  allRecords.forEach((record) => {
    if (recordPaths.has(record.path)) {
      problems.push(`路由表中存在重复路径："${record.path}"。`)
    }
    recordPaths.add(record.path)
  })

  if (!allRecords.some((record) => record.name === fallbackRouteName)) {
    problems.push(
      `缺少不可达地址兜底路由：未找到名称为 "${fallbackRouteName}" 的记录。`,
    )
  }

  return problems
}

/** 同步结构校验：入口缺失、必填项缺失、重复路径/名称、缺少兜底路由。 */
export function assertNavigationConfig() {
  const problems = collectConfigProblems()
  if (problems.length > 0) {
    throw new Error(formatProblems(problems))
  }
}

/**
 * 可达性校验：模拟每个入口路径的直接访问（等价于刷新该 URL），
 * 并确认未登记地址会落到兜底页而不是普通入口。
 */
export async function assertNavigationReachable() {
  assertNavigationConfig()

  const problems = []
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [...entryRouteRecords, fallbackRouteRecord],
  })

  for (const entry of navigationEntries) {
    const resolved = router.resolve(entry.path)
    if (!resolved?.matched || resolved.matched.length === 0) {
      problems.push(
        `入口「${entry.label}」的路径 "${entry.path}" 直接访问失败：没有任何路由匹配。`,
      )
      continue
    }

    const matchedRecord = resolved.matched[resolved.matched.length - 1]
    if (!matchedRecord?.components?.default) {
      problems.push(
        `入口「${entry.label}」的路径 "${entry.path}" 直接访问失败：未解析到页面组件。`,
      )
    } else if (matchedRecord.name === fallbackRouteName) {
      problems.push(
        `入口「${entry.label}」的路径 "${entry.path}" 被兜底路由接管，普通访问将显示不可达页面。`,
      )
    }
  }

  const unknownPath = `/__route_check_unknown_${Date.now()}__`
  const unknownResolved = router.resolve(unknownPath)
  if (
    !unknownResolved?.matched?.some(
      (record) => record.name === fallbackRouteName,
    )
  ) {
    problems.push(
      `不可达地址处理失效：访问未登记路径 "${unknownPath}" 时没有命中兜底路由。`,
    )
  }

  if (problems.length > 0) {
    throw new Error(formatProblems(problems))
  }
}

function formatProblems(problems) {
  const list = problems
    .map((problem, index) => `  ${index + 1}. ${problem}`)
    .join('\n')
  return `[路由校验] 工作台导航配置存在 ${problems.length} 个问题：\n${list}`
}
