import { nanoid } from 'nanoid'
import { create } from 'zustand'

export type RoleKey = 'super_admin' | 'admin' | 'operator' | 'viewer' | 'auditor'

export type User = {
  id: string
  username: string
  password: string
  nickname: string
  role: RoleKey
  email: string
  status: boolean
  lastLogin: string
  createTime: string
}

type AuthState = {
  current?: User
  token?: string
  users: User[]
  hydrate: () => void
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  upsertUser: (user: Partial<User> & { id?: string }) => void
  toggleUserStatus: (id: string, status: boolean) => void
  isAuthed: () => boolean
}

const STORAGE_KEY = 'hs-auth'

const defaultUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    nickname: '管理员',
    role: 'super_admin',
    email: 'admin@hsSaving.com',
    status: true,
    lastLogin: '2025-12-01 09:00:00',
    createTime: '2025-01-01 00:00:00',
  },
  {
    id: '2',
    username: 'user1',
    password: 'user123',
    nickname: '运营专员',
    role: 'operator',
    email: 'user1@hsSaving.com',
    status: true,
    lastLogin: '2025-12-02 10:00:00',
    createTime: '2025-03-01 00:00:00',
  },
  {
    id: '3',
    username: 'audit1',
    password: 'audit123',
    nickname: '审计员',
    role: 'auditor',
    email: 'audit@hsSaving.com',
    status: true,
    lastLogin: '2025-12-03 11:00:00',
    createTime: '2025-04-01 00:00:00',
  },
]

const persistState = (data: Partial<AuthState>) => {
  const raw = localStorage.getItem(STORAGE_KEY)
  const parsed = raw ? JSON.parse(raw) : {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, ...data }))
}

const useAuthStore = create<AuthState>((set, get) => ({
  current: undefined,
  token: undefined,
  users: defaultUsers,
  hydrate: () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    set((state) => ({
      ...state,
      ...parsed,
    }))
  },
  isAuthed: () => Boolean(get().token && get().current),
  login: async (username, password) => {
    const { users } = get()
    const target = users.find((u) => u.username === username && u.password === password && u.status)
    if (target) {
      const token = nanoid()
      const next = {
        current: { ...target, lastLogin: new Date().toISOString() },
        token,
      }
      persistState(next)
      set(next)
      return true
    }
    return false
  },
  logout: () => {
    set({ current: undefined, token: undefined })
    persistState({ current: undefined, token: undefined })
  },
  upsertUser: (user) => {
    set((state) => {
      const list = [...state.users]
      if (user.id) {
        const idx = list.findIndex((u) => u.id === user.id)
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...user } as User
        }
      } else {
        list.push({
          id: nanoid(),
          username: user.username || 'user',
          password: user.password || '123456',
          nickname: user.nickname || '新用户',
          role: (user.role as RoleKey) || 'viewer',
          email: user.email || '',
          status: user.status ?? true,
          lastLogin: user.lastLogin || '-',
          createTime: new Date().toISOString(),
        })
      }
      persistState({ users: list })
      return { users: list }
    })
  },
  toggleUserStatus: (id, status) => {
    set((state) => {
      const list = state.users.map((u) => (u.id === id ? { ...u, status } : u))
      persistState({ users: list })
      return { users: list }
    })
  },
}))

export default useAuthStore

