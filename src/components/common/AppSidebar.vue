<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <p class="brand-kicker">{{ title }}</p>
      <h1>{{ subtitle }}</h1>
    </div>
    <nav class="nav">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="nav-link"
        :class="{ 'nav-link-active': item.active }"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  padding: 28px 20px;
  border-right: 1px solid rgba(79, 57, 32, 0.12);
  background: rgba(249, 243, 231, 0.9);
  position: sticky;
  top: 0;
  height: 100vh;
}

.brand-kicker {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #82684b;
  font-size: 0.76rem;
}

.brand h1 {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.1;
}

.nav {
  display: grid;
  gap: 10px;
  margin-top: 28px;
}

.nav-link {
  padding: 12px 14px;
  border-radius: 14px;
  color: #6a5439;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.72);
}

.nav-link.nav-link-active {
  background: #5d4322;
  color: #fff8eb;
}

@media (max-width: 980px) {
  .sidebar {
    width: auto;
    height: auto;
    position: static;
    border-right: none;
    border-bottom: 1px solid rgba(79, 57, 32, 0.12);
  }

  .nav {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .nav {
    grid-template-columns: 1fr;
  }
}
</style>
