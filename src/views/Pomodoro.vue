<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import PageLayout from '../components/PageLayout.vue'
import { getCurrentUser } from '../utils/userService'
import { addPomodoroMinutes } from '../utils/statsService'

const router = useRouter()

// 番茄钟设置
const settings = reactive({
  workTime: 25, // 默认25分钟工作时间
  breakTime: 5, // 默认5分钟休息时间
  customWorkTime: '', // 自定义工作时间
  customBreakTime: '', // 自定义休息时间
})

// 番茄钟状态
const state = reactive({
  isRunning: false,
  isBreak: false,
  timeLeft: settings.workTime * 60, // 剩余时间(秒)
  timerInterval: null,
  completedPomodoros: 0,
})

// 验证错误信息
const workTimeError = ref('')
const breakTimeError = ref('')

// 确认对话框状态
const showConfirmDialog = ref(false)
const dialogAction = ref(null)

// 返回时进行确认
const confirmBack = () => {
  if (state.isRunning) {
    showConfirmDialog.value = true
    dialogAction.value = 'back'
  } else {
    router.back()
  }
}

// 重置时进行确认
const confirmReset = () => {
  if (state.isRunning) {
    showConfirmDialog.value = true
    dialogAction.value = 'reset'
  } else {
    resetTimer()
  }
}

// 执行确认的操作
const executeConfirmedAction = () => {
  if (dialogAction.value === 'back') {
    stopTimer()
    router.back()
  } else if (dialogAction.value === 'reset') {
    resetTimer()
  }
  showConfirmDialog.value = false
}

// 取消确认
const cancelConfirmAction = () => {
  showConfirmDialog.value = false
}

// 格式化时间显示
const formattedTimeLeft = computed(() => {
  const minutes = Math.floor(state.timeLeft / 60)
  const seconds = state.timeLeft % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// 页面标题
const pageTitle = computed(() => {
  return state.isBreak ? '休息时间' : '专注时间'
})

// 进度百分比
const progressPercentage = computed(() => {
  const totalTime = state.isBreak 
    ? settings.breakTime * 60 
    : settings.workTime * 60
  return (1 - state.timeLeft / totalTime) * 100
})

// 启动定时器
const startTimer = () => {
  if (state.isRunning) return
  
  state.isRunning = true
  state.timerInterval = setInterval(() => {
    if (state.timeLeft > 0) {
      state.timeLeft--
    } else {
      // 时间结束
      clearInterval(state.timerInterval)
      
      if (!state.isBreak) {
        // 工作时间结束，记录完成一个番茄钟
        state.completedPomodoros++
        
        // 更新用户统计数据
        const user = getCurrentUser()
        if (user) {
          addPomodoroMinutes(user.username, settings.workTime)
        }
        
        // 切换到休息时间
        state.isBreak = true
        state.timeLeft = settings.breakTime * 60
        playSound()
      } else {
        // 休息时间结束，切换回工作时间
        state.isBreak = false
        state.timeLeft = settings.workTime * 60
        playSound()
      }
      
      // 自动继续下一个周期
      startTimer()
    }
  }, 1000)
}

// 停止定时器
const stopTimer = () => {
  if (!state.isRunning) return
  
  clearInterval(state.timerInterval)
  state.isRunning = false
}

// 重置定时器
const resetTimer = () => {
  stopTimer()
  state.isBreak = false
  state.timeLeft = settings.workTime * 60
}

// 播放声音提示
const playSound = () => {
  try {
    const audio = new Audio()
    audio.src = state.isBreak 
      ? '/sounds/break.mp3' 
      : '/sounds/work.mp3'
    audio.play()
  } catch (e) {
    console.error('无法播放声音', e)
  }
}

// 更改工作时间
const changeWorkTime = (minutes) => {
  if (state.isRunning) return
  
  settings.workTime = minutes
  settings.customWorkTime = '' // 清空自定义输入
  workTimeError.value = '' // 清空错误信息
  
  if (!state.isBreak) {
    state.timeLeft = minutes * 60
  }
}

// 更改休息时间
const changeBreakTime = (minutes) => {
  if (state.isRunning) return
  
  settings.breakTime = minutes
  settings.customBreakTime = '' // 清空自定义输入
  breakTimeError.value = '' // 清空错误信息
  
  if (state.isBreak) {
    state.timeLeft = minutes * 60
  }
}

// 应用自定义工作时间
const applyCustomWorkTime = () => {
  if (state.isRunning) return
  
  if (!settings.customWorkTime) {
    return
  }
  
  const customMinutes = parseInt(settings.customWorkTime)
  
  if (isNaN(customMinutes) || customMinutes <= 0) {
    workTimeError.value = '请输入有效的分钟数'
    return
  }
  
  if (customMinutes > 120) {
    workTimeError.value = '时间不能超过120分钟'
    return
  }
  
  settings.workTime = customMinutes
  workTimeError.value = ''
  
  if (!state.isBreak) {
    state.timeLeft = customMinutes * 60
  }
}

// 应用自定义休息时间
const applyCustomBreakTime = () => {
  if (state.isRunning) return
  
  if (!settings.customBreakTime) {
    return
  }
  
  const customMinutes = parseInt(settings.customBreakTime)
  
  if (isNaN(customMinutes) || customMinutes <= 0) {
    breakTimeError.value = '请输入有效的分钟数'
    return
  }
  
  if (customMinutes > 60) {
    breakTimeError.value = '时间不能超过60分钟'
    return
  }
  
  settings.breakTime = customMinutes
  breakTimeError.value = ''
  
  if (state.isBreak) {
    state.timeLeft = customMinutes * 60
  }
}

// 组件卸载前清除定时器
onBeforeUnmount(() => {
  if (state.timerInterval) {
    clearInterval(state.timerInterval)
  }
})

// 自定义返回按钮行为
const customBack = () => {
  confirmBack()
  return false // 阻止默认返回行为
}
</script>

<template>
  <PageLayout 
    :title="pageTitle" 
    :customBackAction="customBack"
  >
    <div class="pomodoro-container">
      <div class="timer-display">
        <div class="timer-circle" :class="{ 'is-break': state.isBreak }">
          <div class="progress-ring">
            <svg class="progress-ring-svg" viewBox="0 0 100 100">
              <circle
                class="progress-ring-circle-bg"
                cx="50"
                cy="50"
                r="45"
              />
              <circle
                class="progress-ring-circle"
                cx="50"
                cy="50"
                r="45"
                :style="{
                  strokeDashoffset: (283 - (283 * progressPercentage) / 100) + 'px',
                  stroke: state.isBreak ? 'var(--success-color)' : 'var(--primary-color)'
                }"
              />
            </svg>
          </div>
          <div class="timer-content">
            <div class="timer-time">{{ formattedTimeLeft }}</div>
            <div class="timer-label">{{ state.isBreak ? '休息中' : '专注中' }}</div>
          </div>
        </div>
      </div>
      
      <div class="timer-controls">
        <button 
          v-if="!state.isRunning" 
          class="start-button" 
          @click="startTimer"
        >
          开始
        </button>
        <button 
          v-else 
          class="pause-button" 
          @click="stopTimer"
        >
          暂停
        </button>
        <button class="reset-button" @click="confirmReset">重置</button>
      </div>
      
      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">{{ state.completedPomodoros }}</div>
          <div class="stat-label">完成番茄数</div>
        </div>
      </div>
      
      <div class="settings-panel">
        <h3 class="settings-title">时间设置</h3>
        
        <div class="settings-group">
          <div class="settings-label">工作时长</div>
          <div class="time-buttons">
            <button 
              v-for="time in [15, 25, 30, 45]" 
              :key="time"
              class="time-button" 
              :class="{ active: settings.workTime === time && !settings.customWorkTime }"
              @click="changeWorkTime(time)"
              :disabled="state.isRunning"
            >
              {{ time }}分钟
            </button>
          </div>
          
          <div class="custom-time-input">
            <div class="input-container">
              <input 
                type="number" 
                v-model="settings.customWorkTime"
                placeholder="自定义(1-120)"
                min="1"
                max="120"
                :disabled="state.isRunning"
                @keyup.enter="applyCustomWorkTime"
              />
              <button 
                class="apply-button" 
                @click="applyCustomWorkTime"
                :disabled="state.isRunning || !settings.customWorkTime"
              >
                应用
              </button>
            </div>
            <div v-if="workTimeError" class="time-error">{{ workTimeError }}</div>
          </div>
        </div>
        
        <div class="settings-group">
          <div class="settings-label">休息时长</div>
          <div class="time-buttons">
            <button 
              v-for="time in [5, 10, 15]" 
              :key="time"
              class="time-button" 
              :class="{ active: settings.breakTime === time && !settings.customBreakTime }"
              @click="changeBreakTime(time)"
              :disabled="state.isRunning"
            >
              {{ time }}分钟
            </button>
          </div>
          
          <div class="custom-time-input">
            <div class="input-container">
              <input 
                type="number" 
                v-model="settings.customBreakTime"
                placeholder="自定义(1-60)"
                min="1"
                max="60"
                :disabled="state.isRunning"
                @keyup.enter="applyCustomBreakTime"
              />
              <button 
                class="apply-button" 
                @click="applyCustomBreakTime"
                :disabled="state.isRunning || !settings.customBreakTime"
              >
                应用
              </button>
            </div>
            <div v-if="breakTimeError" class="time-error">{{ breakTimeError }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 确认对话框 -->
    <div class="dialog-overlay" v-if="showConfirmDialog">
      <div class="dialog-content">
        <h3>确认操作</h3>
        <p>计时器正在运行，确定要{{ dialogAction === 'back' ? '返回' : '重置' }}吗？</p>
        <div class="dialog-actions">
          <button class="cancel-button" @click="cancelConfirmAction">取消</button>
          <button class="confirm-button" @click="executeConfirmedAction">确定</button>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<style scoped>
.pomodoro-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
}

.timer-display {
  margin-bottom: 2rem;
}

.timer-circle {
  position: relative;
  width: 250px;
  height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

.progress-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.progress-ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring-circle-bg {
  fill: none;
  stroke: #f5f5f5;
  stroke-width: 5;
}

.progress-ring-circle {
  fill: none;
  stroke: var(--primary-color);
  stroke-width: 5;
  stroke-dasharray: 283;
  transition: stroke-dashoffset 0.5s;
}

.timer-content {
  text-align: center;
  z-index: 1;
}

.timer-time {
  font-size: 3rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.timer-label {
  font-size: 1.2rem;
  color: var(--text-light);
}

.timer-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.start-button, .pause-button, .reset-button {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.start-button {
  background-color: var(--primary-color);
  color: white;
}

.pause-button {
  background-color: var(--danger-color);
  color: white;
}

.reset-button {
  background-color: #f5f5f5;
  color: var(--text-color);
}

.start-button:active, .pause-button:active, .reset-button:active {
  transform: scale(0.98);
}

.stats {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.stat-item {
  text-align: center;
  padding: 1rem 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: var(--card-shadow);
}

.stat-value {
  font-size: 2rem;
  font-weight: 600;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-light);
}

.settings-panel {
  width: 100%;
  background-color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
}

.settings-title {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: var(--text-color);
  text-align: center;
}

.settings-group {
  margin-bottom: 1.5rem;
}

.settings-group:last-child {
  margin-bottom: 0;
}

.settings-label {
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: var(--text-color);
}

.time-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.time-button {
  flex: 1;
  min-width: calc(50% - 0.5rem);
  padding: 0.75rem;
  background-color: #f5f5f5;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
}

.time-button.active {
  background-color: var(--primary-color);
  color: white;
}

.time-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 自定义时间输入 */
.custom-time-input {
  margin-top: 0.5rem;
}

.input-container {
  display: flex;
  gap: 0.5rem;
}

.custom-time-input input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 0.9rem;
  outline: none;
}

.custom-time-input input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.apply-button {
  padding: 0 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.apply-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #ccc;
}

.time-error {
  color: var(--danger-color);
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

/* 确认对话框 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 1rem;
}

.dialog-content {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 320px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.dialog-content h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
  color: var(--text-color);
}

.dialog-content p {
  margin-bottom: 1.5rem;
  color: var(--text-light);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
}

.cancel-button, .confirm-button {
  padding: 0.6rem 1rem;
  border-radius: 0.4rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-size: 0.9rem;
}

.cancel-button {
  background-color: #f5f5f5;
  color: var(--text-color);
}

.confirm-button {
  background-color: var(--danger-color);
  color: white;
}
</style> 