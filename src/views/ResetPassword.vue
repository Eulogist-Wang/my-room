<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { resetPassword, validatePassword } from '../utils/userService'

const router = useRouter()
const username = ref('')
const phone = ref('')
const email = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const isLoading = ref(false)

const resetUserPassword = async () => {
  // 表单验证
  if (!username.value || !phone.value || !email.value || !newPassword.value || !confirmPassword.value) {
    errorMsg.value = '请填写所有字段'
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = '两次输入的密码不一致'
    return
  }
  
  if (!validatePassword(newPassword.value)) {
    errorMsg.value = '密码必须包含数字和字母的组合，且不少于8位'
    return
  }
  
  isLoading.value = true
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // 重置密码
  const result = resetPassword(username.value, phone.value, email.value, newPassword.value)
  
  isLoading.value = false
  
  if (result.success) {
    successMsg.value = result.message
    errorMsg.value = ''
    // 3秒后跳转到登录页面
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } else {
    errorMsg.value = result.message
    successMsg.value = ''
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="reset-container">
    <div class="reset-header">
      <div class="back-button" @click="goToLogin">
        <i class="icon-back"></i>
      </div>
      <h1 class="page-title">修改密码</h1>
      <div class="placeholder"></div>
    </div>
    
    <div class="reset-card">
      <form @submit.prevent="resetUserPassword">
        <div class="form-group">
          <label for="username">用户名</label>
          <div class="input-wrapper">
            <input 
              id="username" 
              type="text" 
              v-model="username" 
              placeholder="请输入用户名"
              autocomplete="username"
            />
            <i class="icon-user"></i>
          </div>
        </div>
        
        <div class="form-group">
          <label for="phone">手机号</label>
          <div class="input-wrapper">
            <input 
              id="phone" 
              type="tel" 
              v-model="phone" 
              placeholder="请输入注册时的手机号"
              autocomplete="tel"
            />
            <i class="icon-phone"></i>
          </div>
        </div>
        
        <div class="form-group">
          <label for="email">邮箱</label>
          <div class="input-wrapper">
            <input 
              id="email" 
              type="email" 
              v-model="email" 
              placeholder="请输入注册时的邮箱"
              autocomplete="email"
            />
            <i class="icon-email"></i>
          </div>
        </div>
        
        <div class="form-group">
          <label for="newPassword">新密码</label>
          <div class="input-wrapper">
            <input 
              id="newPassword" 
              type="password" 
              v-model="newPassword" 
              placeholder="请输入新密码"
              autocomplete="new-password"
            />
            <i class="icon-lock"></i>
          </div>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <div class="input-wrapper">
            <input 
              id="confirmPassword" 
              type="password" 
              v-model="confirmPassword" 
              placeholder="请再次输入新密码"
              autocomplete="new-password"
            />
            <i class="icon-lock"></i>
          </div>
        </div>
        
        <div v-if="errorMsg" class="error-message">
          <i class="icon-warning"></i>
          <span>{{ errorMsg }}</span>
        </div>
        
        <div v-if="successMsg" class="success-message">
          <i class="icon-success"></i>
          <span>{{ successMsg }}</span>
        </div>
        
        <div class="button-group">
          <button 
            type="submit" 
            class="primary-button" 
            :disabled="isLoading"
          >
            <span v-if="!isLoading">修改密码</span>
            <span v-else class="loading-spinner"></span>
          </button>
        </div>
        
        <div class="action-links">
          <a @click="goToLogin">返回登录</a>
        </div>
      </form>
    </div>
    
    <div class="footer">
      <p>© {{ new Date().getFullYear() }} 移动端用户系统 - 基于Vue3</p>
    </div>
  </div>
</template>

<style scoped>
.reset-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #3498db, #8e44ad);
}

.reset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  color: white;
}

.back-button {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.icon-back:before {
  content: "←";
  font-size: 1.5rem;
}

.page-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.placeholder {
  width: 2rem;
}

.reset-card {
  background-color: #fff;
  border-radius: 1rem 1rem 0 0;
  box-shadow: var(--card-shadow);
  padding: 1.5rem;
  flex: 1;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .reset-container {
    padding: 1rem;
    align-items: center;
  }
  
  .reset-card {
    border-radius: 1rem;
    max-width: 450px;
    margin: 1rem auto;
    flex: none;
  }
  
  .reset-header {
    width: 100%;
    max-width: 450px;
  }
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

.input-wrapper {
  position: relative;
}

.input-wrapper i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
  font-size: 1.2rem;
}

.icon-user:before {
  content: "👤";
}

.icon-lock:before {
  content: "🔒";
}

.icon-phone:before {
  content: "📱";
}

.icon-email:before {
  content: "✉️";
}

.icon-warning:before {
  content: "⚠️";
  margin-right: 0.25rem;
}

.icon-success:before {
  content: "✅";
  margin-right: 0.25rem;
}

input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all var(--transition-time);
  appearance: none;
}

input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
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

.button-group {
  margin: 1.5rem 0;
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

.action-links {
  text-align: center;
  font-size: 0.9rem;
}

.action-links a {
  color: var(--primary-color);
  text-decoration: none;
  cursor: pointer;
}

.action-links a:hover {
  color: var(--primary-dark);
}

.footer {
  text-align: center;
  padding: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
}
</style> 