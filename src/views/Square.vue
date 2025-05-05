<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageLayout from '../components/PageLayout.vue'
import { getBookmarkedWebsites, addBookmarkedWebsite, deleteBookmarkedWebsite } from '../utils/websiteService'

const router = useRouter()

// 功能模块列表
const modules = [
  { 
    id: 'todo', 
    name: '待办事项', 
    icon: '📝', 
    color: '#3498db', 
    route: '/todo',
    description: '管理你的日常任务'
  },
  { 
    id: 'notes', 
    name: '笔记', 
    icon: '📓', 
    color: '#2ecc71', 
    route: '/notes',
    description: '记录你的想法与灵感'
  },
  { 
    id: 'budget', 
    name: '记账', 
    icon: '💰', 
    color: '#f39c12', 
    route: '/budget',
    description: '跟踪你的收入和支出'
  },
  { 
    id: 'pomodoro', 
    name: '番茄钟', 
    icon: '⏱️', 
    color: '#e74c3c', 
    route: '/pomodoro',
    description: '高效工作与休息'
  },
  { 
    id: 'countdown', 
    name: '倒数日', 
    icon: '📅', 
    color: '#9b59b6', 
    route: '/countdown',
    description: '不要错过重要的日子'
  },
  { 
    id: 'anniversary', 
    name: '纪念日', 
    icon: '🎂', 
    color: '#e67e22', 
    route: '/anniversary',
    description: '珍藏美好的回忆'
  },
  { 
    id: 'water', 
    name: '饮水习惯', 
    icon: '💧', 
    color: '#1abc9c', 
    route: '/water',
    description: '保持健康的饮水习惯'
  },
  { 
    id: 'woodfish', 
    name: '赛博木鱼', 
    icon: '🪘', 
    color: '#34495e', 
    route: '/woodfish',
    description: '点击木鱼，功德+1'
  },
  { 
    id: 'food', 
    name: '今天吃点啥', 
    icon: '🍽️', 
    color: '#e91e63', 
    route: '/food',
    description: '随机推荐美食'
  }
]

// 收藏网站相关状态
const bookmarkedWebsites = ref([])
const showAddWebsiteForm = ref(false)
const websiteUrl = ref('')
const websiteName = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const isLoading = ref(false)

// 加载收藏的网站
const loadBookmarkedWebsites = () => {
  bookmarkedWebsites.value = getBookmarkedWebsites()
}

// 跳转到模块页面
const navigateToModule = (route) => {
  router.push(route)
}

// 打开网站
const openWebsite = (url) => {
  window.open(url, '_blank')
}

// 显示添加网站表单
const showAddWebsiteModal = () => {
  showAddWebsiteForm.value = true
  websiteUrl.value = ''
  websiteName.value = ''
  errorMsg.value = ''
}

// 取消添加网站
const cancelAddWebsite = () => {
  showAddWebsiteForm.value = false
}

// 添加收藏网站
const handleAddWebsite = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  
  if (!websiteUrl.value) {
    errorMsg.value = '请输入网址'
    return
  }
  
  if (!websiteName.value) {
    errorMsg.value = '请输入网站名称'
    return
  }
  
  isLoading.value = true
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const result = addBookmarkedWebsite(websiteUrl.value, websiteName.value)
  
  isLoading.value = false
  
  if (result.success) {
    successMsg.value = '添加成功'
    setTimeout(() => {
      successMsg.value = ''
      showAddWebsiteForm.value = false
      loadBookmarkedWebsites()
    }, 1500)
  } else {
    errorMsg.value = result.message
  }
}

// 删除收藏网站
const handleDeleteWebsite = (event, id) => {
  event.stopPropagation() // 阻止点击事件冒泡到卡片
  
  if (confirm('确定要删除这个收藏网站吗？')) {
    deleteBookmarkedWebsite(id)
    loadBookmarkedWebsites()
  }
}

// 获取随机颜色
const getRandomColor = (seed) => {
  const colors = [
    '#3498db', '#2ecc71', '#f39c12', '#e74c3c', 
    '#9b59b6', '#e67e22', '#1abc9c', '#34495e',
    '#16a085', '#27ae60', '#d35400', '#8e44ad'
  ]
  
  // 使用种子获取伪随机颜色以保持相同网站颜色一致
  const index = Math.abs(seed.split('').reduce((a, b) => {
    return a + b.charCodeAt(0)
  }, 0)) % colors.length
  
  return colors[index]
}

// 获取网站图标第一个字母
const getWebsiteInitial = (name) => {
  return name && name.length > 0 ? name.charAt(0).toUpperCase() : '🌐'
}

onMounted(() => {
  loadBookmarkedWebsites()
})
</script>

<template>
  <PageLayout title="功能广场" :showBack="false" :hasTabBar="true">
    <!-- 添加网站按钮 -->
    <div class="action-bar">
      <button class="add-website-btn" @click="showAddWebsiteModal">
        <i class="icon-add"></i>
        <span>收藏网站</span>
      </button>
    </div>
    
    <!-- 收藏网站区域 -->
    <div class="section-title" v-if="bookmarkedWebsites.length > 0">收藏网站</div>
    <div class="grid-container" v-if="bookmarkedWebsites.length > 0">
      <div 
        v-for="website in bookmarkedWebsites" 
        :key="website.id" 
        class="module-card website-card"
        @click="openWebsite(website.url)"
      >
        <div class="module-icon" :style="{ backgroundColor: getRandomColor(website.url) }">
          <span>{{ getWebsiteInitial(website.name) }}</span>
        </div>
        <div class="module-info">
          <h3 class="module-name">{{ website.name }}</h3>
          <p class="module-desc website-url">{{ website.url }}</p>
          <button 
            class="delete-btn" 
            @click="(event) => handleDeleteWebsite(event, website.id)"
          >
            <i class="icon-delete"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 功能模块区域 -->
    <div class="section-title">功能模块</div>
    <div class="grid-container">
      <div 
        v-for="module in modules" 
        :key="module.id" 
        class="module-card"
        @click="navigateToModule(module.route)"
      >
        <div class="module-icon" :style="{ backgroundColor: module.color }">
          <span>{{ module.icon }}</span>
        </div>
        <div class="module-info">
          <h3 class="module-name">{{ module.name }}</h3>
          <p class="module-desc">{{ module.description }}</p>
        </div>
      </div>
    </div>
    
    <!-- 添加网站浮层 -->
    <div class="modal-overlay" v-if="showAddWebsiteForm" @click="cancelAddWebsite">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>收藏网站</h3>
          <button class="close-btn" @click="cancelAddWebsite">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>网址</label>
            <input 
              type="text" 
              v-model="websiteUrl" 
              placeholder="例如：www.example.com" 
            />
          </div>
          
          <div class="form-group">
            <label>名称</label>
            <input 
              type="text" 
              v-model="websiteName" 
              placeholder="网站名称" 
            />
          </div>
          
          <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>
          <div v-if="successMsg" class="success-message">{{ successMsg }}</div>
          
          <div class="form-actions">
            <button 
              class="cancel-button" 
              @click="cancelAddWebsite"
            >
              取消
            </button>
            <button 
              class="submit-button" 
              @click="handleAddWebsite"
              :disabled="isLoading"
            >
              <span v-if="!isLoading">保存</span>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<style scoped>
.action-bar {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.add-website-btn {
  display: flex;
  align-items: center;
  padding: 0.6rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(var(--primary-color-rgb), 0.3);
}

.add-website-btn:active {
  transform: scale(0.98);
}

.icon-add {
  margin-right: 0.5rem;
}

.icon-add:before {
  content: "+";
}

.icon-delete:before {
  content: "×";
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.module-card {
  background-color: var(--bg-card);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  transition: transform 0.2s, box-shadow 0.2s, background-color var(--transition-time);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
}

.website-card {
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.website-card:hover {
  border-color: var(--primary-color);
}

.module-card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.module-icon {
  padding: 1.5rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.2s;
}

.module-card:active .module-icon {
  transform: scale(0.95);
}

.module-icon span {
  font-size: 2.5rem;
}

.module-info {
  padding: 1rem;
  background-color: var(--bg-card);
  position: relative;
}

.module-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.module-desc {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.website-url {
  font-size: 0.75rem;
  color: var(--primary-color);
}

.delete-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: var(--text-light);
  opacity: 0.7;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  opacity: 1;
  background-color: rgba(var(--danger-color), 0.1);
  color: var(--danger-color);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 500px;
  background-color: var(--bg-card);
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: modal-in 0.3s ease;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-color);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-light);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: var(--text-light);
}

input[type="text"] {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all var(--transition-time);
}

input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
}

.error-message {
  color: var(--danger-color);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.success-message {
  color: var(--success-color);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.cancel-button, .submit-button {
  flex: 1;
  padding: 0.8rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cancel-button {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-color);
}

.submit-button {
  background-color: var(--primary-color);
  color: white;
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 1.2rem;
  height: 1.2rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (min-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style> 