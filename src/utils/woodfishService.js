// 赛博木鱼服务

import { getCurrentUser } from './userService'

// 获取用户的木鱼数据
export const getWoodfishData = () => {
    const user = getCurrentUser()
    if (!user) return null

    const woodfishData = localStorage.getItem('woodfish')
    const woodfishMap = woodfishData ? JSON.parse(woodfishData) : {}

    if (!woodfishMap[user.username]) {
        const initialData = {
            merits: 0, // 功德值
            totalHits: 0, // 总敲击次数
            todayHits: 0, // 今日敲击次数
            lastHitDate: null, // 最后敲击日期
            continuousDays: 0, // 连续敲击天数
            achievements: [] // 成就列表
        }
        woodfishMap[user.username] = initialData
        localStorage.setItem('woodfish', JSON.stringify(woodfishMap))
        return initialData
    }

    return woodfishMap[user.username]
}

// 保存用户的木鱼数据
export const saveWoodfishData = (data) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const woodfishData = localStorage.getItem('woodfish')
    const woodfishMap = woodfishData ? JSON.parse(woodfishData) : {}

    woodfishMap[user.username] = data
    localStorage.setItem('woodfish', JSON.stringify(woodfishMap))

    return { success: true }
}

// 敲击木鱼
export const hitWoodfish = () => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const data = getWoodfishData()

    // 增加功德值和敲击次数
    data.merits += 1
    data.totalHits += 1

    // 检查是否是新的一天
    const today = new Date().toISOString().split('T')[0]
    const lastHitDate = data.lastHitDate

    if (lastHitDate !== today) {
        // 新的一天，重置今日敲击次数
        data.todayHits = 1

        // 检查连续敲击天数
        if (lastHitDate) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toISOString().split('T')[0]

            if (lastHitDate === yesterdayStr) {
                // 连续敲击
                data.continuousDays += 1
            } else {
                // 断了连续敲击
                data.continuousDays = 1
            }
        } else {
            data.continuousDays = 1
        }

        // 更新最后敲击日期
        data.lastHitDate = today
    } else {
        // 同一天，增加今日敲击次数
        data.todayHits += 1
    }

    // 检查是否达成新成就
    checkAchievements(data)

    // 保存数据
    saveWoodfishData(data)

    return {
        success: true,
        currentMerits: data.merits,
        todayHits: data.todayHits
    }
}

// 检查是否达成新成就
const checkAchievements = (data) => {
    const meritsAchievements = [
        { id: 'merits_100', name: '功德圆满', description: '累计功德达到100', threshold: 100 },
        { id: 'merits_500', name: '功德无量', description: '累计功德达到500', threshold: 500 },
        { id: 'merits_1000', name: '佛法无边', description: '累计功德达到1000', threshold: 1000 },
        { id: 'merits_10000', name: '苦海无涯', description: '累计功德达到10000', threshold: 10000 }
    ]

    const continuousAchievements = [
        { id: 'continuous_3', name: '初心不改', description: '连续3天敲击木鱼', threshold: 3 },
        { id: 'continuous_7', name: '持之以恒', description: '连续7天敲击木鱼', threshold: 7 },
        { id: 'continuous_30', name: '修行不辍', description: '连续30天敲击木鱼', threshold: 30 },
        { id: 'continuous_100', name: '道心如一', description: '连续100天敲击木鱼', threshold: 100 }
    ]

    const dailyHitsAchievements = [
        { id: 'daily_hits_100', name: '日行一善', description: '单日敲击木鱼100次', threshold: 100 },
        { id: 'daily_hits_500', name: '日行百善', description: '单日敲击木鱼500次', threshold: 500 },
        { id: 'daily_hits_1000', name: '勤修善行', description: '单日敲击木鱼1000次', threshold: 1000 }
    ]

    // 检查功德成就
    for (const achievement of meritsAchievements) {
        if (data.merits >= achievement.threshold &&
            !data.achievements.some(a => a.id === achievement.id)) {
            data.achievements.push({
                id: achievement.id,
                name: achievement.name,
                description: achievement.description,
                date: new Date().toISOString()
            })
        }
    }

    // 检查连续敲击成就
    for (const achievement of continuousAchievements) {
        if (data.continuousDays >= achievement.threshold &&
            !data.achievements.some(a => a.id === achievement.id)) {
            data.achievements.push({
                id: achievement.id,
                name: achievement.name,
                description: achievement.description,
                date: new Date().toISOString()
            })
        }
    }

    // 检查单日敲击成就
    for (const achievement of dailyHitsAchievements) {
        if (data.todayHits >= achievement.threshold &&
            !data.achievements.some(a => a.id === achievement.id)) {
            data.achievements.push({
                id: achievement.id,
                name: achievement.name,
                description: achievement.description,
                date: new Date().toISOString()
            })
        }
    }
}

// 获取成就列表
export const getAchievements = () => {
    const data = getWoodfishData()
    return data ? data.achievements : []
} 