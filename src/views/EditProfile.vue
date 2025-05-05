<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, updateUserProfile } from '../utils/userService'
import PageLayout from '../components/PageLayout.vue'

const router = useRouter()
const user = ref(null)
const name = ref('')
const gender = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const isLoading = ref(false)

onMounted(() => {
  // 获取当前登录用户
  user.value = getCurrentUser()
  if (!user.value) {
    router.push('/login')
    return
  }
  
  // 填充表单字段
  name.value = user.value.name || ''
  gender.value = user.value.gender || ''
})

const saveProfile = async () => {
  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 600))
  
  const updatedProfile = {
    ...user.value,
    name: name.value,
    gender: gender.value
  }
  
  const result = updateUserProfile(updatedProfile)
  
  isLoading.value = false
  
  if (result.success) {
    successMsg.value = '个人资料更新成功'
    
    // 3秒后返回个人中心
    setTimeout(() => {
      router.push('/profile')
    }, 2000)
  } else {
    errorMsg.value = result.message || '更新失败，请重试'
  }
}
</script>

<template>
  <PageLayout title="编辑资料" :hasTabBar="false">
    <div class="edit-container" v-if="user">
      <div class="avatar-container">
        <div class="avatar">
          <span>{{ user.username.charAt(0).toUpperCase() }}</span>
        </div>
      </div>
      
      <form @submit.prevent="saveProfile" class="form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            id="username" 
            type="text" 
            :value="user.username" 
            disabled
            class="disabled-input"
          />
        </div>
        
        <div class="form-group">
          <label for="name">姓名</label>
          <input 
            id="name" 
            type="text" 
            v-model="name" 
            placeholder="请输入您的姓名"
          />
        </div>
        
        <div class="form-group">
          <label for="gender">性别</label>
          <div class="radio-group">
            <label class="radio-label">
              <input 
                type="radio" 
                name="gender" 
                value="男" 
                v-model="gender"
              />
              <span>男</span>
            </label>
            <label class="radio-label">
              <input 
                type="radio" 
                name="gender" 
                value="女" 
                v-model="gender"
              />
              <span>女</span>
            </label>
            <label class="radio-label">
              <input 
                type="radio" 
                name="gender" 
                value="" 
                v-model="gender"
              />
              <span>不设置</span>
            </label>
          </div>
        </div>
        
        <div class="form-group">
          <label for="phone">手机号</label>
          <input 
            id="phone" 
            type="tel" 
            :value="user.phone" 
            disabled
            class="disabled-input"
          />
        </div>
        
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            id="email" 
            type="email" 
            :value="user.email" 
            disabled
            class="disabled-input"
          />
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
            type="submit" 
            class="primary-button" 
            :disabled="isLoading"
          >
            <span v-if="!isLoading">保存更改</span>
            <span v-else class="loading-spinner"></span>
          </button>
        </div>
      </form>
    </div>
  </PageLayout>
</template>

<style scoped>
.edit-container {
  max-width: 600px;
  margin: 0 auto;
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin: 1rem 0 2rem;
}

.avatar {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.form {
  background-color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.95rem;
}

input[type="text"],
input[type="tel"],
input[type="email"] {
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
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.disabled-input {
  background-color: #f8f9fa;
  color: var(--text-light);
  cursor: not-allowed;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-label input {
  margin-right: 0.5rem;
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
  margin-right: 0.25rem;
}

.icon-success:before {
  content: "✅";
  margin-right: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: center;
}

.primary-button {
  width: 100%;
  padding: 0.9rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-time);
  display: flex;
  justify-content: center;
  align-items: center;
}

.primary-button:hover {
  background-color: var(--primary-dark);
}

.primary-button:disabled {
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
</style> 