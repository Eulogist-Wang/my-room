<script setup>
import { ref, onMounted, computed } from 'vue'
import PageLayout from '../components/PageLayout.vue'
import { getTransactions, addTransaction, deleteTransaction, getBudgetStats, incomeCategories, expenseCategories, getCategorySummary } from '../utils/budgetService'

const transactions = ref([])
const showAddForm = ref(false)
const formAmount = ref('')
const formType = ref('expense')
const formCategory = ref('')
const formDescription = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const isLoading = ref(false)
const activeTab = ref('all') // all, income, expense
const showSummary = ref(false) // 控制是否显示汇总页面
const summaryType = ref('expense') // 控制汇总页面显示收入还是支出

// 获取记账记录
const loadTransactions = () => {
  transactions.value = getTransactions().sort((a, b) => new Date(b.date) - new Date(a.date))
}

// 获取收支统计
const stats = computed(() => {
  return getBudgetStats()
})

// 获取分类汇总数据
const categorySummary = computed(() => {
  return getCategorySummary()
})

// 过滤后的交易列表
const filteredTransactions = computed(() => {
  if (activeTab.value === 'all') {
    return transactions.value
  } else {
    return transactions.value.filter(t => t.type === activeTab.value)
  }
})

// 切换汇总页面显示
const toggleSummary = () => {
  showSummary.value = !showSummary.value
}

// 切换汇总类型（收入/支出）
const toggleSummaryType = (type) => {
  summaryType.value = type
}

// 添加记账
const handleAddTransaction = async () => {
  // 验证表单
  if (!formAmount.value || isNaN(formAmount.value) || Number(formAmount.value) <= 0) {
    errorMsg.value = '请输入有效金额'
    return
  }
  
  if (!formCategory.value) {
    errorMsg.value = '请选择分类'
    return
  }
  
  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const result = addTransaction(
    formAmount.value,
    formType.value,
    formCategory.value,
    formDescription.value
  )
  
  isLoading.value = false
  
  if (result.success) {
    successMsg.value = '添加成功'
    setTimeout(() => {
      successMsg.value = ''
    }, 2000)
    
    // 清空表单
    formAmount.value = ''
    formDescription.value = ''
    
    // 重新加载数据
    loadTransactions()
    showAddForm.value = false
  } else {
    errorMsg.value = result.message
  }
}

// 删除记账
const handleDeleteTransaction = (id) => {
  if (confirm('确定要删除这条记录吗？')) {
    deleteTransaction(id)
    loadTransactions()
  }
}

// 取消添加
const cancelAdd = () => {
  showAddForm.value = false
  formAmount.value = ''
  formCategory.value = ''
  formDescription.value = ''
  errorMsg.value = ''
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 格式化金额
const formatAmount = (amount) => {
  return amount.toFixed(2)
}

// 根据类型获取分类列表
const categories = computed(() => {
  return formType.value === 'income' ? incomeCategories : expenseCategories
})

onMounted(() => {
  loadTransactions()
})
</script>

<template>
  <PageLayout title="记账本">
    <div class="budget-container">
      <div class="stats-card">
        <div class="stat-item income">
          <span class="stat-label">收入</span>
          <span class="stat-value">¥{{ formatAmount(stats.income) }}</span>
        </div>
        <div class="stat-item expense">
          <span class="stat-label">支出</span>
          <span class="stat-value">¥{{ formatAmount(stats.expense) }}</span>
        </div>
        <div class="stat-item balance">
          <span class="stat-label">结余</span>
          <span class="stat-value">¥{{ formatAmount(stats.balance) }}</span>
        </div>
      </div>
      
      <div class="action-bar">
        <div class="filter-tabs">
          <button 
            class="filter-tab" 
            :class="{ active: activeTab === 'all' }"
            @click="activeTab = 'all'"
          >
            全部
          </button>
          <button 
            class="filter-tab" 
            :class="{ active: activeTab === 'income' }"
            @click="activeTab = 'income'"
          >
            收入
          </button>
          <button 
            class="filter-tab" 
            :class="{ active: activeTab === 'expense' }"
            @click="activeTab = 'expense'"
          >
            支出
          </button>
        </div>
        
        <div class="action-buttons">
          <button 
            class="summary-button"
            @click="toggleSummary"
            v-if="!showAddForm"
          >
            <i class="icon-summary"></i>
            <span>{{ showSummary ? '返回列表' : '查看汇总' }}</span>
          </button>
          
          <button 
            v-if="!showAddForm && !showSummary" 
            class="add-button"
            @click="showAddForm = true"
          >
            <i class="icon-add"></i>
            <span>记一笔</span>
          </button>
        </div>
      </div>
      
      <div v-if="showAddForm" class="add-form">
        <h3>新增{{ formType === 'income' ? '收入' : '支出' }}</h3>
        
        <div class="type-toggle">
          <button 
            class="type-button expense" 
            :class="{ active: formType === 'expense' }"
            @click="formType = 'expense'"
          >
            支出
          </button>
          <button 
            class="type-button income" 
            :class="{ active: formType === 'income' }"
            @click="formType = 'income'"
          >
            收入
          </button>
        </div>
        
        <div class="form-group">
          <label>金额</label>
          <div class="amount-input">
            <span class="currency-symbol">¥</span>
            <input
              type="number"
              v-model="formAmount"
              placeholder="0.00"
              step="0.01"
              min="0.01"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>分类</label>
          <div class="category-selector">
            <button 
              v-for="category in categories" 
              :key="category"
              class="category-btn"
              :class="{ active: formCategory === category }"
              @click="formCategory = category"
            >
              {{ category }}
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label>备注</label>
          <input
            type="text"
            v-model="formDescription"
            placeholder="添加备注（选填）"
          />
        </div>
        
        <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>
        <div v-if="successMsg" class="success-message">{{ successMsg }}</div>
        
        <div class="form-actions">
          <button 
            class="cancel-button" 
            @click="cancelAdd"
          >
            取消
          </button>
          <button 
            class="submit-button" 
            @click="handleAddTransaction"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">保存</span>
            <span v-else class="loading-spinner"></span>
          </button>
        </div>
      </div>
      
      <!-- 分类汇总视图 -->
      <div v-if="showSummary" class="summary-container">
        <div class="summary-tabs">
          <button 
            class="summary-tab" 
            :class="{ active: summaryType === 'expense' }"
            @click="toggleSummaryType('expense')"
          >
            支出汇总
          </button>
          <button 
            class="summary-tab" 
            :class="{ active: summaryType === 'income' }"
            @click="toggleSummaryType('income')"
          >
            收入汇总
          </button>
        </div>
        
        <div class="summary-content">
          <div v-if="summaryType === 'expense'">
            <div 
              v-for="item in categorySummary.expense" 
              :key="item.category"
              class="summary-item"
            >
              <div class="summary-category">{{ item.category }}</div>
              <div class="summary-details">
                <div class="summary-amount">¥{{ formatAmount(item.amount) }}</div>
                <div class="summary-percentage">{{ item.percentage.toFixed(1) }}%</div>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill expense"
                  :style="{ width: `${item.percentage}%` }"
                ></div>
              </div>
            </div>
            
            <div v-if="categorySummary.expense.length === 0" class="empty-summary">
              暂无支出记录
            </div>
          </div>
          
          <div v-else>
            <div 
              v-for="item in categorySummary.income" 
              :key="item.category"
              class="summary-item"
            >
              <div class="summary-category">{{ item.category }}</div>
              <div class="summary-details">
                <div class="summary-amount">¥{{ formatAmount(item.amount) }}</div>
                <div class="summary-percentage">{{ item.percentage.toFixed(1) }}%</div>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill income"
                  :style="{ width: `${item.percentage}%` }"
                ></div>
              </div>
            </div>
            
            <div v-if="categorySummary.income.length === 0" class="empty-summary">
              暂无收入记录
            </div>
          </div>
        </div>
      </div>
      
      <!-- 交易记录列表 -->
      <div class="transactions-list" v-if="!showSummary">
        <div v-if="filteredTransactions.length === 0" class="empty-state">
          <div class="empty-icon">💰</div>
          <p>暂无{{ activeTab === 'income' ? '收入' : activeTab === 'expense' ? '支出' : '交易' }}记录</p>
        </div>
        
        <div 
          v-for="transaction in filteredTransactions" 
          :key="transaction.id" 
          class="transaction-item"
          :class="{ 'income-item': transaction.type === 'income', 'expense-item': transaction.type === 'expense' }"
        >
          <div class="transaction-info">
            <div class="transaction-category">{{ transaction.category }}</div>
            <div class="transaction-desc" v-if="transaction.description">{{ transaction.description }}</div>
            <div class="transaction-date">{{ formatDate(transaction.date) }}</div>
          </div>
          <div class="transaction-amount">
            <span>{{ transaction.type === 'income' ? '+' : '-' }} ¥{{ formatAmount(transaction.amount) }}</span>
            <button 
              class="delete-button" 
              @click.stop="handleDeleteTransaction(transaction.id)"
            >
              <i class="icon-delete"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<style scoped>
.budget-container {
  width: 100%;
}

.stats-card {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  background-color: var(--bg-card);
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: var(--card-shadow);
  transition: background-color var(--transition-time);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
}

.income .stat-value {
  color: var(--success-color);
}

.expense .stat-value {
  color: var(--danger-color);
}

.balance .stat-value {
  color: var(--primary-color);
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filter-tabs {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
}

.filter-tab {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab.active {
  background-color: var(--primary-color);
  color: white;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.add-button, .summary-button {
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
}

.summary-button {
  background-color: #9b59b6;
}

.add-button:active, .summary-button:active {
  transform: scale(0.98);
}

.icon-add, .icon-summary {
  margin-right: 0.5rem;
}

.icon-add:before {
  content: "+";
}

.icon-summary:before {
  content: "📊";
}

.add-form {
  background-color: var(--bg-card);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--card-shadow);
  transition: background-color var(--transition-time);
}

.add-form h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  text-align: center;
}

.type-toggle {
  display: flex;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
}

.type-button {
  flex: 1;
  padding: 0.8rem;
  border: none;
  background: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.type-button.active {
  color: white;
}

.type-button.expense.active {
  background-color: var(--danger-color);
}

.type-button.income.active {
  background-color: var(--success-color);
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

.amount-input {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 1rem;
  font-size: 1.2rem;
  color: var(--text-color);
}

.amount-input input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 1.2rem;
  transition: all var(--transition-time);
}

input[type="text"], input[type="number"] {
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

.category-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-btn {
  padding: 0.6rem 1rem;
  background-color: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 2rem;
  font-size: 0.9rem;
  color: var(--text-color);
  cursor: pointer;
  transition: background-color 0.2s;
}

.category-btn.active {
  background-color: var(--primary-color);
  color: white;
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
  display: flex;
  justify-content: center;
  align-items: center;
}

.cancel-button {
  background-color: #f1f1f1;
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

.transactions-list {
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

.transaction-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background-color: var(--bg-card);
  box-shadow: var(--card-shadow);
  margin-bottom: 0.8rem;
  border-radius: 0.5rem;
  transition: background-color var(--transition-time);
}

.transaction-info {
  flex: 1;
}

.transaction-category {
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: var(--text-color);
}

.transaction-desc {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-bottom: 0.25rem;
}

.transaction-date {
  font-size: 0.8rem;
  color: var(--text-light);
}

.transaction-amount {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.income-item .transaction-amount {
  color: var(--success-color);
}

.expense-item .transaction-amount {
  color: var(--danger-color);
}

.delete-button {
  background: none;
  border: none;
  color: var(--text-light);
  opacity: 0.6;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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

/* 汇总视图样式 */
.summary-container {
  background-color: var(--bg-card);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--card-shadow);
  transition: background-color var(--transition-time);
}

.summary-tabs {
  display: flex;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
}

.summary-tab {
  flex: 1;
  padding: 0.8rem;
  border: none;
  background: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.summary-tab.active {
  color: white;
}

.summary-tab.active:first-child {
  background-color: var(--danger-color);
}

.summary-tab.active:last-child {
  background-color: var(--success-color);
}

.summary-item {
  margin-bottom: 1.2rem;
}

.summary-category {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.summary-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.3rem;
}

.summary-amount {
  font-weight: 600;
}

.summary-percentage {
  color: var(--text-light);
}

.progress-bar {
  height: 8px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-fill.expense {
  background-color: var(--danger-color);
}

.progress-fill.income {
  background-color: var(--success-color);
}

.empty-summary {
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
}
</style> 