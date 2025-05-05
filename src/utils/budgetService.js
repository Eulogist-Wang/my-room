// 记账服务

import { getCurrentUser } from './userService'

// 获取用户的记账列表
export const getTransactions = () => {
    const user = getCurrentUser()
    if (!user) return []

    const transactionsData = localStorage.getItem('transactions')
    const transactionsMap = transactionsData ? JSON.parse(transactionsData) : {}

    return transactionsMap[user.username] || []
}

// 保存用户的记账列表
export const saveTransactions = (transactions) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const transactionsData = localStorage.getItem('transactions')
    const transactionsMap = transactionsData ? JSON.parse(transactionsData) : {}

    transactionsMap[user.username] = transactions
    localStorage.setItem('transactions', JSON.stringify(transactionsMap))

    return { success: true }
}

// 添加记账
export const addTransaction = (amount, type, category, description) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    if (isNaN(amount) || amount <= 0) {
        return { success: false, message: '请输入有效金额' }
    }

    if (!type) {
        return { success: false, message: '请选择交易类型' }
    }

    if (!category) {
        return { success: false, message: '请选择交易分类' }
    }

    const transactions = getTransactions()

    const newTransaction = {
        id: Date.now().toString(),
        amount: Number(amount),
        type, // 'income' 或 'expense'
        category,
        description,
        date: new Date().toISOString()
    }

    transactions.push(newTransaction)
    saveTransactions(transactions)

    return { success: true, transaction: newTransaction }
}

// 删除记账
export const deleteTransaction = (transactionId) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const transactions = getTransactions()
    const filteredTransactions = transactions.filter(transaction => transaction.id !== transactionId)

    if (filteredTransactions.length === transactions.length) {
        return { success: false, message: '记录不存在' }
    }

    saveTransactions(filteredTransactions)

    return { success: true }
}

// 获取收入、支出及结余统计
export const getBudgetStats = () => {
    const transactions = getTransactions()

    let totalIncome = 0
    let totalExpense = 0

    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount
        } else if (transaction.type === 'expense') {
            totalExpense += transaction.amount
        }
    })

    return {
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense
    }
}

// 获取分类汇总数据
export const getCategorySummary = () => {
    const transactions = getTransactions()

    // 按类型和分类汇总
    const incomeSummary = {}
    const expenseSummary = {}

    // 初始化所有分类为0
    incomeCategories.forEach(category => {
        incomeSummary[category] = 0
    })

    expenseCategories.forEach(category => {
        expenseSummary[category] = 0
    })

    // 汇总每个分类的金额
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            incomeSummary[transaction.category] += transaction.amount
        } else if (transaction.type === 'expense') {
            expenseSummary[transaction.category] += transaction.amount
        }
    })

    // 计算分类占比
    const totalIncome = Object.values(incomeSummary).reduce((sum, amount) => sum + amount, 0)
    const totalExpense = Object.values(expenseSummary).reduce((sum, amount) => sum + amount, 0)

    const incomeWithPercentage = Object.entries(incomeSummary).map(([category, amount]) => {
        return {
            category,
            amount,
            percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0
        }
    }).sort((a, b) => b.amount - a.amount)

    const expenseWithPercentage = Object.entries(expenseSummary).map(([category, amount]) => {
        return {
            category,
            amount,
            percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
        }
    }).sort((a, b) => b.amount - a.amount)

    return {
        income: incomeWithPercentage,
        expense: expenseWithPercentage
    }
}

// 分类列表
export const incomeCategories = [
    '工资', '奖金', '兼职', '投资', '理财', '其他收入'
]

export const expenseCategories = [
    '餐饮', '购物', '交通', '住房', '娱乐', '医疗', '教育', '旅行', '其他支出'
] 