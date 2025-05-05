<script setup>
import { useRouter } from 'vue-router'

defineProps({
  title: {
    type: String,
    required: true
  },
  showBack: {
    type: Boolean,
    default: true
  },
  hasTabBar: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="page-container" :class="{ 'has-tab-bar': hasTabBar }">
    <div class="page-header">
      <div class="page-header-content">
        <div v-if="showBack" class="back-button" @click="goBack">
          <i class="icon-back"></i>
        </div>
        <h1 class="page-title">{{ title }}</h1>
        <div class="placeholder" v-if="showBack"></div>
      </div>
    </div>
    
    <div class="page-content-wrapper">
      <div class="page-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-color);
  width: 100%;
  transition: background-color var(--transition-time);
}

.page-header {
  background-color: var(--bg-header);
  color: var(--text-color);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  transition: background-color var(--transition-time), color var(--transition-time);
}

.page-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  max-width: 768px;
  margin: 0 auto;
  width: 100%;
}

.back-button {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.back-button:active {
  background-color: rgba(255, 255, 255, 0.2);
}

.icon-back:before {
  content: "←";
  font-size: 1.5rem;
}

.page-title {
  font-size: 1.2rem;
  margin: 0;
  font-weight: 600;
}

.placeholder {
  width: 2rem;
}

.page-content-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
}

.page-content {
  width: 100%;
  max-width: 768px;
  padding: 1rem;
  position: relative;
  overflow-y: auto;
}

.has-tab-bar .page-content {
  padding-bottom: 70px;
}

@media (min-width: 768px) {
  .page-content {
    padding: 1.5rem;
  }
  
  .page-header-content {
    padding: 1rem 1.5rem;
  }
}
</style> 