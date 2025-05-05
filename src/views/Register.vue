<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser, validatePassword, validatePhone, validateEmail } from '../utils/userService'

const router = useRouter()
const username = ref('')
const password = ref('')
const phone = ref('')
const email = ref('')
const errorMsg = ref('')
const isLoading = ref(false)
const validationErrors = ref({
  username: '',
  password: '',
  phone: '',
  email: ''
})

const validateForm = () => {
  let isValid = true
  validationErrors.value = {
    username: '',
    password: '',
    phone: '',
    email: ''
  }
  
  if (!username.value) {
    validationErrors.value.username = '请输入用户名'
    isValid = false
  }
  
  if (!password.value) {
    validationErrors.value.password = '请输入密码'
    isValid = false
  } else if (!validatePassword(password.value)) {
    validationErrors.value.password = '密码必须包含数字和字母的组合，且不少于8位'
    isValid = false
  }
  
  if (!phone.value) {
    validationErrors.value.phone = '请输入手机号'
    isValid = false
  } else if (!validatePhone(phone.value)) {
    validationErrors.value.phone = '请输入有效的手机号码'
    isValid = false
  }
  
  if (!email.value) {
    validationErrors.value.email = '请输入邮箱'
    isValid = false
  } else if (!validateEmail(email.value)) {
    validationErrors.value.email = '请输入有效的邮箱地址'
    isValid = false
  }
  
  return isValid
}

const register = async () => {
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 600))
  
  const userData = {
    username: username.value,
    password: password.value,
    phone: phone.value,
    email: email.value
  }
  
  const result = registerUser(userData)
  
  isLoading.value = false
  
  if (result.success) {
    router.push('/login')
  } else {
    errorMsg.value = result.message
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="register-container">
    <div class="register-header">
      <div class="back-button" @click="goToLogin">
        <i class="icon-back"></i>
      </div>
      <h1 class="page-title">注册账号</h1>
      <div class="placeholder"></div>
    </div>
    
    <div class="register-card">
      <form @submit.prevent="register">
        <div class="form-group">
          <label for="username">用户名</label>
          <div class="input-wrapper">
            <input 
              id="username" 
              type="text" 
              v-model="username" 
              placeholder="请设置用户名"
              autocomplete="username"
            />
            <i class="icon-user"></i>
          </div>
          <div v-if="validationErrors.username" class="field-error">
            {{ validationErrors.username }}
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <div class="input-wrapper">
            <input 
              id="password" 
              type="password" 
              v-model="password" 
              placeholder="请设置密码"
              autocomplete="new-password"
            />
            <i class="icon-lock"></i>
          </div>
          <div v-if="validationErrors.password" class="field-error">
            {{ validationErrors.password }}
          </div>
        </div>
        
        <div class="form-group">
          <label for="phone">手机号</label>
          <div class="input-wrapper">
            <input 
              id="phone" 
              type="tel" 
              v-model="phone" 
              placeholder="请输入手机号"
              autocomplete="tel"
            />
            <i class="icon-phone"></i>
          </div>
          <div v-if="validationErrors.phone" class="field-error">
            {{ validationErrors.phone }}
          </div>
        </div>
        
        <div class="form-group">
          <label for="email">邮箱</label>
          <div class="input-wrapper">
            <input 
              id="email" 
              type="email" 
              v-model="email" 
              placeholder="请输入邮箱"
              autocomplete="email"
            />
            <i class="icon-email"></i>
          </div>
          <div v-if="validationErrors.email" class="field-error">
            {{ validationErrors.email }}
          </div>
        </div>
        
        <div v-if="errorMsg" class="error-message">
          <i class="icon-warning"></i>
          <span>{{ errorMsg }}</span>
        </div>
        
        <div class="button-group">
          <button 
            type="submit" 
            class="primary-button" 
            :disabled="isLoading"
          >
            <span v-if="!isLoading">立即注册</span>
            <span v-else class="loading-spinner"></span>
          </button>
        </div>
        
        <div class="action-links">
          <a @click="goToLogin">已有账号？立即登录</a>
        </div>
      </form>
    </div>
    
    <div class="footer">
      <p>© {{ new Date().getFullYear() }} 移动端用户系统 - 基于Vue3</p>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #3498db, #8e44ad);
}

.register-header {
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

.register-card {
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
  .register-container {
    padding: 1rem;
    align-items: center;
  }
  
  .register-card {
    border-radius: 1rem;
    max-width: 450px;
    margin: 1rem auto;
    flex: none;
  }
  
  .register-header {
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

.field-error {
  color: var(--danger-color);
  margin-top: 0.4rem;
  font-size: 0.8rem;
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