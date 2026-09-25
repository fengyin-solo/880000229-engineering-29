<script setup>
import PanelSection from '../components/common/PanelSection.vue'
import { navigationEntries } from '../config/navigation.js'

defineProps({
  pathMatch: {
    type: [String, Array],
    default: '',
  },
})

const homePath = navigationEntries[0]?.path ?? '/'
</script>

<template>
  <div class="view-stack">
    <PanelSection title="页面不存在" badge="404">
      <p class="not-found-text">没有找到与当前地址对应的工作台页面。</p>
      <RouterLink :to="homePath" class="not-found-link">
        返回{{ navigationEntries[0]?.label ?? '首页' }}
      </RouterLink>
    </PanelSection>
  </div>
</template>

<style scoped>
.view-stack {
  display: grid;
}

.not-found-text {
  margin: 0 0 16px;
  color: #5c4a33;
}

.not-found-link {
  display: inline-block;
  padding: 10px 16px;
  border-radius: 12px;
  background: #5d4322;
  color: #fff8eb;
  text-decoration: none;
}
</style>
