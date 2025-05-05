// 用户统计服务

// 获取用户统计数据
export const getUserStats = (username) => {
    if (!username) return null

    const statsData = localStorage.getItem('userStats')
    let userStats = statsData ? JSON.parse(statsData) : {}

    if (!userStats[username]) {
        userStats[username] = {
            completedTodos: 0,
            pomodoroMinutes: 0
        }
        saveUserStats(userStats)
    }

    return userStats[username]
}

// 保存用户统计数据
export const saveUserStats = (stats) => {
    localStorage.setItem('userStats', JSON.stringify(stats))
    return { success: true }
}

// 更新待办完成数
export const updateCompletedTodos = (username, count) => {
    if (!username) return { success: false, message: '用户未登录' }

    const statsData = localStorage.getItem('userStats')
    let userStats = statsData ? JSON.parse(statsData) : {}

    if (!userStats[username]) {
        userStats[username] = {
            completedTodos: 0,
            pomodoroMinutes: 0
        }
    }

    userStats[username].completedTodos = count
    saveUserStats(userStats)

    return { success: true }
}

// 增加一个已完成待办
export const incrementCompletedTodos = (username) => {
    if (!username) return { success: false, message: '用户未登录' }

    const statsData = localStorage.getItem('userStats')
    let userStats = statsData ? JSON.parse(statsData) : {}

    if (!userStats[username]) {
        userStats[username] = {
            completedTodos: 0,
            pomodoroMinutes: 0
        }
    }

    userStats[username].completedTodos += 1
    saveUserStats(userStats)

    return { success: true }
}

// 更新番茄钟总分钟数
export const updatePomodoroMinutes = (username, minutes) => {
    if (!username) return { success: false, message: '用户未登录' }

    const statsData = localStorage.getItem('userStats')
    let userStats = statsData ? JSON.parse(statsData) : {}

    if (!userStats[username]) {
        userStats[username] = {
            completedTodos: 0,
            pomodoroMinutes: 0
        }
    }

    userStats[username].pomodoroMinutes = minutes
    saveUserStats(userStats)

    return { success: true }
}

// 增加番茄钟分钟数
export const addPomodoroMinutes = (username, minutes) => {
    if (!username) return { success: false, message: '用户未登录' }

    const statsData = localStorage.getItem('userStats')
    let userStats = statsData ? JSON.parse(statsData) : {}

    if (!userStats[username]) {
        userStats[username] = {
            completedTodos: 0,
            pomodoroMinutes: 0
        }
    }

    userStats[username].pomodoroMinutes += minutes
    saveUserStats(userStats)

    return { success: true }
}
