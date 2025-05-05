<script setup>
import { ref, onMounted, computed } from 'vue'
import PageLayout from '../components/PageLayout.vue'
import { getCountdowns, addCountdown, deleteCountdown, calculateDaysLeft } from '../utils/countdownService'

const countdowns = ref([])
const showAddForm = ref(false)
const formTitle = ref('')
const formDate = ref('')
const formColor = ref('#3498db')
const errorMsg = ref('')
const successMsg = ref('')
const isLoading = ref(false)

// 颜色选项
const colorOptions = [
  '#3498db', // 蓝色
  '#2ecc71', // 绿色
  '#e74c3c', // 红色
  '#f39c12', // 橙色
  '#9b59b6', // 紫色
  '#1abc9c', // 青色
  '#e67e22', // 棕色
  '#34495e'  // 深灰色
]

// 加载倒数日列表
const loadCountdowns = () => {
  const data = getCountdowns()
  countdowns.value = data.map(item => ({
    ...item,
    daysLeft: calculateDaysLeft(item.targetDate)
  })).sort((a, b) => a.daysLeft - b.daysLeft)
}

// 添加倒数日
const handleAddCountdown = async () => {
  if (!formTitle.value.trim()) {
    errorMsg.value = '请输入倒数日标题'
    return
  }
  
  if (!formDate.value) {
    errorMsg.value = '请选择目标日期'
    return
  }
  
  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const result = addCountdown(formTitle.value, formDate.value, formColor.value)
  
  isLoading.value = false
  
  if (result.success) {
    successMsg.value = '添加成功'
    setTimeout(() => {
      successMsg.value = ''
    }, 2000)
    
    // 清空表单
    formTitle.value = ''
    formDate.value = ''
    formColor.value = '#3498db'
    
    // 重新加载数据
    loadCountdowns()
    showAddForm.value = false
  } else {
    errorMsg.value = result.message
  }
}

// 删除倒数日
const handleDeleteCountdown = (id) => {
  if (confirm('确定要删除这个倒数日吗？')) {
    deleteCountdown(id)
    loadCountdowns()
  }
}

// 取消添加
const cancelAdd = () => {
  showAddForm.value = false
  formTitle.value = ''
  formDate.value = ''
  formColor.value = '#3498db'
  errorMsg.value = ''
}

// 获取今天的日期（YYYY-MM-DD格式）
const todayDate = computed(() => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
})

// 格式化展示日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

onMounted(() => {
  loadCountdowns()
})
</script>

<template>
  <PageLayout title="倒数日">
    <div class="countdown-container">
      <div class="action-bar">
        <button 
          v-if="!showAddForm" 
          class="add-button"
          @click="showAddForm = true"
        >
          <i class="icon-add"></i>
          <span>添加倒数日</span>
        </button>
      </div>
      
      <div v-if="showAddForm" class="add-form">
        <h3>添加倒数日</h3>
        <div class="form-group">
          <label>标题</label>
          <input
            type="text"
            v-model="formTitle"
            placeholder="输入倒数日标题"
          />
        </div>
        
        <div class="form-group">
          <label>目标日期</label>
          <input
            type="date"
            v-model="formDate"
            :min="todayDate"
          />
        </div>
        
        <div class="form-group">
          <label>选择颜色</label>
          <div class="color-selector">
            <div 
              v-for="color in colorOptions" 
              :key="color"
              class="color-option"
              :style="{ backgroundColor: color }"
              :class="{ active: formColor === color }"
              @click="formColor = color"
            ></div>
          </div>
        </div>
        
        <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>
        <div v-if="successMsg" class="success-message">{{ successMsg }}</div>
        
        <div class="form-actions">
          <button class="cancel-button" @click="cancelAdd">取消</button>
          <button 
            class="submit-button" 
            @click="handleAddCountdown"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">保存</span>
            <span v-else class="loading-spinner"></span>
          </button>
        </div>
      </div>
      
      <div class="countdowns-list">
        <div v-if="countdowns.length === 0" class="empty-state">
          <div class="empty-icon">📅</div>
          <p>暂无倒数日，点击"添加倒数日"按钮开始吧</p>
        </div>
        
        <div 
          v-for="countdown in countdowns" 
          :key="countdown.id" 
          class="countdown-card"
          :style="{ borderColor: countdown.color }"
        >
          <div class="countdown-header" :style="{ backgroundColor: countdown.color }">
            <h3 class="countdown-title">{{ countdown.title }}</h3>
            <button 
              class="delete-button" 
              @click.stop="handleDeleteCountdown(countdown.id)"
            >
              <i class="icon-delete"></i>
            </button>
          </div>
          
          <div class="countdown-content">
            <div class="countdown-days">
              <span class="days-number">{{ countdown.daysLeft }}</span>
              <span class="days-label">天</span>
            </div>
            <div class="countdown-date">
              目标日期: {{ formatDate(countdown.targetDate) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<style scoped>
.countdown-container {
  width: 100%;
}

.action-bar {
  margin-bottom: 1rem;
  display: flex;
  justify-content: flex-end;
}

.add-button {
  display: flex;
  align-items: center;
  padding: 0.7rem 1.2rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-button:active {
  transform: scale(0.98);
}

.icon-add:before {
  content: "+";
  margin-right: 0.5rem;
}

.add-form {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--card-shadow);
}

.add-form h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: var(--text-light);
}

input[type="text"],
input[type="date"] {
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
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.color-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.color-option {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.color-option.active:after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 1.2rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.color-option:hover {
  transform: scale(1.1);
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
}

.cancel-button, .submit-button {
  flex: 1;
  padding: 0.8rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  border: none;
}

.cancel-button {
  background-color: #f1f1f1;
  color: var(--text-color);
}

.submit-button {
  background-color: var(--primary-color);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
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

.countdowns-list {
  margin-bottom: 2rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  color: var(--text-light);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.countdown-card {
  background-color: white;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  border-left: 4px solid;
}

.countdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  color: white;
}

.countdown-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.delete-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
}

.delete-button:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.2);
}

.icon-delete:before {
  content: "🗑️";
  font-size: 0.9rem;
}

.countdown-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.countdown-days {
  display: flex;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.days-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-color);
}

.days-label {
  font-size: 1.2rem;
  color: var(--text-light);
  margin-left: 0.25rem;
}

.countdown-date {
  font-size: 0.9rem;
  color: var(--text-light);
}
</style> 