<script setup>
import { ref, onMounted, computed } from 'vue'
import PageLayout from '../components/PageLayout.vue'
import { 
  getWaterRecords, 
  addWaterRecord, 
  deleteWaterRecord, 
  getTodayWaterAmount, 
  getWeekWaterData,
  getWaterSettings,
  saveWaterSettings
} from '../utils/waterService'

const records = ref([])
const todayAmount = ref(0)
const weekData = ref([])
const showSettings = ref(false)
const settings = ref({
  dailyGoal: 2000,
  cupSize: 250,
  remindEnabled: false,
  remindInterval: 60
})
const errorMsg = ref('')
const successMsg = ref('')

// 加载数据
const loadData = () => {
  // 获取用户设置
  const userSettings = getWaterSettings()
  if (userSettings) {
    settings.value = userSettings
  }
  
  // 获取今日饮水量
  todayAmount.value = getTodayWaterAmount()
  
  // 获取一周饮水数据
  weekData.value = getWeekWaterData()
  
  // 获取今日详细饮水记录
  const allRecords = getWaterRecords()
  const today = new Date().toISOString().split('T')[0]
  const todayRecord = allRecords.find(r => r.date === today)
  
  if (todayRecord) {
    records.value = todayRecord.details.sort((a, b) => new Date(b.time) - new Date(a.time))
  } else {
    records.value = []
  }
}

// 快速添加饮水量
const quickAddWater = (amount) => {
  const result = addWaterRecord(amount)
  
  if (result.success) {
    showSuccessMessage('记录成功')
    loadData()
  } else {
    showErrorMessage(result.message)
  }
}

// 删除记录
const handleDeleteRecord = (recordId) => {
  if (confirm('确定要删除这条记录吗？')) {
    const result = deleteWaterRecord(recordId)
    
    if (result.success) {
      showSuccessMessage('删除成功')
      loadData()
    } else {
      showErrorMessage(result.message)
    }
  }
}

// 保存设置
const saveUserSettings = () => {
  const result = saveWaterSettings(settings.value)
  
  if (result.success) {
    showSuccessMessage('设置已保存')
    showSettings.value = false
  } else {
    showErrorMessage(result.message)
  }
}

// 取消设置
const cancelSettings = () => {
  // 重新加载原始设置
  const userSettings = getWaterSettings()
  if (userSettings) {
    settings.value = userSettings
  }
  showSettings.value = false
}

// 显示成功消息
const showSuccessMessage = (message) => {
  successMsg.value = message
  setTimeout(() => {
    successMsg.value = ''
  }, 2000)
}

// 显示错误消息
const showErrorMessage = (message) => {
  errorMsg.value = message
  setTimeout(() => {
    errorMsg.value = ''
  }, 3000)
}

// 进度百分比
const progressPercentage = computed(() => {
  const percentage = (todayAmount.value / settings.value.dailyGoal) * 100
  return Math.min(percentage, 100)
})

// 格式化饮水量单位
const formatAmount = (ml) => {
  return ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`
}

// 格式化时间
const formatTime = (isoString) => {
  const date = new Date(isoString)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 格式化日期（短格式，用于周数据显示）
const formatShortDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <PageLayout title="饮水习惯">
    <div class="water-container">
      <div class="water-progress-card">
        <div class="progress-header">
          <h3>今日饮水量</h3>
          <button class="settings-button" @click="showSettings = true">
            <i class="icon-settings"></i>
          </button>
        </div>
        
        <div class="progress-circle">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle 
              class="progress-bg" 
              cx="50" 
              cy="50" 
              r="45"
            />
            <circle 
              class="progress-bar" 
              cx="50" 
              cy="50" 
              r="45"
              :style="{ 
                strokeDashoffset: 280 - (280 * progressPercentage / 100),
                stroke: progressPercentage >= 100 ? 'var(--success-color)' : 'var(--primary-color)'
              }"
            />
          </svg>
          <div class="progress-content">
            <div class="progress-amount">{{ formatAmount(todayAmount) }}</div>
            <div class="progress-goal">目标: {{ formatAmount(settings.dailyGoal) }}</div>
          </div>
        </div>
        
        <div class="quick-actions">
          <button 
            class="quick-button"
            @click="quickAddWater(settings.cupSize)"
          >
            <i class="icon-cup"></i>
            <span>{{ formatAmount(settings.cupSize) }}</span>
          </button>
          <button 
            class="quick-button"
            @click="quickAddWater(settings.cupSize * 2)"
          >
            <i class="icon-bottle"></i>
            <span>{{ formatAmount(settings.cupSize * 2) }}</span>
          </button>
          <button 
            class="quick-button"
            @click="quickAddWater(500)"
          >
            <i class="icon-big-bottle"></i>
            <span>500ml</span>
          </button>
        </div>
        
        <div v-if="successMsg" class="success-message">
          <i class="icon-success"></i>
          <span>{{ successMsg }}</span>
        </div>
        
        <div v-if="errorMsg" class="error-message">
          <i class="icon-warning"></i>
          <span>{{ errorMsg }}</span>
        </div>
      </div>
      
      <div class="weekly-chart">
        <h3>本周饮水统计</h3>
        <div class="chart-container">
          <div 
            v-for="(day, index) in weekData" 
            :key="index"
            class="chart-bar-container"
          >
            <div class="chart-label">{{ formatShortDate(day.date) }}</div>
            <div class="chart-bar-wrapper">
              <div 
                class="chart-bar" 
                :style="{ 
                  height: `${Math.min(day.amount / settings.dailyGoal * 100, 100)}%`,
                  backgroundColor: day.amount >= settings.dailyGoal ? 'var(--success-color)' : 'var(--primary-color)'
                }"
              ></div>
            </div>
            <div class="chart-value">{{ formatAmount(day.amount) }}</div>
          </div>
        </div>
      </div>
      
      <div class="records-section">
        <h3>今日记录</h3>
        <div class="records-list">
          <div v-if="records.length === 0" class="empty-state">
            <div class="empty-icon">💧</div>
            <p>今天还没有饮水记录，点击上方按钮记录吧</p>
          </div>
          
          <div 
            v-for="record in records" 
            :key="record.id" 
            class="record-item"
          >
            <div class="record-info">
              <div class="record-icon">💧</div>
              <div class="record-amount">{{ formatAmount(record.amount) }}</div>
              <div class="record-time">{{ formatTime(record.time) }}</div>
            </div>
            <button 
              class="delete-button" 
              @click="handleDeleteRecord(record.id)"
            >
              <i class="icon-delete"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 设置对话框 -->
      <div v-if="showSettings" class="settings-overlay">
        <div class="settings-modal">
          <h3>饮水设置</h3>
          
          <div class="form-group">
            <label>每日目标 (ml)</label>
            <input 
              type="number" 
              v-model.number="settings.dailyGoal" 
              min="500" 
              max="5000" 
              step="100"
            />
          </div>
          
          <div class="form-group">
            <label>默认杯子容量 (ml)</label>
            <input 
              type="number" 
              v-model.number="settings.cupSize" 
              min="50" 
              max="1000" 
              step="50"
            />
          </div>
          
          <div class="form-group">
            <div class="checkbox-wrapper">
              <input 
                type="checkbox" 
                id="remind-enabled" 
                v-model="settings.remindEnabled"
              />
              <label for="remind-enabled">启用提醒</label>
            </div>
          </div>
          
          <div class="form-group" v-if="settings.remindEnabled">
            <label>提醒间隔 (分钟)</label>
            <select v-model.number="settings.remindInterval">
              <option value="30">30分钟</option>
              <option value="60">1小时</option>
              <option value="90">1.5小时</option>
              <option value="120">2小时</option>
            </select>
          </div>
          
          <div class="form-actions">
            <button class="cancel-button" @click="cancelSettings">取消</button>
            <button class="save-button" @click="saveUserSettings">保存</button>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<style scoped>
.water-container {
  width: 100%;
}

.water-progress-card {
  background-color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--card-shadow);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-color);
}

.settings-button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.settings-button:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.icon-settings:before {
  content: "⚙️";
  font-size: 1.2rem;
}

.progress-circle {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 1.5rem;
}

.progress-bg {
  fill: none;
  stroke: #f0f0f0;
  stroke-width: 8;
}

.progress-bar {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  transform-origin: center;
  transform: rotate(-90deg);
  stroke-dasharray: 280;
  transition: stroke-dashoffset 0.5s ease;
}

.progress-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-amount {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.progress-goal {
  font-size: 1rem;
  color: var(--text-light);
}

.quick-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.quick-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0.5rem;
  background-color: #f5f7fa;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-button:active {
  transform: scale(0.98);
  background-color: #e9ecef;
}

.quick-button i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.quick-button span {
  font-size: 0.9rem;
  color: var(--text-color);
}

.icon-cup:before {
  content: "🥛";
}

.icon-bottle:before {
  content: "🥤";
}

.icon-big-bottle:before {
  content: "🍶";
}

.success-message, .error-message {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.success-message {
  background-color: rgba(46, 204, 113, 0.1);
  color: var(--success-color);
}

.error-message {
  background-color: rgba(231, 76, 60, 0.1);
  color: var(--danger-color);
}

.icon-success:before {
  content: "✅";
  margin-right: 0.5rem;
}

.icon-warning:before {
  content: "⚠️";
  margin-right: 0.5rem;
}

.weekly-chart {
  background-color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--card-shadow);
}

.weekly-chart h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.2rem;
  color: var(--text-color);
}

.chart-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 200px;
}

.chart-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-label {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.chart-bar-wrapper {
  width: 100%;
  height: 150px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.chart-bar {
  width: 70%;
  min-height: 4px;
  background-color: var(--primary-color);
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
}

.chart-value {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 0.5rem;
}

.records-section {
  background-color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--card-shadow);
}

.records-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: var(--text-color);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  color: var(--text-light);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.record-item:last-child {
  border-bottom: none;
}

.record-info {
  display: flex;
  align-items: center;
}

.record-icon {
  margin-right: 0.75rem;
  font-size: 1.5rem;
}

.record-amount {
  font-weight: 600;
  margin-right: 0.75rem;
  color: var(--primary-color);
}

.record-time {
  color: var(--text-light);
  font-size: 0.9rem;
}

.delete-button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  border-radius: 50%;
  transition: all 0.2s;
}

.delete-button:hover {
  opacity: 1;
}

.delete-button:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.icon-delete:before {
  content: "🗑️";
  font-size: 0.9rem;
}

.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  padding: 1rem;
}

.settings-modal {
  background-color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.settings-modal h3 {
  margin: 0 0 1.5rem 0;
  text-align: center;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: var(--text-light);
}

input[type="number"],
select {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all var(--transition-time);
}

input:focus,
select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
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

.form-actions {
  display: flex;
  gap: 1rem;
}

.cancel-button, .save-button {
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

.save-button {
  background-color: var(--primary-color);
  color: white;
}
</style> 