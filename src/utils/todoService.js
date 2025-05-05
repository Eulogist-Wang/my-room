// 待办事项服务

import { getCurrentUser } from './userService'
import { incrementCompletedTodos, updateCompletedTodos } from './statsService'

// 获取用户的待办事项列表
export const getTodos = () => {
    const user = getCurrentUser()
    if (!user) return []

    const todosData = localStorage.getItem('todos')
    const todosMap = todosData ? JSON.parse(todosData) : {}

    return todosMap[user.username] || []
}

// 保存用户的待办事项列表
export const saveTodos = (todos) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const todosData = localStorage.getItem('todos')
    const todosMap = todosData ? JSON.parse(todosData) : {}

    todosMap[user.username] = todos
    localStorage.setItem('todos', JSON.stringify(todosMap))

    // 更新用户统计数据
    const completedCount = todos.filter(todo => todo.completed).length
    updateCompletedTodos(user.username, completedCount)

    return { success: true }
}

// 添加待办事项
export const addTodo = (content) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    if (!content.trim()) {
        return { success: false, message: '待办内容不能为空' }
    }

    const todos = getTodos()

    const newTodo = {
        id: Date.now().toString(),
        content,
        completed: false,
        createdAt: new Date().toISOString()
    }

    todos.push(newTodo)
    saveTodos(todos)

    return { success: true, todo: newTodo }
}

// 删除待办事项
export const deleteTodo = (todoId) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    let todos = getTodos()
    todos = todos.filter(todo => todo.id !== todoId)

    saveTodos(todos)

    return { success: true }
}

// 更新待办事项
export const updateTodo = (todoId, content) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const todos = getTodos()
    const index = todos.findIndex(todo => todo.id === todoId)

    if (index === -1) {
        return { success: false, message: '待办事项不存在' }
    }

    todos[index].content = content
    saveTodos(todos)

    return { success: true }
}

// 切换待办事项完成状态
export const toggleTodoStatus = (todoId) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const todos = getTodos()
    const index = todos.findIndex(todo => todo.id === todoId)

    if (index === -1) {
        return { success: false, message: '待办事项不存在' }
    }

    const wasCompleted = todos[index].completed
    todos[index].completed = !wasCompleted

    // 如果是标记为已完成，更新完成统计
    if (!wasCompleted && todos[index].completed) {
        incrementCompletedTodos(user.username)
    }

    saveTodos(todos)

    return { success: true }
} 