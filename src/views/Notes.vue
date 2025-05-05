<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageLayout from '../components/PageLayout.vue'
import { getNotes, addNote, deleteNote } from '../utils/noteService'

const router = useRouter()
const notes = ref([])
const newNoteTitle = ref('')
const showAddForm = ref(false)
const errorMsg = ref('')

// 加载笔记列表
const loadNotes = () => {
  notes.value = getNotes().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

onMounted(() => {
  loadNotes()
})

// 添加笔记
const handleAddNote = () => {
  if (!newNoteTitle.value.trim()) {
    errorMsg.value = '请输入笔记标题'
    setTimeout(() => {
      errorMsg.value = ''
    }, 3000)
    return
  }
  
  const result = addNote(newNoteTitle.value, '')
  
  if (result.success) {
    newNoteTitle.value = ''
    showAddForm.value = false
    loadNotes()
    
    // 跳转到编辑页面
    router.push(`/note-edit/${result.note.id}`)
  } else {
    errorMsg.value = result.message
    setTimeout(() => {
      errorMsg.value = ''
    }, 3000)
  }
}

// 删除笔记
const handleDeleteNote = (noteId) => {
  if (confirm('确定要删除这个笔记吗？')) {
    deleteNote(noteId)
    loadNotes()
  }
}

// 查看/编辑笔记
const editNote = (noteId) => {
  router.push(`/note-edit/${noteId}`)
}

// 取消添加
const cancelAdd = () => {
  showAddForm.value = false
  newNoteTitle.value = ''
  errorMsg.value = ''
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取笔记摘要（前50个字符）
const getSummary = (content) => {
  if (!content) return '无内容'
  return content.length > 50 ? content.substring(0, 50) + '...' : content
}
</script>

<template>
  <PageLayout title="笔记">
    <div class="notes-container">
      <div class="action-bar">
        <button 
          v-if="!showAddForm" 
          class="add-button"
          @click="showAddForm = true"
        >
          <i class="icon-add"></i>
          <span>新建笔记</span>
        </button>
      </div>
      
      <div v-if="showAddForm" class="add-form">
        <h3>新建笔记</h3>
        <div class="input-wrapper">
          <input
            type="text"
            v-model="newNoteTitle"
            placeholder="请输入笔记标题"
            @keyup.enter="handleAddNote"
          />
        </div>
        <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>
        <div class="form-actions">
          <button class="cancel-button" @click="cancelAdd">取消</button>
          <button class="submit-button" @click="handleAddNote">创建</button>
        </div>
      </div>
      
      <div class="notes-list">
        <div v-if="notes.length === 0" class="empty-state">
          <div class="empty-icon">📓</div>
          <p>暂无笔记，点击"新建笔记"开始记录吧</p>
        </div>
        
        <div 
          v-for="note in notes" 
          :key="note.id" 
          class="note-card"
          @click="editNote(note.id)"
        >
          <div class="note-header">
            <h3 class="note-title">{{ note.title }}</h3>
            <button 
              class="delete-button" 
              @click.stop="handleDeleteNote(note.id)"
            >
              <i class="icon-delete"></i>
            </button>
          </div>
          <div class="note-summary">{{ getSummary(note.content) }}</div>
          <div class="note-date">{{ formatDate(note.updatedAt) }}</div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<style scoped>
.notes-container {
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
  box-shadow: var(--button-shadow);
  transition: all 0.2s;
}

.add-button:active {
  transform: scale(0.98);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.icon-add {
  margin-right: 0.5rem;
  font-size: 1.1rem;
}

.icon-add:before {
  content: "+";
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

.input-wrapper {
  margin-bottom: 1rem;
}

input[type="text"] {
  width: 100%;
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

.error-message {
  color: var(--danger-color);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.cancel-button, .submit-button {
  padding: 0.7rem 1.2rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
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
}

.notes-list {
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

.note-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: var(--card-shadow);
  cursor: pointer;
  transition: all 0.2s;
}

.note-card:active {
  transform: translateY(1px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.note-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-color);
}

.delete-button {
  background: none;
  border: none;
  color: var(--text-light);
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s;
}

.delete-button:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.icon-delete:before {
  content: "🗑️";
  font-size: 0.9rem;
}

.note-summary {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
  line-height: 1.4;
  max-height: 2.8rem;
  overflow: hidden;
}

.note-date {
  font-size: 0.8rem;
  color: var(--text-light);
}
</style> 