<template>
  <PageLayout title="赛博木鱼" :showBack="true">
    <div class="woodfish-container">
      <div class="merit-display">
        <div class="merit-value">{{ woodfishData.merits }}</div>
        <div class="merit-label">功德值</div>
      </div>
      
      <div class="woodfish-stats">
        <div class="stat-item">
          <div class="stat-value">{{ woodfishData.todayHits }}</div>
          <div class="stat-label">今日敲击</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ woodfishData.totalHits }}</div>
          <div class="stat-label">总敲击</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ woodfishData.continuousDays }}</div>
          <div class="stat-label">连续天数</div>
        </div>
      </div>
      
      <div class="woodfish-interactive">
        <div class="woodfish-wrapper" @click="hitWoodfishAction">
          <div class="ripple" v-show="showRipple"></div>
          <img 
            src="../assets/woodfish.svg" 
            class="woodfish-image" 
            :class="{ 'woodfish-hit': isHitting }" 
            alt="赛博木鱼"
          />
        </div>
        <div class="woodfish-instruction">点击木鱼积攒功德</div>
        <div v-if="showMeritIncrease" class="merit-increase">+1</div>
      </div>
      
      <div class="achievements-section" v-if="woodfishData.achievements.length > 0">
        <h3 class="section-title">我的成就</h3>
        <div class="achievements-list">
          <div 
            v-for="achievement in woodfishData.achievements" 
            :key="achievement.id" 
            class="achievement-item"
          >
            <div class="achievement-icon">🏆</div>
            <div class="achievement-details">
              <div class="achievement-name">{{ achievement.name }}</div>
              <div class="achievement-description">{{ achievement.description }}</div>
              <div class="achievement-date">{{ formatDate(achievement.date) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import PageLayout from '../components/PageLayout.vue'
import { getWoodfishData, hitWoodfish } from '../utils/woodfishService'

// 木鱼数据
const woodfishData = ref({
  merits: 0,
  totalHits: 0,
  todayHits: 0,
  continuousDays: 0,
  achievements: []
})

// 敲击动画状态
const isHitting = ref(false)
const showRipple = ref(false)
const showMeritIncrease = ref(false)

// 敲击音效
const hitSound = new Audio()

// 初始化
onMounted(() => {
  loadWoodfishData()
  
  // 加载敲击音效
  try {
    hitSound.src = '/woodfish-sound.mp3'
    hitSound.load()
  } catch (error) {
    console.error('加载音效失败:', error)
  }
})

// 加载木鱼数据
const loadWoodfishData = () => {
  const data = getWoodfishData()
  if (data) {
    woodfishData.value = data
  }
}

// 敲击木鱼动作
const hitWoodfishAction = () => {
  // 播放音效
  try {
    hitSound.currentTime = 0
    hitSound.play()
  } catch (error) {
    console.error('播放音效失败:', error)
  }
  
  // 敲击动画
  isHitting.value = true
  setTimeout(() => {
    isHitting.value = false
  }, 300)
  
  // 水波纹动画
  showRipple.value = true
  setTimeout(() => {
    showRipple.value = false
  }, 600)
  
  // 功德增加动画
  showMeritIncrease.value = true
  setTimeout(() => {
    showMeritIncrease.value = false
  }, 1000)
  
  // 处理敲击逻辑
  const result = hitWoodfish()
  if (result.success) {
    loadWoodfishData() // 重新加载最新数据
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.woodfish-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.merit-display {
  text-align: center;
  margin-bottom: 2rem;
}

.merit-value {
  font-size: 3rem;
  font-weight: bold;
  color: var(--primary-color);
}

.merit-label {
  font-size: 1rem;
  color: #666;
}

.woodfish-stats {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.woodfish-interactive {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  width: 100%;
  position: relative;
}

.woodfish-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
}

.woodfish-image {
  width: 150px;
  height: 150px;
  cursor: pointer;
  transition: transform 0.2s;
  user-select: none;
  position: relative;
  z-index: 2;
}

.woodfish-hit {
  transform: scale(0.9);
}

.woodfish-instruction {
  color: #666;
  font-size: 0.9rem;
}

.ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background-color: transparent;
  border-radius: 50%;
  z-index: 1;
  animation: ripple 0.6s ease-out;
}

.merit-increase {
  position: absolute;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  animation: floatUp 1s ease-out forwards;
  top: 50px;
  opacity: 0;
}

.achievements-section {
  width: 100%;
  background-color: white;
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
  text-align: center;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.achievement-item {
  display: flex;
  align-items: center;
  padding: 0.8rem;
  background-color: #f9f9f9;
  border-radius: 0.5rem;
  border-left: 4px solid var(--primary-color);
}

.achievement-icon {
  font-size: 1.8rem;
  margin-right: 1rem;
}

.achievement-details {
  flex: 1;
}

.achievement-name {
  font-weight: bold;
  margin-bottom: 0.2rem;
}

.achievement-description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.2rem;
}

.achievement-date {
  font-size: 0.8rem;
  color: #999;
}

@keyframes ripple {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb), 0.6);
  }
  100% {
    box-shadow: 0 0 0 60px rgba(var(--primary-color-rgb), 0);
  }
}

@keyframes floatUp {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translateY(-50px);
    opacity: 0;
  }
}
</style> 