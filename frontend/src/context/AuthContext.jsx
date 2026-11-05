import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../config/api'
import { PERMISSIONS } from '../constants'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCurrentUser = async () => {
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
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password })
    const { user: userData, accessToken } = response.data.data
    localStorage.setItem('accessToken', accessToken)
    setUser(userData)
    setIsAuthenticated(true)
    return userData
  }

  const logout = async () => {
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
  }

  const hasPermission = (permission) => {
    if (!user || !user.role) return false
    const perms = user.role.permissions || []
    return perms.includes(permission)
  }

  const hasAnyPermission = (...permissions) => {
    if (!user || !user.role) return false
    const perms = user.role.permissions || []
    return permissions.some(p => perms.includes(p))
  }

  const hasRole = (roleName) => {
    if (!user || !user.role) return false
    return user.role.name === roleName
  }

  const isAdmin = () => {
    return hasRole('admin') || hasRole('super_admin')
  }

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
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

