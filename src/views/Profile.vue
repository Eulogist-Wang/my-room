<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, logoutUser } from '../utils/userService'
import { getUserStats } from '../utils/statsService'
import PageLayout from '../components/PageLayout.vue'

const router = useRouter()
const user = ref(null)
const stats = ref(null)
const showLogoutConfirm = ref(false)

onMounted(() => {
  // 获取当前登录用户
  user.value = getCurrentUser()
  if (!user.value) {
    router.push('/login')
  }
  
  // 获取用户统计数据
  stats.value = getUserStats(user.value?.username)
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

const editProfile = () => {
  router.push('/edit-profile')
}

const resetPassword = () => {
  router.push('/reset-password')
}

const formattedTime = computed(() => {
  const minutes = stats.value?.pomodoroMinutes || 0
  if (minutes < 60) {
    return `${minutes}分钟`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}小时${remainingMinutes > 0 ? remainingMinutes + '分钟' : ''}`
  }
})
</script>

<template>
  <PageLayout title="个人中心" :showBack="false" :hasTabBar="true">
    <div v-if="user" class="profile-container">
      <div class="user-header">
        <div class="avatar" @click="editProfile">
          <span>{{ user.username.charAt(0).toUpperCase() }}</span>
        </div>
        <h2 class="username">{{ user.username }}</h2>
        <div class="user-actions">
          <button class="action-button" @click="editProfile">
            <i class="icon-edit"></i>
            <span>编辑资料</span>
          </button>
          <button class="action-button" @click="resetPassword">
            <i class="icon-lock"></i>
            <span>修改密码</span>
          </button>
        </div>
      </div>

      <div class="card stats-card">
        <h3 class="card-title">
          <i class="icon-stats"></i> 使用统计
        </h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ stats?.completedTodos || 0 }}</div>
            <div class="stat-label">待办完成</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ formattedTime }}</div>
            <div class="stat-label">专注时长</div>
          </div>
        </div>
      </div>

      <div class="card info-card">
        <h3 class="card-title">
          <i class="icon-info"></i> 个人信息
        </h3>
        <div class="info-list">
          <div class="info-item" v-if="user.name">
            <div class="info-label">姓名</div>
            <div class="info-value">{{ user.name }}</div>
          </div>
          <div class="info-item" v-if="user.gender">
            <div class="info-label">性别</div>
            <div class="info-value">{{ user.gender }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">手机号</div>
            <div class="info-value">{{ user.phone }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">邮箱</div>
            <div class="info-value">{{ user.email }}</div>
          </div>
        </div>
      </div>

      <button class="logout-button" @click="logout">
        <i class="icon-logout"></i>
        <span>退出登录</span>
      </button>
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
  </PageLayout>
</template>

<style scoped>
.profile-container {
  padding-bottom: 2rem;
}

.user-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 0;
}

.avatar {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 2rem;
  font-weight: bold;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.username {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.user-actions {
  display: flex;
  gap: 1rem;
}

.action-button {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 2rem;
  background-color: white;
  font-size: 0.9rem;
  color: var(--text-color);
  transition: all 0.2s;
}

.action-button:active {
  background-color: #f5f5f5;
}

.action-button i {
  margin-right: 0.25rem;
  font-size: 1.1rem;
}

.icon-edit:before {
  content: "✏️";
}

.icon-lock:before {
  content: "🔒";
}

.icon-stats:before {
  content: "📊";
}

.icon-info:before {
  content: "ℹ️";
}

.icon-logout:before {
  content: "👋";
}

.card {
  background-color: white;
  border-radius: 1rem;
  box-shadow: var(--card-shadow);
  margin-bottom: 1rem;
  overflow: hidden;
}

.card-title {
  display: flex;
  align-items: center;
  padding: 1rem;
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
}

.card-title i {
  margin-right: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-light);
}

.info-list {
  padding: 0.5rem 0;
}

.info-item {
  display: flex;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  width: 4rem;
  color: var(--text-light);
  font-size: 0.95rem;
}

.info-value {
  flex: 1;
  color: var(--text-color);
  font-size: 0.95rem;
}

.logout-button {
  width: 100%;
  padding: 1rem;
  background-color: white;
  border: none;
  border-radius: 1rem;
  color: var(--danger-color);
  font-weight: 500;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  box-shadow: var(--card-shadow);
}

.logout-button i {
  margin-right: 0.5rem;
  font-size: 1.2rem;
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
  border-radius: 1rem;
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
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style> 