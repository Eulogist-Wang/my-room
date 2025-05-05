<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from './components/TabBar.vue'

const route = useRoute()
const showTabBar = computed(() => route.meta.showTabBar)
const isDarkMode = ref(false)

// 检查并加载用户主题设置
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDarkMode.value = true
    document.documentElement.classList.add('dark-theme')
  } else {
    // 检查系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      isDarkMode.value = true
      document.documentElement.classList.add('dark-theme')
      localStorage.setItem('theme', 'dark')
    }
  }
})

// 切换主题
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark-theme')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark-theme')
    localStorage.setItem('theme', 'light')
  }
}

// 当前主题文本
const themeText = computed(() => isDarkMode.value ? '切换到浅色模式' : '切换到深色模式')
</script>

<template>
  <div class="theme-toggle" @click="toggleDarkMode">
    <div class="theme-icon">{{ isDarkMode ? '🌙' : '☀️' }}</div>
  </div>
  <router-view />
  <TabBar v-if="showTabBar" />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

:root {
  /* 浅色主题变量 */
  --primary-color: #3498db;
  --primary-color-rgb: 52, 152, 219;
  --primary-dark: #2980b9;
  --danger-color: #e74c3c;
  --danger-dark: #c0392b;
  --success-color: #2ecc71;
  --text-color: #333;
  --text-light: #666;
  --border-color: #ddd;
  --card-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  --transition-time: 0.3s;
  --bg-color: #f5f5f5;
  --bg-card: #ffffff;
  --bg-header: #3498db;
}

/* 深色主题变量 */
.dark-theme {
  --primary-color: #4ea3de;
  --primary-color-rgb: 78, 163, 222;
  --primary-dark: #3a7cb3;
  --danger-color: #e95c4f;
  --danger-dark: #c5392a;
  --success-color: #42d77e;
  --text-color: #e0e0e0;
  --text-light: #b0b0b0;
  --border-color: #444;
  --card-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  --bg-color: #121212;
  --bg-card: #1e1e1e;
  --bg-header: #2a2a2a;
}

html {
  font-size: 16px;
}

body {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overscroll-behavior: none;
  transition: background-color var(--transition-time);
}

@media (max-width: 480px) {
  html {
    font-size: 14px;
  }
}

input, button, textarea, select {
  font-family: inherit;
  font-size: 1rem;
}

button {
  cursor: pointer;
}

a {
  color: var(--primary-color);
  text-decoration: none;
  cursor: pointer;
}

a:hover {
  text-decoration: underline;
}

/* 全局样式 */
.page-container-box {
  width: 100%;
  height: 100%;
}

/* 主题切换按钮 */
.theme-toggle {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--bg-card);
  box-shadow: var(--card-shadow);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 99;
  transition: all var(--transition-time);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.theme-icon {
  font-size: 1.2rem;
}

/* 全局动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
