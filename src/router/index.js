import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue')
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue')
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: () => import('../views/ResetPassword.vue')
    },
    {
        path: '/home',
        redirect: '/square',
        meta: { requiresAuth: true }
    },
    {
        path: '/square',
        name: 'Square',
        component: () => import('../views/Square.vue'),
        meta: { requiresAuth: true, showTabBar: true }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
        meta: { requiresAuth: true, showTabBar: true }
    },
    {
        path: '/edit-profile',
        name: 'EditProfile',
        component: () => import('../views/EditProfile.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/todo',
        name: 'Todo',
        component: () => import('../views/Todo.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/notes',
        name: 'Notes',
        component: () => import('../views/Notes.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/budget',
        name: 'Budget',
        component: () => import('../views/Budget.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/pomodoro',
        name: 'Pomodoro',
        component: () => import('../views/Pomodoro.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/countdown',
        name: 'Countdown',
        component: () => import('../views/Countdown.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/anniversary',
        name: 'Anniversary',
        component: () => import('../views/Anniversary.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/water',
        name: 'Water',
        component: () => import('../views/Water.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/woodfish',
        name: 'Woodfish',
        component: () => import('../views/Woodfish.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/note-edit/:id',
        name: 'NoteEdit',
        component: () => import('../views/NoteEdit.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/food',
        name: 'Food',
        component: () => import('../views/Food.vue'),
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('currentUser')

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login')
    } else {
        next()
    }
})

export default router 