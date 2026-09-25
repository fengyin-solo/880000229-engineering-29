/**
 * 校验工作台导航统一配置，返回问题列表（空数组表示通过）。
 *
 * 覆盖三类问题：
 * - 入口缺失：条目或 path / name / label / view 字段不完整，导航入口指向未登记地址
 * - 重复路径：多个入口共用同一 path 或 name
 * - 直接访问失败：入口对应的视图文件不存在，或不可达地址回退目标没有登记入口
 *
 * 该模块保持纯函数，vite 启动检查与前端路由启动检查共用。
 */
export function validateWorkbenchConfig({
  entries,
  navItems,
  unreachableRedirect,
  viewExists,
}) {
  const problems = []

  if (!Array.isArray(entries) || entries.length === 0) {
    problems.push('入口缺失：工作台导航配置为空，至少需要一个入口。')
    return problems
  }

  const pathOwners = new Map()
  const nameOwners = new Map()

  entries.forEach((entry, index) => {
    const where = `第 ${index + 1} 个入口`

    if (!entry || typeof entry !== 'object') {
      problems.push(`入口缺失：${where}不是有效的配置对象。`)
      return
    }

    const label = entry.label || '(未命名)'

    if (!entry.path) {
      problems.push(`入口缺失：${where}（${label}）缺少 path。`)
    } else if (!entry.path.startsWith('/')) {
      problems.push(`入口无效：${where}（${label}）的 path「${entry.path}」必须以 / 开头。`)
    }

    if (!entry.name) {
      problems.push(`入口缺失：${where}（${entry.path || label}）缺少 name。`)
    }

    if (!entry.label) {
      problems.push(`入口缺失：${where}（${entry.path}）缺少导航文案 label。`)
    }

    if (!entry.view) {
      problems.push(`入口缺失：${where}（${entry.path || label}）缺少视图文件 view。`)
    } else if (viewExists && !viewExists(entry.view)) {
      problems.push(
        `直接访问失败：${entry.path} 对应的视图文件 src/views/${entry.view} 不存在。`,
      )
    }

    if (entry.path) {
      const owner = pathOwners.get(entry.path)
      if (owner) {
        problems.push(`重复路径：${entry.path} 同时被「${owner}」和「${label}」占用。`)
      } else {
        pathOwners.set(entry.path, label)
      }
    }

    if (entry.name) {
      const owner = nameOwners.get(entry.name)
      if (owner) {
        problems.push(`重复路径：name「${entry.name}」同时被「${owner}」和「${label}」占用。`)
      } else {
        nameOwners.set(entry.name, label)
      }
    }
  })

  const entryPaths = new Set(
    entries.filter((entry) => entry && entry.path).map((entry) => entry.path),
  )

  if (Array.isArray(navItems)) {
    navItems.forEach((item) => {
      if (!item || !item.to || !entryPaths.has(item.to)) {
        problems.push(
          `入口缺失：导航入口「${(item && item.label) || '(未命名)'}」指向未登记的地址 ${
            (item && item.to) || '(空)'
          }。`,
        )
      }
    })
  }

  if (!unreachableRedirect) {
    problems.push('入口缺失：未配置不可达地址的回退目标 unreachableRedirect。')
  } else if (!entryPaths.has(unreachableRedirect)) {
    problems.push(
      `直接访问失败：不可达地址回退目标 ${unreachableRedirect} 没有对应的工作台入口。`,
    )
  }

  return problems
}

export function formatWorkbenchProblems(problems) {
  return [
    `工作台路由校验未通过，共 ${problems.length} 个问题：`,
    ...problems.map((problem) => `  - ${problem}`),
  ].join('\n')
}
