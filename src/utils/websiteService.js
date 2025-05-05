// 网站收藏服务

import { getCurrentUser } from './userService'

// 获取用户收藏的网站列表
export const getBookmarkedWebsites = () => {
    const user = getCurrentUser()
    if (!user) return []

    const websitesData = localStorage.getItem('bookmarkedWebsites')
    const websitesMap = websitesData ? JSON.parse(websitesData) : {}

    return websitesMap[user.username] || []
}

// 保存用户收藏的网站列表
export const saveBookmarkedWebsites = (websites) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const websitesData = localStorage.getItem('bookmarkedWebsites')
    const websitesMap = websitesData ? JSON.parse(websitesData) : {}

    websitesMap[user.username] = websites
    localStorage.setItem('bookmarkedWebsites', JSON.stringify(websitesMap))

    return { success: true }
}

// 添加收藏网站
export const addBookmarkedWebsite = (url, name) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    // 验证URL格式
    if (!isValidUrl(url)) {
        return { success: false, message: '请输入有效的网址' }
    }

    if (!name || name.trim() === '') {
        return { success: false, message: '请输入网站名称' }
    }

    const websites = getBookmarkedWebsites()

    // 检查是否已存在相同URL
    const exists = websites.some(site => site.url === url)
    if (exists) {
        return { success: false, message: '该网址已经收藏过了' }
    }

    const newWebsite = {
        id: Date.now().toString(),
        url: url.startsWith('http') ? url : `https://${url}`,
        name: name.trim(),
        date: new Date().toISOString()
    }

    websites.push(newWebsite)
    saveBookmarkedWebsites(websites)

    return { success: true, website: newWebsite }
}

// 删除收藏网站
export const deleteBookmarkedWebsite = (websiteId) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const websites = getBookmarkedWebsites()
    const filteredWebsites = websites.filter(website => website.id !== websiteId)

    if (filteredWebsites.length === websites.length) {
        return { success: false, message: '收藏网站不存在' }
    }

    saveBookmarkedWebsites(filteredWebsites)

    return { success: true }
}

// 验证URL是否有效
const isValidUrl = (url) => {
    // 简单验证URL格式
    const pattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
    return pattern.test(url)
} 