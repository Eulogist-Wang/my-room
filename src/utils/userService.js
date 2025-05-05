// 用户服务工具，处理用户相关操作及本地存储

// 获取所有用户
export const getUsers = () => {
    const users = localStorage.getItem('users')
    return users ? JSON.parse(users) : []
}

// 保存用户列表
export const saveUsers = (users) => {
    localStorage.setItem('users', JSON.stringify(users))
}

// 用户注册
export const registerUser = (userData) => {
    // 验证用户数据
    if (!validateUserData(userData)) {
        return { success: false, message: '提供的数据无效' }
    }

    const users = getUsers()

    // 检查用户名是否已存在
    if (users.some(user => user.username === userData.username)) {
        return { success: false, message: '用户名已被注册' }
    }

    // 添加新用户
    users.push(userData)
    saveUsers(users)

    return { success: true, message: '注册成功' }
}

// 用户登录
export const loginUser = (username, password) => {
    const users = getUsers()
    const user = users.find(user => user.username === username && user.password === password)

    if (user) {
        // 保存当前登录用户信息（不包含密码）
        const { password, ...userInfo } = user
        localStorage.setItem('currentUser', JSON.stringify(userInfo))
        return { success: true, user: userInfo }
    }

    return { success: false, message: '用户名或密码错误' }
}

// 修改密码
export const resetPassword = (username, phone, email, newPassword) => {
    const users = getUsers()
    const userIndex = users.findIndex(user =>
        user.username === username &&
        user.phone === phone &&
        user.email === email
    )

    if (userIndex === -1) {
        return { success: false, message: '用户信息验证失败' }
    }

    // 验证新密码
    if (!validatePassword(newPassword)) {
        return { success: false, message: '密码必须包含数字和字母的组合，且不少于8位' }
    }

    // 更新密码
    users[userIndex].password = newPassword
    saveUsers(users)

    return { success: true, message: '密码修改成功' }
}

// 更新用户资料
export const updateUserProfile = (updatedProfile) => {
    const users = getUsers()
    const userIndex = users.findIndex(user => user.username === updatedProfile.username)

    if (userIndex === -1) {
        return { success: false, message: '用户不存在' }
    }

    // 保留密码字段
    const password = users[userIndex].password

    // 更新用户资料
    users[userIndex] = {
        ...updatedProfile,
        password
    }

    // 保存到用户列表
    saveUsers(users)

    // 更新当前登录的用户信息
    const { password: pwd, ...userInfo } = users[userIndex]
    localStorage.setItem('currentUser', JSON.stringify(userInfo))

    return { success: true, message: '资料更新成功' }
}

// 登出
export const logoutUser = () => {
    localStorage.removeItem('currentUser')
}

// 获取当前登录用户
export const getCurrentUser = () => {
    const user = localStorage.getItem('currentUser')
    return user ? JSON.parse(user) : null
}

// 数据验证函数
export const validateUserData = (userData) => {
    const { username, password, phone, email } = userData

    if (!username || !password || !phone || !email) {
        return false
    }

    return (
        validatePassword(password) &&
        validatePhone(phone) &&
        validateEmail(email)
    )
}

// 验证密码
export const validatePassword = (password) => {
    // 密码必须包含数字和字母的组合，且不少于8位
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)
}

// 验证手机号
export const validatePhone = (phone) => {
    // 简单的中国手机号验证
    return /^1[3-9]\d{9}$/.test(phone)
}

// 验证邮箱
export const validateEmail = (email) => {
    // 基本邮箱格式验证
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
} 