<script setup>
import { ref, onMounted, computed } from 'vue'
import PageLayout from '../components/PageLayout.vue'
import { getAnniversaries, addAnniversary, deleteAnniversary, calculateAnniversaryDays, calculateNextAnniversary, anniversaryIcons } from '../utils/anniversaryService'

const anniversaries = ref([])
const showAddForm = ref(false)
const formTitle = ref('')
const formDate = ref('')
const formIcon = ref('🎂')
const formIsRepeatYearly = ref(true)
const errorMsg = ref('')
const successMsg = ref('')
const isLoading = ref(false)

// 加载纪念日列表
const loadAnniversaries = () => {
  const data = getAnniversaries()
  anniversaries.value = data.map(item => {
    const days = calculateAnniversaryDays(item.date)
    const next = item.isRepeatYearly ? calculateNextAnniversary(item.date) : null
    
    return {
      ...item,
      days,
      next
    }
  }).sort((a, b) => {
    // 优先按照下一个周年日期排序（如果启用了周年纪念）
    if (a.isRepeatYearly && b.isRepeatYearly) {
      return a.next.days - b.next.days
    }
    // 其次按照已经过去的天数排序
    return b.days - a.days
  })
}

// 添加纪念日
const handleAddAnniversary = async () => {
  if (!formTitle.value.trim()) {
    errorMsg.value = '请输入纪念日标题'
    return
  }
  
  if (!formDate.value) {
    errorMsg.value = '请选择纪念日日期'
    return
  }
  
  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const result = addAnniversary(
    formTitle.value, 
    formDate.value, 
    formIcon.value, 
    formIsRepeatYearly.value
  )
  
  isLoading.value = false
  
  if (result.success) {
    successMsg.value = '添加成功'
    setTimeout(() => {
      successMsg.value = ''
    }, 2000)
    
    // 清空表单
    formTitle.value = ''
    formDate.value = ''
    formIcon.value = '🎂'
    formIsRepeatYearly.value = true
    
    // 重新加载数据
    loadAnniversaries()
    showAddForm.value = false
  } else {
    errorMsg.value = result.message
  }
}

// 删除纪念日
const handleDeleteAnniversary = (id) => {
  if (confirm('确定要删除这个纪念日吗？')) {
    deleteAnniversary(id)
    loadAnniversaries()
  }
}

// 取消添加
const cancelAdd = () => {
  showAddForm.value = false
  formTitle.value = ''
  formDate.value = ''
  formIcon.value = '🎂'
  formIsRepeatYearly.value = true
  errorMsg.value = ''
}

// 格式化展示日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 获取今天的日期（YYYY-MM-DD格式），用于日期输入框的max属性
const todayDate = computed(() => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
})

onMounted(() => {
  loadAnniversaries()
})
</script>

<template>
  <PageLayout title="纪念日">
    <div class="anniversary-container">
      <div class="action-bar">
        <button 
          v-if="!showAddForm" 
          class="add-button"
          @click="showAddForm = true"
        >
          <i class="icon-add"></i>
          <span>添加纪念日</span>
        </button>
      </div>
      
      <div v-if="showAddForm" class="add-form">
        <h3>添加纪念日</h3>
        <div class="form-group">
          <label>标题</label>
          <input
            type="text"
            v-model="formTitle"
            placeholder="输入纪念日标题"
          />
        </div>
        
        <div class="form-group">
          <label>日期</label>
          <input
            type="date"
            v-model="formDate"
            :max="todayDate"
          />
        </div>
        
        <div class="form-group">
          <label>选择图标</label>
          <div class="icon-selector">
            <div 
              v-for="icon in anniversaryIcons" 
              :key="icon"
              class="icon-option"
              :class="{ active: formIcon === icon }"
              @click="formIcon = icon"
            >
              <span>{{ icon }}</span>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <div class="checkbox-wrapper">
            <input 
              type="checkbox" 
              id="repeat-yearly" 
              v-model="formIsRepeatYearly"
            />
            <label for="repeat-yearly">每年重复</label>
          </div>
        </div>
        
        <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>
        <div v-if="successMsg" class="success-message">{{ successMsg }}</div>
        
        <div class="form-actions">
          <button class="cancel-button" @click="cancelAdd">取消</button>
          <button 
            class="submit-button" 
            @click="handleAddAnniversary"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">保存</span>
            <span v-else class="loading-spinner"></span>
          </button>
        </div>
      </div>
      
      <div class="anniversaries-list">
        <div v-if="anniversaries.length === 0" class="empty-state">
          <div class="empty-icon">🎂</div>
          <p>暂无纪念日，点击"添加纪念日"按钮开始吧</p>
        </div>
        
        <div 
          v-for="anniversary in anniversaries" 
          :key="anniversary.id" 
          class="anniversary-card"
        >
          <div class="anniversary-header">
            <div class="anniversary-icon">{{ anniversary.icon }}</div>
            <div class="anniversary-info">
              <h3 class="anniversary-title">{{ anniversary.title }}</h3>
              <div class="anniversary-date">{{ formatDate(anniversary.date) }}</div>
            </div>
            <button 
              class="delete-button" 
              @click.stop="handleDeleteAnniversary(anniversary.id)"
            >
              <i class="icon-delete"></i>
            </button>
          </div>
          
          <div class="anniversary-content">
            <div class="anniversary-days">
              <span class="days-number">{{ anniversary.days }}</span>
              <span class="days-label">天</span>
            </div>
            
            <div v-if="anniversary.isRepeatYearly" class="next-anniversary">
              <div class="next-info">
                <span>距离{{ anniversary.next.years }}周年还有</span>
                <span class="next-days">{{ anniversary.next.days }}天</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<style scoped>
.anniversary-container {
  max-width: 768px;
  margin: 0 auto;
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

.icon-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.icon-option {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.5rem;
}

.icon-option.active {
  background-color: var(--primary-color);
  color: white;
}

.icon-option:hover {
  transform: scale(1.05);
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
}

.checkbox-wrapper input[type="checkbox"] {
  margin-right: 0.5rem;
}

.checkbox-wrapper label {
  display: inline;
  margin-bottom: 0;
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

.anniversaries-list {
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

.anniversary-card {
  background-color: white;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  box-shadow: var(--card-shadow);
  overflow: hidden;
}

.anniversary-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.anniversary-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.anniversary-info {
  flex: 1;
}

.anniversary-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.anniversary-date {
  font-size: 0.85rem;
  color: var(--text-light);
}

.delete-button {
  background: none;
  border: none;
  color: var(--text-light);
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
}

.delete-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.icon-delete:before {
  content: "🗑️";
  font-size: 0.9rem;
}

.anniversary-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.anniversary-days {
  display: flex;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.days-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.days-label {
  font-size: 1.2rem;
  color: var(--text-light);
  margin-left: 0.25rem;
}

.next-anniversary {
  background-color: #f5f7fa;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  width: 100%;
  text-align: center;
}

.next-info {
  font-size: 0.9rem;
  color: var(--text-light);
}

.next-days {
  font-weight: 600;
  color: var(--primary-color);
  margin-left: 0.5rem;
}
</style> 