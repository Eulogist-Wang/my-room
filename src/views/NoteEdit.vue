<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageLayout from '../components/PageLayout.vue'
import { getNote, updateNote } from '../utils/noteService'

const router = useRouter()
const route = useRoute()
const noteId = route.params.id

const note = ref(null)
const title = ref('')
const content = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const isLoading = ref(false)
const isSaving = ref(false)

onMounted(() => {
  loadNote()
})

// 加载笔记详情
const loadNote = () => {
  isLoading.value = true
  
  const noteData = getNote(noteId)
  if (!noteData) {
    router.push('/notes')
    return
  }
  
  note.value = noteData
  title.value = noteData.title
  content.value = noteData.content
  
  isLoading.value = false
}

// 保存笔记
const saveNote = async () => {
  if (!title.value.trim()) {
    errorMsg.value = '笔记标题不能为空'
    setTimeout(() => {
      errorMsg.value = ''
    }, 3000)
    return
  }
  
  isSaving.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const result = updateNote(noteId, title.value, content.value)
  
  isSaving.value = false
  
  if (result.success) {
    successMsg.value = '笔记已保存'
    setTimeout(() => {
      successMsg.value = ''
    }, 3000)
  } else {
    errorMsg.value = result.message || '保存失败，请重试'
    setTimeout(() => {
      errorMsg.value = ''
    }, 3000)
  }
}

// 返回笔记列表
const backToList = () => {
  router.push('/notes')
}
</script>

<template>
  <PageLayout title="编辑笔记">
    <div class="note-edit-container" v-if="note">
      <div class="input-group">
        <input
          type="text"
          v-model="title"
          placeholder="请输入标题"
          class="title-input"
        />
      </div>
      
      <div class="input-group">
        <textarea
          v-model="content"
          placeholder="开始记录..."
          class="content-textarea"
          rows="15"
        ></textarea>
      </div>
      
      <div v-if="errorMsg" class="error-message">
        <i class="icon-warning"></i>
        <span>{{ errorMsg }}</span>
      </div>
      
      <div v-if="successMsg" class="success-message">
        <i class="icon-success"></i>
        <span>{{ successMsg }}</span>
      </div>
      
      <div class="form-actions">
        <button 
          class="save-button" 
          @click="saveNote"
          :disabled="isSaving"
        >
          <span v-if="!isSaving">保存</span>
          <span v-else class="loading-spinner"></span>
        </button>
        
        <button 
          class="back-button" 
          @click="backToList"
        >
          返回列表
        </button>
      </div>
    </div>
    
    <div v-else-if="isLoading" class="loading-state">
      <div class="loading-spinner large"></div>
      <p>加载中...</p>
    </div>
  </PageLayout>
</template>

<style scoped>
.note-edit-container {
  width: 100%;
}

.input-group {
  margin-bottom: 1rem;
}

.title-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 1.2rem;
  font-weight: 500;
  transition: all var(--transition-time);
}

.content-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  min-height: 300px;
  transition: all var(--transition-time);
}

.title-input:focus, .content-textarea:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.error-message {
  color: var(--danger-color);
  margin-bottom: 1rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  background-color: rgba(231, 76, 60, 0.1);
  padding: 0.75rem;
  border-radius: 0.5rem;
}

.success-message {
  color: var(--success-color);
  margin-bottom: 1rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  background-color: rgba(46, 204, 113, 0.1);
  padding: 0.75rem;
  border-radius: 0.5rem;
}

.icon-warning:before {
  content: "⚠️";
  margin-right: 0.5rem;
}

.icon-success:before {
  content: "✅";
  margin-right: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.save-button, .back-button {
  padding: 0.8rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.save-button {
  background-color: var(--primary-color);
  color: white;
  flex: 1;
}

.back-button {
  background-color: #f1f1f1;
  color: var(--text-color);
}

.save-button:hover, .back-button:hover {
  opacity: 0.9;
}

.save-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--text-light);
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

.loading-spinner.large {
  width: 2.5rem;
  height: 2.5rem;
  border-width: 3px;
  border-color: rgba(52, 152, 219, 0.3);
  border-top-color: var(--primary-color);
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 