<script setup>
import { ref, onMounted, computed } from 'vue'
import PageLayout from '../components/PageLayout.vue'
import { getTodos, addTodo, deleteTodo, updateTodo, toggleTodoStatus } from '../utils/todoService'

const todos = ref([])
const newTodoContent = ref('')
const editingTodo = ref(null)
const editContent = ref('')
const errorMsg = ref('')
const filter = ref('all') // all, active, completed

// 加载待办事项列表
const loadTodos = () => {
  todos.value = getTodos()
}

onMounted(() => {
  loadTodos()
})

// 过滤后的待办事项列表
const filteredTodos = computed(() => {
  if (filter.value === 'all') {
    return todos.value
  } else if (filter.value === 'active') {
    return todos.value.filter(todo => !todo.completed)
  } else if (filter.value === 'completed') {
    return todos.value.filter(todo => todo.completed)
  }
  return todos.value
})

// 添加新待办事项
const handleAddTodo = () => {
  if (!newTodoContent.value.trim()) {
    errorMsg.value = '请输入待办内容'
    setTimeout(() => {
      errorMsg.value = ''
    }, 3000)
    return
  }
  
  const result = addTodo(newTodoContent.value)
  
  if (result.success) {
    newTodoContent.value = ''
    loadTodos()
  } else {
    errorMsg.value = result.message
    setTimeout(() => {
      errorMsg.value = ''
    }, 3000)
  }
}

// 删除待办事项
const handleDeleteTodo = (todoId) => {
  deleteTodo(todoId)
  loadTodos()
}

// 开始编辑待办事项
const startEdit = (todo) => {
  editingTodo.value = todo.id
  editContent.value = todo.content
}

// 保存编辑
const saveEdit = () => {
  if (!editContent.value.trim()) {
    errorMsg.value = '待办内容不能为空'
    setTimeout(() => {
      errorMsg.value = ''
    }, 3000)
    return
  }
  
  updateTodo(editingTodo.value, editContent.value)
  editingTodo.value = null
  loadTodos()
}

// 取消编辑
const cancelEdit = () => {
  editingTodo.value = null
}

// 切换待办事项完成状态
const toggleCompleted = (todoId) => {
  toggleTodoStatus(todoId)
  loadTodos()
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <PageLayout title="待办事项">
    <div class="todo-container">
      <div class="add-todo">
        <div class="input-wrapper">
          <input
            type="text"
            v-model="newTodoContent"
            placeholder="添加新的待办事项..."
            @keyup.enter="handleAddTodo"
          />
          <button class="add-button" @click="handleAddTodo">
            <i class="icon-add"></i>
          </button>
        </div>
        <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>
      </div>
      
      <div class="filter-tabs">
        <button 
          class="filter-tab" 
          :class="{ active: filter === 'all' }"
          @click="filter = 'all'"
        >
          全部
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: filter === 'active' }"
          @click="filter = 'active'"
        >
          未完成
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: filter === 'completed' }"
          @click="filter = 'completed'"
        >
          已完成
        </button>
      </div>
      
      <div class="todos-list">
        <div v-if="filteredTodos.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <p>暂无{{ filter === 'completed' ? '已完成' : filter === 'active' ? '未完成' : '' }}待办事项</p>
        </div>
        
        <div 
          v-for="todo in filteredTodos" 
          :key="todo.id" 
          class="todo-item"
          :class="{ completed: todo.completed }"
        >
          <template v-if="editingTodo === todo.id">
            <div class="edit-wrapper">
              <input 
                type="text" 
                v-model="editContent" 
                class="edit-input"
                @keyup.enter="saveEdit"
                @keyup.esc="cancelEdit"
                ref="editInput"
              />
              <div class="edit-actions">
                <button class="save-button" @click="saveEdit">保存</button>
                <button class="cancel-button" @click="cancelEdit">取消</button>
              </div>
            </div>
          </template>
          
          <template v-else>
            <div class="checkbox-wrapper" @click="toggleCompleted(todo.id)">
              <div class="checkbox" :class="{ checked: todo.completed }">
                <div v-if="todo.completed" class="checkmark"></div>
              </div>
            </div>
            <div class="todo-content" @click="toggleCompleted(todo.id)">
              <div class="todo-text">{{ todo.content }}</div>
              <div class="todo-date">{{ formatDate(todo.createdAt) }}</div>
            </div>
            <div class="todo-actions">
              <button class="edit-button" @click.stop="startEdit(todo)">
                <i class="icon-edit"></i>
              </button>
              <button class="delete-button" @click.stop="handleDeleteTodo(todo.id)">
                <i class="icon-delete"></i>
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<style scoped>
.todo-container {
  max-width: 768px;
  margin: 0 auto;
}

.add-todo {
  margin-bottom: 1.5rem;
}

.input-wrapper {
  display: flex;
  position: relative;
}

input[type="text"] {
  flex: 1;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all var(--transition-time);
}

input[type="text"]:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.add-button {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
}

.add-button:active {
  background-color: rgba(52, 152, 219, 0.1);
}

.icon-add:before {
  content: "+";
}

.error-message {
  color: var(--danger-color);
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.filter-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1rem;
}

.filter-tab {
  flex: 1;
  background: none;
  border: none;
  padding: 0.8rem;
  font-size: 0.9rem;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.filter-tab.active {
  color: var(--primary-color);
  font-weight: 500;
}

.filter-tab.active:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
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

.todos-list {
  margin-bottom: 2rem;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background-color: white;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.todo-item.completed {
  opacity: 0.7;
}

.checkbox-wrapper {
  margin-right: 1rem;
  cursor: pointer;
}

.checkbox {
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  position: relative;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox.checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.checkmark:before {
  content: "✓";
  color: white;
  font-size: 0.8rem;
}

.todo-content {
  flex: 1;
  cursor: pointer;
}

.todo-text {
  font-size: 1rem;
  word-break: break-word;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: var(--text-light);
}

.todo-date {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 0.25rem;
}

.todo-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-button, .delete-button {
  background: none;
  border: none;
  color: var(--text-light);
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s;
}

.edit-button:active, .delete-button:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.delete-button {
  color: var(--danger-color);
}

.icon-edit:before {
  content: "✏️";
  font-size: 0.9rem;
}

.icon-delete:before {
  content: "🗑️";
  font-size: 0.9rem;
}

.edit-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.edit-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--primary-color);
  border-radius: 0.25rem;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.save-button, .cancel-button {
  padding: 0.3rem 0.8rem;
  border-radius: 0.25rem;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
}

.save-button {
  background-color: var(--primary-color);
  color: white;
}

.cancel-button {
  background-color: #f1f1f1;
  color: var(--text-color);
}
</style> 