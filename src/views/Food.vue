<script setup>
import { ref, onMounted, computed } from 'vue'
import PageLayout from '../components/PageLayout.vue'
import { getFoodList, addFood, deleteFood, getRandomFood, foodTypes, initDefaultFoodList } from '../utils/foodService'

// 状态变量
const foodList = ref([])
const randomResult = ref(null)
const isAnimating = ref(false)
const showAddForm = ref(false)
const newFoodName = ref('')
const newFoodType = ref('正餐')
const errorMsg = ref('')
const successMsg = ref('')
const activeTab = ref('recommend') // recommend, manage
const searchQuery = ref('')
const selectedType = ref(null) // 用于随机推荐时筛选食品类型

// 加载食品库
const loadFoodList = () => {
  foodList.value = getFoodList()
  if (foodList.value.length === 0) {
    initDefaultFoodList()
    foodList.value = getFoodList()
  }
}

// 筛选后的食品列表
const filteredFoodList = computed(() => {
  if (!searchQuery.value) return foodList.value
  
  const query = searchQuery.value.toLowerCase()
  return foodList.value.filter(food => 
    food.name.toLowerCase().includes(query) || 
    food.type.toLowerCase().includes(query)
  )
})

// 按类型分组的食品
const groupedFoodList = computed(() => {
  const groups = {}
  
  // 初始化所有类型
  foodTypes.forEach(type => {
    groups[type] = []
  })
  
  // 对食品进行分组
  filteredFoodList.value.forEach(food => {
    if (groups[food.type]) {
      groups[food.type].push(food)
    } else {
      groups['其他'].push(food)
    }
  })
  
  return groups
})

// 随机推荐
const getRecommendation = () => {
  // 如果已经在动画中，不执行操作
  if (isAnimating.value) return
  
  isAnimating.value = true
  randomResult.value = null
  errorMsg.value = ''
  
  // 生成随机食品展示的动画效果
  let counter = 0
  const totalAnimationTime = 2000 // 2秒动画
  const interval = 100 // 每100毫秒更新一次
  const maxIterations = totalAnimationTime / interval
  
  const animationInterval = setInterval(() => {
    counter++
    
    // 生成一个随机食品用于动画
    const result = getRandomFood(selectedType.value)
    
    if (result.success) {
      randomResult.value = result.food
    } else {
      clearInterval(animationInterval)
      errorMsg.value = result.message
      isAnimating.value = false
      return
    }
    
    // 动画完成
    if (counter >= maxIterations) {
      clearInterval(animationInterval)
      
      // 最后一次生成真正的随机结果
      const finalResult = getRandomFood(selectedType.value)
      if (finalResult.success) {
        setTimeout(() => {
          randomResult.value = finalResult.food
          isAnimating.value = false
        }, 300)
      } else {
        errorMsg.value = finalResult.message
        isAnimating.value = false
      }
    }
  }, interval)
}

// 添加食品
const handleAddFood = () => {
  errorMsg.value = ''
  successMsg.value = ''
  
  if (!newFoodName.value || newFoodName.value.trim() === '') {
    errorMsg.value = '请输入食品名称'
    return
  }
  
  const result = addFood(newFoodName.value, newFoodType.value)
  
  if (result.success) {
    successMsg.value = '添加成功'
    newFoodName.value = ''
    loadFoodList()
    
    setTimeout(() => {
      successMsg.value = ''
    }, 2000)
  } else {
    errorMsg.value = result.message
  }
}

// 删除食品
const handleDeleteFood = (id) => {
  if (confirm('确定要删除这个食品吗？')) {
    deleteFood(id)
    loadFoodList()
    
    // 如果删除的是当前随机显示的食品，重置显示
    if (randomResult.value && randomResult.value.id === id) {
      randomResult.value = null
    }
  }
}

// 切换到管理页面
const showManage = () => {
  activeTab.value = 'manage'
}

// 切换到推荐页面
const showRecommend = () => {
  activeTab.value = 'recommend'
}

// 显示添加表单
const toggleAddForm = () => {
  showAddForm.value = !showAddForm.value
  if (showAddForm.value) {
    newFoodName.value = ''
    errorMsg.value = ''
  }
}

// 设置筛选类型
const setFilterType = (type) => {
  if (selectedType.value === type) {
    selectedType.value = null // 再次点击同一类型时取消选择
  } else {
    selectedType.value = type
  }
  // 清除当前显示的结果
  randomResult.value = null
  errorMsg.value = ''
}

// 获取可推荐的食品类型数量
const getTypeCount = (type) => {
  if (!type) return foodList.value.length
  return foodList.value.filter(food => food.type === type).length
}

onMounted(() => {
  loadFoodList()
})
</script>

<template>
  <PageLayout title="今天吃点啥">
    <div class="food-container">
      <!-- 顶部导航 -->
      <div class="nav-tabs">
        <div 
          class="nav-tab" 
          :class="{ active: activeTab === 'recommend' }"
          @click="showRecommend"
        >
          随机推荐
        </div>
        <div 
          class="nav-tab" 
          :class="{ active: activeTab === 'manage' }"
          @click="showManage"
        >
          食品管理
        </div>
      </div>
      
      <!-- 随机推荐面板 -->
      <div v-if="activeTab === 'recommend'" class="recommend-panel">
        <!-- 类型选择器 -->
        <div class="type-filter">
          <div class="filter-label">按类型筛选：</div>
          <div class="filter-buttons">
            <button 
              class="filter-button" 
              :class="{ active: selectedType === null }"
              @click="setFilterType(null)"
            >
              全部 ({{ getTypeCount(null) }})
            </button>
            <button 
              v-for="type in foodTypes" 
              :key="type"
              class="filter-button"
              :class="{ active: selectedType === type }"
              @click="setFilterType(type)"
              :disabled="getTypeCount(type) === 0"
            >
              {{ type }} ({{ getTypeCount(type) }})
            </button>
          </div>
        </div>
        
        <div class="result-display" :class="{ 'is-animating': isAnimating }">
          <div v-if="randomResult" class="food-result">
            <div class="food-name">{{ randomResult.name }}</div>
            <div class="food-type">{{ randomResult.type }}</div>
          </div>
          <div v-else class="placeholder-text">
            <span v-if="selectedType">从"{{ selectedType }}"类型中随机推荐</span>
            <span v-else>点击下方按钮获取推荐</span>
          </div>
        </div>
        
        <button 
          class="recommend-button" 
          @click="getRecommendation"
          :disabled="isAnimating"
        >
          <span v-if="!isAnimating">随机推荐</span>
          <span v-else>思考中...</span>
        </button>
        
        <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>
      </div>
      
      <!-- 食品管理面板 -->
      <div v-if="activeTab === 'manage'" class="manage-panel">
        <div class="action-bar">
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="搜索食品..." 
            />
          </div>
          
          <button class="add-button" @click="toggleAddForm">
            <i class="icon-add"></i>
            <span>添加食品</span>
          </button>
        </div>
        
        <!-- 添加食品表单 -->
        <div v-if="showAddForm" class="add-form">
          <div class="form-group">
            <label>食品名称</label>
            <input 
              type="text" 
              v-model="newFoodName" 
              placeholder="输入食品名称" 
            />
          </div>
          
          <div class="form-group">
            <label>食品类型</label>
            <select v-model="newFoodType">
              <option v-for="type in foodTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>
          
          <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>
          <div v-if="successMsg" class="success-message">{{ successMsg }}</div>
          
          <div class="form-actions">
            <button class="cancel-button" @click="toggleAddForm">取消</button>
            <button class="submit-button" @click="handleAddFood">保存</button>
          </div>
        </div>
        
        <!-- 食品列表 -->
        <div class="food-list">
          <div v-for="(foods, type) in groupedFoodList" :key="type">
            <div v-if="foods.length > 0" class="food-group">
              <h3 class="group-title">{{ type }}</h3>
              <div class="food-items">
                <div 
                  v-for="food in foods" 
                  :key="food.id" 
                  class="food-item"
                >
                  <div class="food-info">
                    <div class="food-name">{{ food.name }}</div>
                  </div>
                  <button 
                    class="delete-button" 
                    @click="handleDeleteFood(food.id)"
                  >
                    <i class="icon-delete"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="filteredFoodList.length === 0" class="empty-state">
            <p>没有找到符合条件的食品</p>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<style scoped>
.food-container {
  width: 100%;
}

.nav-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}

.nav-tab {
  padding: 0.8rem 1rem;
  cursor: pointer;
  font-weight: 500;
  color: var(--text-light);
  transition: all 0.2s;
  position: relative;
}

.nav-tab.active {
  color: var(--primary-color);
}

.nav-tab.active:after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--primary-color);
}

.recommend-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

/* 类型筛选器样式 */
.type-filter {
  width: 100%;
  margin-bottom: 1.5rem;
}

.filter-label {
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-light);
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-button {
  padding: 0.5rem 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 2rem;
  background: none;
  font-size: 0.9rem;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-button.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.result-display {
  width: 100%;
  height: 200px;
  background-color: var(--bg-card);
  border-radius: 1rem;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  transition: all var(--transition-time);
}

.result-display.is-animating {
  transform: scale(1.02);
  box-shadow: 0 8px 30px rgba(var(--primary-color-rgb), 0.2);
}

.food-result {
  text-align: center;
}

.food-name {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.food-type {
  font-size: 1rem;
  color: var(--text-light);
}

.placeholder-text {
  color: var(--text-light);
  font-size: 1.2rem;
}

.recommend-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 2rem;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(var(--primary-color-rgb), 0.3);
}

.recommend-button:not(:disabled):active {
  transform: scale(0.98);
}

.recommend-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.manage-panel {
  padding: 0.5rem 0;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.search-box {
  flex: 1;
  margin-right: 1rem;
}

.search-box input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 2rem;
  font-size: 0.9rem;
  transition: all var(--transition-time);
}

.search-box input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
}

.add-button {
  display: flex;
  align-items: center;
  padding: 0.7rem 1rem;
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

.icon-add {
  margin-right: 0.5rem;
}

.icon-add:before {
  content: "+";
}

.icon-delete:before {
  content: "×";
}

.add-form {
  background-color: var(--bg-card);
  border-radius: 0.8rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--card-shadow);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-light);
}

input[type="text"], select {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: var(--bg-card);
  color: var(--text-color);
  transition: all var(--transition-time);
}

input:focus, select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
}

.error-message {
  color: var(--danger-color);
  margin: 1rem 0;
  font-size: 0.9rem;
}

.success-message {
  color: var(--success-color);
  margin: 1rem 0;
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
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-color);
}

.submit-button {
  background-color: var(--primary-color);
  color: white;
}

.food-list {
  margin-top: 1rem;
}

.food-group {
  margin-bottom: 1.5rem;
}

.group-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  display: flex;
  align-items: center;
}

.food-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
}

.food-item {
  background-color: var(--bg-card);
  border-radius: 0.8rem;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--card-shadow);
}

.food-info {
  flex: 1;
}

.delete-button {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.05);
  border: none;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.2s;
}

.delete-button:hover {
  background-color: rgba(var(--danger-color), 0.1);
  color: var(--danger-color);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
}

/* 动画效果 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.is-animating .food-result {
  animation: pulse 0.5s infinite;
}

@media (min-width: 768px) {
  .food-items {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .food-items {
    grid-template-columns: 1fr;
  }
  
  .food-name {
    font-size: 1.8rem;
  }
}
</style> 