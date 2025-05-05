// 饮水习惯服务

import { getCurrentUser } from './userService'

// 获取用户的饮水记录
export const getWaterRecords = () => {
    const user = getCurrentUser()
    if (!user) return []

    const waterData = localStorage.getItem('waterRecords')
    const waterMap = waterData ? JSON.parse(waterData) : {}

    if (!waterMap[user.username]) {
        return []
    }

    return waterMap[user.username]
}

// 保存用户的饮水记录
export const saveWaterRecords = (records) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const waterData = localStorage.getItem('waterRecords')
    const waterMap = waterData ? JSON.parse(waterData) : {}

    waterMap[user.username] = records
    localStorage.setItem('waterRecords', JSON.stringify(waterMap))

    return { success: true }
}

// 获取用户饮水设置
export const getWaterSettings = () => {
    const user = getCurrentUser()
    if (!user) return null

    const settingsData = localStorage.getItem('waterSettings')
    const settingsMap = settingsData ? JSON.parse(settingsData) : {}

    // 默认设置
    if (!settingsMap[user.username]) {
        const defaultSettings = {
            dailyGoal: 2000, // 每日目标，毫升
            cupSize: 250, // 杯子容量，毫升
            remindEnabled: false, // 是否启用提醒
            remindInterval: 60 // 提醒间隔，分钟
        }

        settingsMap[user.username] = defaultSettings
        localStorage.setItem('waterSettings', JSON.stringify(settingsMap))

        return defaultSettings
    }

    return settingsMap[user.username]
}

// 保存用户饮水设置
export const saveWaterSettings = (settings) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const settingsData = localStorage.getItem('waterSettings')
    const settingsMap = settingsData ? JSON.parse(settingsData) : {}

    settingsMap[user.username] = settings
    localStorage.setItem('waterSettings', JSON.stringify(settingsMap))

    return { success: true }
}

// 添加饮水记录
export const addWaterRecord = (amount) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    if (!amount || amount <= 0) {
        return { success: false, message: '请输入有效的饮水量' }
    }

    const now = new Date()
    const today = now.toISOString().split('T')[0] // 获取当前日期，格式：YYYY-MM-DD

    const records = getWaterRecords()

    // 查找今天的记录
    const todayIndex = records.findIndex(r => r.date === today)

    if (todayIndex === -1) {
        // 今天还没有记录，创建新记录
        const newRecord = {
            date: today,
            total: amount,
            details: [{
                id: Date.now().toString(),
                amount,
                time: now.toISOString()
            }]
        }

        records.push(newRecord)
    } else {
        // 更新今天的记录
        records[todayIndex].total += amount
        records[todayIndex].details.push({
            id: Date.now().toString(),
            amount,
            time: now.toISOString()
        })
    }

    saveWaterRecords(records)

    return { success: true }
}

// 删除饮水记录
export const deleteWaterRecord = (recordId) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const records = getWaterRecords()
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    // 查找今天的记录
    const todayIndex = records.findIndex(r => r.date === today)

    if (todayIndex === -1) {
        return { success: false, message: '今天没有饮水记录' }
    }

    // 查找要删除的记录
    const detailIndex = records[todayIndex].details.findIndex(d => d.id === recordId)

    if (detailIndex === -1) {
        return { success: false, message: '饮水记录不存在' }
    }

    // 更新总饮水量
    const amount = records[todayIndex].details[detailIndex].amount
    records[todayIndex].total -= amount

    // 删除记录
    records[todayIndex].details.splice(detailIndex, 1)

    // 如果今天没有记录了，删除今天的整个记录
    if (records[todayIndex].details.length === 0) {
        records.splice(todayIndex, 1)
    }

    saveWaterRecords(records)

    return { success: true }
}

// 获取今日饮水量
export const getTodayWaterAmount = () => {
    const records = getWaterRecords()
    const today = new Date().toISOString().split('T')[0]

    const todayRecord = records.find(r => r.date === today)

    return todayRecord ? todayRecord.total : 0
}

// 获取近七天饮水数据
export const getWeekWaterData = () => {
    const records = getWaterRecords()
    const result = []

    // 获取过去7天的日期
    for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]

        const dayRecord = records.find(r => r.date === dateStr)

        result.push({
            date: dateStr,
            amount: dayRecord ? dayRecord.total : 0
        })
    }

    return result
} 