<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const currentPath = computed(() => route.path)

const navigateTo = (path) => {
  if (currentPath.value !== path) {
    router.push(path)
  }
}
</script>

<template>
  <div class="tab-bar">
    <div 
      class="tab-item" 
      :class="{ active: currentPath === '/square' }"
      @click="navigateTo('/square')"
    >
      <i class="icon-square"></i>
      <span>广场</span>
    </div>
    <div 
      class="tab-item" 
      :class="{ active: currentPath === '/profile' }"
      @click="navigateTo('/profile')"
    >
      <i class="icon-profile"></i>
      <span>我的</span>
    </div>
  </div>
</template>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background-color: var(--bg-card);
  display: flex;
  box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
  z-index: 100;
  transition: background-color var(--transition-time);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
  font-size: 0.8rem;
  transition: color 0.3s;
  cursor: pointer;
}

.tab-item.active {
  color: var(--primary-color);
}

.tab-item i {
  font-size: 1.5rem;
  margin-bottom: 4px;
}

.icon-square:before {
  content: "🏠";
}

.icon-profile:before {
  content: "👤";
}
</style> 