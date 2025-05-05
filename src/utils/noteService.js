// 笔记服务

import { getCurrentUser } from './userService'

// 获取用户的笔记列表
export const getNotes = () => {
    const user = getCurrentUser()
    if (!user) return []

    const notesData = localStorage.getItem('notes')
    const notesMap = notesData ? JSON.parse(notesData) : {}

    return notesMap[user.username] || []
}

// 保存用户的笔记列表
export const saveNotes = (notes) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const notesData = localStorage.getItem('notes')
    const notesMap = notesData ? JSON.parse(notesData) : {}

    notesMap[user.username] = notes
    localStorage.setItem('notes', JSON.stringify(notesMap))

    return { success: true }
}

// 添加笔记
export const addNote = (title, content) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    if (!title.trim()) {
        return { success: false, message: '笔记标题不能为空' }
    }

    const notes = getNotes()

    const newNote = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }

    notes.push(newNote)
    saveNotes(notes)

    return { success: true, note: newNote }
}

// 获取笔记详情
export const getNote = (noteId) => {
    const notes = getNotes()
    return notes.find(note => note.id === noteId)
}

// 更新笔记
export const updateNote = (noteId, title, content) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    if (!title.trim()) {
        return { success: false, message: '笔记标题不能为空' }
    }

    const notes = getNotes()
    const index = notes.findIndex(note => note.id === noteId)

    if (index === -1) {
        return { success: false, message: '笔记不存在' }
    }

    notes[index].title = title
    notes[index].content = content
    notes[index].updatedAt = new Date().toISOString()

    saveNotes(notes)

    return { success: true, note: notes[index] }
}

// 删除笔记
export const deleteNote = (noteId) => {
    const user = getCurrentUser()
    if (!user) return { success: false, message: '用户未登录' }

    const notes = getNotes()
    const filteredNotes = notes.filter(note => note.id !== noteId)

    if (filteredNotes.length === notes.length) {
        return { success: false, message: '笔记不存在' }
    }

    saveNotes(filteredNotes)

    return { success: true }
} 