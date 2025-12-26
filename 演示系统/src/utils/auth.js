const STORAGE_KEY = 'auth_user'
const CREDENTIAL_KEY = 'auth_credentials'

const ROLE_ROUTES = {
  admin: [
    '/',
    '/station-analysis',
    '/energy-ratio',
    '/energy-alert',
    '/multi-station-compare',
    '/energy-strategy',
    '/device-management',
    '/system-management'
  ],
  single: ['/', '/station-analysis', '/energy-alert', '/energy-strategy'],
  multi: [
    '/',
    '/multi-station-compare',
    '/energy-ratio',
    '/energy-alert',
    '/energy-strategy',
    '/device-management'
  ]
}

const DEFAULT_ACCOUNTS = {
  admin: { username: 'admin', password: '123456', role: 'admin', displayName: '管理员' },
  single: { username: 'danz', password: '123456', role: 'single', displayName: '单站演示' },
  multi: { username: 'duoz', password: '123456', role: 'multi', displayName: '多站演示' }
}

const loadCustomCredentials = () => {
  try {
    const raw = localStorage.getItem(CREDENTIAL_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

const persistCredentials = (role, payload) => {
  const current = loadCustomCredentials()
  current[role] = { ...(current[role] || {}), ...payload }
  localStorage.setItem(CREDENTIAL_KEY, JSON.stringify(current))
}

const getAllCredentials = () => {
  const custom = loadCustomCredentials()
  return {
    admin: { ...DEFAULT_ACCOUNTS.admin, ...(custom.admin || {}) },
    single: { ...DEFAULT_ACCOUNTS.single, ...(custom.single || {}) },
    multi: { ...DEFAULT_ACCOUNTS.multi, ...(custom.multi || {}) }
  }
}

export const getAllowedRoutes = (role) => ROLE_ROUTES[role] || ['/']

export const getHomePath = (role) => getAllowedRoutes(role)[0] || '/'

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export const setCurrentUser = (user) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export const clearCurrentUser = () => {
  localStorage.removeItem(STORAGE_KEY)
}

export const login = (username, password) => {
  const credentials = Object.values(getAllCredentials())
  const matched = credentials.find(
    (acc) => acc.username === username && acc.password === password
  )
  if (!matched) return null

  const payload = {
    username: matched.username,
    displayName: matched.displayName || matched.username,
    role: matched.role,
    allowedRoutes: getAllowedRoutes(matched.role)
  }
  setCurrentUser(payload)
  return payload
}

export const logout = () => {
  clearCurrentUser()
}

export const updateProfile = (updates = {}) => {
  const user = getCurrentUser()
  if (!user) return null

  const all = getAllCredentials()
  const current = all[user.role]
  const newCreds = { ...current }
  if (updates.username) newCreds.username = updates.username
  if (updates.password) newCreds.password = updates.password
  if (updates.displayName) newCreds.displayName = updates.displayName

  persistCredentials(user.role, {
    username: newCreds.username,
    password: newCreds.password,
    displayName: newCreds.displayName
  })

  const updatedUser = {
    ...user,
    username: newCreds.username,
    displayName: newCreds.displayName || newCreds.username
  }
  setCurrentUser(updatedUser)
  return updatedUser
}

export const hasAccess = (path) => {
  const user = getCurrentUser()
  if (!user) return false
  const allowed = getAllowedRoutes(user.role)
  return allowed.includes(path)
}

export default {
  getAllowedRoutes,
  getHomePath,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  login,
  logout,
  updateProfile,
  hasAccess
}

