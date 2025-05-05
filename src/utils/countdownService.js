// 倒数日服务

import { getCurrentUser } from './userService'

// 获取用户的倒数日列表
export const getCountdowns = () => {
    const user = getCurrentUser()
    if (!user) return []

    const countdownsData = localStorage.getItem('countdowns')
    const countdownsMap = countdownsData ? JSON.parse(countdownsData) : {}

    return countdownsMap[user.username] || []
}

// 保存用户的倒数日列表
export const saveCountdowns = (countdowns) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const countdownsData = localStorage.getItem('countdowns')
    const countdownsMap = countdownsData ? JSON.parse(countdownsData) : {}

    countdownsMap[user.username] = countdowns
    localStorage.setItem('countdowns', JSON.stringify(countdownsMap))

    return { success: true }
}

// 添加倒数日
export const addCountdown = (title, targetDate, color) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    if (!title.trim()) {
        return { success: false, message: '倒数日标题不能为空' }
    }

    if (!targetDate) {
        return { success: false, message: '请选择目标日期' }
    }

    const countdowns = getCountdowns()

    const newCountdown = {
        id: Date.now().toString(),
        title,
        targetDate,
        color: color || '#3498db',
        createdAt: new Date().toISOString()
    }

    countdowns.push(newCountdown)
    saveCountdowns(countdowns)

    return { success: true, countdown: newCountdown }
}

// 删除倒数日
export const deleteCountdown = (countdownId) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const countdowns = getCountdowns()
    const filteredCountdowns = countdowns.filter(countdown => countdown.id !== countdownId)

    if (filteredCountdowns.length === countdowns.length) {
        return { success: false, message: '倒数日不存在' }
    }

    saveCountdowns(filteredCountdowns)

    return { success: true }
}

// 更新倒数日
export const updateCountdown = (countdownId, title, targetDate, color) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    if (!title.trim()) {
        return { success: false, message: '倒数日标题不能为空' }
    }

    if (!targetDate) {
        return { success: false, message: '请选择目标日期' }
    }

    const countdowns = getCountdowns()
    const index = countdowns.findIndex(countdown => countdown.id === countdownId)

    if (index === -1) {
        return { success: false, message: '倒数日不存在' }
    }

    countdowns[index].title = title
    countdowns[index].targetDate = targetDate
    countdowns[index].color = color || countdowns[index].color

    saveCountdowns(countdowns)

    return { success: true, countdown: countdowns[index] }
}

// 计算倒数天数
export const calculateDaysLeft = (targetDate) => {
    const target = new Date(targetDate)
    const today = new Date()

    // 设置时间为当天 00:00:00
    today.setHours(0, 0, 0, 0)
    target.setHours(0, 0, 0, 0)

    const timeDiff = target - today
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

    return daysDiff
} 