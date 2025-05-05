// 食品库服务

import { getCurrentUser } from './userService'

// 获取用户的食品库
export const getFoodList = () => {
    const user = getCurrentUser()
    if (!user) return []

    const foodData = localStorage.getItem('foodList')
    const foodMap = foodData ? JSON.parse(foodData) : {}

    return foodMap[user.username] || []
}

// 保存用户的食品库
export const saveFoodList = (foodList) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const foodData = localStorage.getItem('foodList')
    const foodMap = foodData ? JSON.parse(foodData) : {}

    foodMap[user.username] = foodList
    localStorage.setItem('foodList', JSON.stringify(foodMap))

    return { success: true }
}

// 添加食品
export const addFood = (name, type = '其他') => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    if (!name || name.trim() === '') {
        return { success: false, message: '请输入食品名称' }
    }

    const foodList = getFoodList()

    // 检查是否已存在相同食品
    const exists = foodList.some(food => food.name.toLowerCase() === name.trim().toLowerCase())
    if (exists) {
        return { success: false, message: '该食品已存在' }
    }

    const newFood = {
        id: Date.now().toString(),
        name: name.trim(),
        type,
        date: new Date().toISOString()
    }

    foodList.push(newFood)
    saveFoodList(foodList)

    return { success: true, food: newFood }
}

// 删除食品
export const deleteFood = (foodId) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const foodList = getFoodList()
    const filteredFoodList = foodList.filter(food => food.id !== foodId)

    if (filteredFoodList.length === foodList.length) {
        return { success: false, message: '食品不存在' }
    }

    saveFoodList(filteredFoodList)

    return { success: true }
}

// 随机推荐食品
export const getRandomFood = (type = null) => {
    const foodList = getFoodList()

    if (foodList.length === 0) {
        return { success: false, message: '食品库为空，请先添加一些食品' }
    }

    // 如果指定了类型，则按类型筛选
    const filteredList = type ? foodList.filter(food => food.type === type) : foodList

    // 如果筛选后没有符合条件的食品
    if (filteredList.length === 0) {
        return { success: false, message: `没有找到类型为"${type}"的食品` }
    }

    const randomIndex = Math.floor(Math.random() * filteredList.length)
    return { success: true, food: filteredList[randomIndex] }
}

// 食品类型列表
export const foodTypes = [
    '早餐', '正餐', '小吃', '饮品', '甜点', '其他'
]

// 初始化默认食品库(当用户食品库为空时使用)
export const initDefaultFoodList = () => {
    const foodList = getFoodList()
    if (foodList.length > 0) {
        return { success: true }
    }

    const defaultFoods = [
        { name: '米饭', type: '正餐' },
        { name: '面条', type: '正餐' },
        { name: '馒头', type: '早餐' },
        { name: '包子', type: '早餐' },
        { name: '饺子', type: '正餐' },
        { name: '披萨', type: '正餐' },
        { name: '汉堡', type: '正餐' },
        { name: '炒饭', type: '正餐' },
        { name: '寿司', type: '正餐' },
        { name: '烧烤', type: '正餐' },
        { name: '火锅', type: '正餐' },
        { name: '炸鸡', type: '小吃' },
        { name: '沙拉', type: '正餐' },
        { name: '三明治', type: '正餐' },
        { name: '烤鱼', type: '正餐' }
    ]

    const newFoodList = defaultFoods.map((food, index) => ({
        id: (Date.now() + index).toString(),
        name: food.name,
        type: food.type,
        date: new Date().toISOString()
    }))

    saveFoodList(newFoodList)
    return { success: true, foodList: newFoodList }
} 