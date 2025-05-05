<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, logoutUser } from '../utils/userService'

const router = useRouter()
const user = ref(null)
const showLogoutConfirm = ref(false)

onMounted(() => {
  // 获取当前登录用户
  user.value = getCurrentUser()
  if (!user.value) {
    router.push('/login')
  }
  
  // 添加页面离开前的确认
  window.addEventListener('beforeunload', (e) => {
    e.preventDefault()
    e.returnValue = ''
  })
})

const logout = () => {
  showLogoutConfirm.value = true
}

const confirmLogout = () => {
  logoutUser()
  router.push('/login')
}

const cancelLogout = () => {
  showLogoutConfirm.value = false
}
</script>

<template>
  <div class="home-container" v-if="user">
    <header class="app-header">
      <h1 class="app-title">我的账户</h1>
      <button class="logout-button" @click="logout">
        <i class="icon-logout"></i>
      </button>
    </header>
    
    <div class="user-profile">
      <div class="avatar">
        <span>{{ user.username.charAt(0).toUpperCase() }}</span>
      </div>
      <h2 class="username">{{ user.username }}</h2>
    </div>
    
    <div class="content">
      <div class="card user-info">
        <h3 class="card-title">
          <i class="icon-info"></i> 个人信息
        </h3>
        <div class="info-item">
          <span class="label">用户名</span>
          <span class="value">{{ user.username }}</span>
        </div>
        <div class="info-item">
          <span class="label">手机号</span>
          <span class="value">{{ user.phone }}</span>
        </div>
        <div class="info-item">
          <span class="label">邮箱</span>
          <span class="value">{{ user.email }}</span>
        </div>
      </div>
      
      <div class="card activity">
        <h3 class="card-title">
          <i class="icon-activity"></i> 最近活动
        </h3>
        <div class="activity-item">
          <span class="activity-icon login-icon"></span>
          <div class="activity-details">
            <span class="activity-title">成功登录</span>
            <span class="activity-time">{{ new Date().toLocaleString() }}</span>
          </div>
        </div>
      </div>
      
      <div class="card settings">
        <h3 class="card-title">
          <i class="icon-settings"></i> 安全设置
        </h3>
        <div class="setting-item" @click="router.push('/reset-password')">
          <div class="setting-details">
            <span class="setting-title">修改密码</span>
            <span class="setting-desc">定期更新密码可以保障账户安全</span>
          </div>
          <i class="icon-arrow"></i>
        </div>
      </div>
    </div>
    
    <div class="logout-modal" v-if="showLogoutConfirm">
      <div class="modal-content">
        <h3>确认退出登录</h3>
        <p>您确定要退出当前账号吗？</p>
        <div class="modal-actions">
          <button class="cancel-button" @click="cancelLogout">取消</button>
          <button class="confirm-button" @click="confirmLogout">确认退出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  position: relative;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--primary-color);
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-title {
  font-size: 1.2rem;
  margin: 0;
  font-weight: 600;
}

.logout-button {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.icon-logout:before {
  content: "👋";
}

.icon-info:before {
  content: "ℹ️";
}

.icon-activity:before {
  content: "📊";
}

.icon-settings:before {
  content: "⚙️";
}

.icon-arrow:before {
  content: "›";
  font-size: 1.5rem;
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  background: linear-gradient(to bottom, var(--primary-color), var(--primary-dark));
  color: white;
}

.avatar {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.username {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.content {
  padding: 1rem;
  margin-bottom: 2rem;
}

.card {
  background: white;
  border-radius: 0.8rem;
  box-shadow: var(--card-shadow);
  padding: 1.2rem;
  margin-bottom: 1rem;
}

.card-title {
  display: flex;
  align-items: center;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.8rem;
}

.card-title i {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.info-item {
  display: flex;
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  width: 4rem;
  color: var(--text-light);
  flex-shrink: 0;
}

.value {
  flex: 1;
  color: var(--text-color);
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
}

.activity-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: rgba(52, 152, 219, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.login-icon:before {
  content: "🔑";
  font-size: 1rem;
}

.activity-details {
  flex: 1;
}

.activity-title {
  display: block;
  font-weight: 500;
  color: var(--text-color);
}

.activity-time {
  display: block;
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 0.2rem;
}

.setting-item {
  display: flex;
  align-items: center;
  padding: 0.8rem 0;
  cursor: pointer;
}

.setting-details {
  flex: 1;
}

.setting-title {
  display: block;
  font-weight: 500;
  color: var(--text-color);
}

.setting-desc {
  display: block;
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 0.2rem;
}

.logout-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.8rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 320px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  color: var(--text-color);
}

.modal-content p {
  margin-bottom: 1.5rem;
  color: var(--text-light);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
}

.cancel-button, .confirm-button {
  padding: 0.6rem 1rem;
  border-radius: 0.4rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-size: 0.9rem;
}

.cancel-button {
  background-color: #f5f5f5;
  color: var(--text-color);
}

.confirm-button {
  background-color: var(--danger-color);
  color: white;
}

@media (min-width: 768px) {
  .content {
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    padding: 2rem;
  }
  
  .card {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .info-item {
    padding: 1rem 0;
  }
  
  .label {
    width: 6rem;
  }
}
</style> 