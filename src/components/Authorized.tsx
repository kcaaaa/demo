import { ReactNode } from 'react'
import useAuthStore from '../stores/auth'

type Props = {
  roles?: string[]
  children: ReactNode
  fallback?: ReactNode
}

const Authorized = ({ roles, children, fallback = null }: Props) => {
  const { current } = useAuthStore()
  if (!roles || roles.includes('*')) return <>{children}</>
  if (!current) return <>{fallback}</>
  if (roles.includes(current.role)) return <>{children}</>
  return <>{fallback}</>
}

export default Authorized

