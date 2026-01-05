import { ReactNode, useEffect } from 'react'
import { Navigate, useLocation, useMatches } from 'react-router-dom'
import useAuthStore from '../stores/auth'

type Props = {
  children: ReactNode
}

const ProtectedRoute = ({ children }: Props) => {
  const location = useLocation()
  const matches = useMatches()
  const { isAuthed, hydrate, current } = useAuthStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  if (!isAuthed()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const roles = ((matches[matches.length - 1]?.handle as any)?.roles as string[] | undefined) || undefined
  if (roles && current && !roles.includes('*') && !roles.includes(current.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

