<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser } from '../utils/userService'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

const login = async () => {
  if (!username.value || !password.value) {
    errorMsg.value = '请输入用户名和密码'
    return
  }
  
  isLoading.value = true
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 600))
  
  const result = loginUser(username.value, password.value)
  
  isLoading.value = false
  
  if (result.success) {
    router.push('/home')
  } else {
    errorMsg.value = result.message
  }
}

const goToRegister = () => {
  router.push('/register')
}

const goToResetPassword = () => {
  router.push('/reset-password')
}
</script>

<template>
  <div class="login-container">
    <div class="login-header">
      <h1 class="app-title">Room</h1>
    </div>
    
    <div class="login-card">
      <h2>用户登录</h2>
      
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
        <label for="password">密码</label>
        <div class="input-wrapper">
          <input 
            id="password" 
            type="password" 
            v-model="password" 
            placeholder="请输入密码"
            autocomplete="current-password"
          />
          <i class="icon-lock"></i>
        </div>
      </div>
      
      <div v-if="errorMsg" class="error-message">
        <i class="icon-warning"></i>
        <span>{{ errorMsg }}</span>
      </div>
      
      <div class="button-group">
        <button 
          class="primary-button" 
          @click="login" 
          :disabled="isLoading"
        >
          <span v-if="!isLoading">登录</span>
          <span v-else class="loading-spinner"></span>
        </button>
      </div>
      
      <div class="action-links">
        <a @click="goToRegister">注册新用户</a>
        <a @click="goToResetPassword">忘记密码</a>
      </div>
    </div>
    
    <div class="footer">
      <p>© {{ new Date().getFullYear() }} Room - 基于Vue3</p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0;
  background: linear-gradient(135deg, #3498db, #8e44ad);
}

.login-header {
  padding: 2rem 1rem;
  text-align: center;
}

.app-title {
  color: white;
  font-size: 1.8rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin: 0;
}

.login-card {
  background-color: #fff;
  border-radius: 1rem 1rem 0 0;
  box-shadow: var(--card-shadow);
  padding: 2rem;
  flex: 1;
  width: 100%;
  margin: 0 auto;
  max-width: 500px;
  position: relative;
}

@media (min-width: 768px) {
  .login-container {
    padding: 2rem;
    justify-content: center;
    background: linear-gradient(135deg, #3498db, #8e44ad);
  }
  
  .login-card {
    border-radius: 1rem;
    max-width: 400px;
    flex: none;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  
  .login-header {
    padding: 1rem;
  }
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-color);
  font-size: 1.5rem;
  font-weight: 600;
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

.icon-warning:before {
  content: "⚠️";
  margin-right: 0.25rem;
}

input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color var(--transition-time);
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
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.action-links a {
  color: var(--primary-color);
  text-decoration: none;
  cursor: pointer;
  transition: color var(--transition-time);
}

.action-links a:hover {
  color: var(--primary-dark);
  text-decoration: none;
}

.footer {
  text-align: center;
  padding: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
}
</style> 