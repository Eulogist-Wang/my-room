// 纪念日服务

import { getCurrentUser } from './userService'

// 获取用户的纪念日列表
export const getAnniversaries = () => {
    const user = getCurrentUser()
    if (!user) return []

    const anniversariesData = localStorage.getItem('anniversaries')
    const anniversariesMap = anniversariesData ? JSON.parse(anniversariesData) : {}

    return anniversariesMap[user.username] || []
}

// 保存用户的纪念日列表
export const saveAnniversaries = (anniversaries) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const anniversariesData = localStorage.getItem('anniversaries')
    const anniversariesMap = anniversariesData ? JSON.parse(anniversariesData) : {}

    anniversariesMap[user.username] = anniversaries
    localStorage.setItem('anniversaries', JSON.stringify(anniversariesMap))

    return { success: true }
}

// 添加纪念日
export const addAnniversary = (title, date, icon, isRepeatYearly = true) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    if (!title.trim()) {
        return { success: false, message: '纪念日标题不能为空' }
    }

    if (!date) {
        return { success: false, message: '请选择纪念日日期' }
    }

    const anniversaries = getAnniversaries()

    const newAnniversary = {
        id: Date.now().toString(),
        title,
        date,
        icon: icon || '🎂',
        isRepeatYearly,
        createdAt: new Date().toISOString()
    }

    anniversaries.push(newAnniversary)
    saveAnniversaries(anniversaries)

    return { success: true, anniversary: newAnniversary }
}

// 删除纪念日
export const deleteAnniversary = (anniversaryId) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const anniversaries = getAnniversaries()
    const filteredAnniversaries = anniversaries.filter(anniversary => anniversary.id !== anniversaryId)

    if (filteredAnniversaries.length === anniversaries.length) {
        return { success: false, message: '纪念日不存在' }
    }

    saveAnniversaries(filteredAnniversaries)

    return { success: true }
}

// 更新纪念日
export const updateAnniversary = (anniversaryId, title, date, icon, isRepeatYearly) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    if (!title.trim()) {
        return { success: false, message: '纪念日标题不能为空' }
    }

    if (!date) {
        return { success: false, message: '请选择纪念日日期' }
    }

    const anniversaries = getAnniversaries()
    const index = anniversaries.findIndex(anniversary => anniversary.id === anniversaryId)

    if (index === -1) {
        return { success: false, message: '纪念日不存在' }
    }

    anniversaries[index].title = title
    anniversaries[index].date = date
    anniversaries[index].icon = icon || anniversaries[index].icon
    anniversaries[index].isRepeatYearly = isRepeatYearly

    saveAnniversaries(anniversaries)

    return { success: true, anniversary: anniversaries[index] }
}

// 计算纪念日天数
export const calculateAnniversaryDays = (date) => {
    const anniversaryDate = new Date(date)
    const today = new Date()

    // 设置时间为当天 00:00:00
    today.setHours(0, 0, 0, 0)
    anniversaryDate.setHours(0, 0, 0, 0)

    const timeDiff = today - anniversaryDate
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))

    return daysDiff
}

// 计算距离下一个周年纪念日的天数
export const calculateNextAnniversary = (date) => {
    const originalDate = new Date(date)
    const today = new Date()

    // 设置当前年份的纪念日
    const currentYearAnniversary = new Date(date)
    currentYearAnniversary.setFullYear(today.getFullYear())

    // 如果今年的纪念日已经过去，计算明年的
    if (currentYearAnniversary < today) {
        currentYearAnniversary.setFullYear(today.getFullYear() + 1)
    }

    // 计算天数差
    const timeDiff = currentYearAnniversary - today
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

    // 计算即将到来的周年数
    const years = currentYearAnniversary.getFullYear() - originalDate.getFullYear()

    return { days: daysDiff, years: years }
}

// 获取纪念日图标列表
export const anniversaryIcons = [
    '🎂', '💍', '❤️', '🎓', '🏠', '👶', '🎉', '🌟', '🏆', '✈️', '💼', '🎵'
] 