import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import api from '../config/api'
import { PERMISSIONS } from '../constants'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await api.get('/auth/me')
      if (response.data && response.data.data) {
        setUser(response.data.data)
        setIsAuthenticated(true)
      }
    } catch {
      localStorage.removeItem('accessToken')
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  const login = useCallback(async (username, password) => {
    const response = await api.post('/auth/login', { username, password })
    const { user: userData, accessToken } = response.data.data
    localStorage.setItem('accessToken', accessToken)
    setUser(userData)
    setIsAuthenticated(true)
    return userData
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('accessToken')
      setUser(null)
      setIsAuthenticated(false)
      window.location.href = '/login'
    }
  }, [])

  const hasPermission = useCallback((permission) => {
    if (!user || !user.role) return false
    const perms = user.role.permissions || []
    return perms.includes(permission)
  }, [user])

  const hasAnyPermission = useCallback((...permissions) => {
    if (!user || !user.role) return false
    const perms = user.role.permissions || []
    return permissions.some(p => perms.includes(p))
  }, [user])

  const hasRole = useCallback((roleName) => {
    if (!user || !user.role) return false
    return user.role.name === roleName
  }, [user])

  const isAdmin = useCallback(() => {
    return hasRole('admin') || hasRole('super_admin')
  }, [hasRole])

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasRole,
    isAdmin,
    refreshUser: fetchCurrentUser,
  }), [
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasRole,
    isAdmin,
    fetchCurrentUser,
  ])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

