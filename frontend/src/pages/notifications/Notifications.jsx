import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  MessageSquare, 
  Calendar, 
  Wrench, 
  Users 
} from 'lucide-react'
import { notificationsApi } from '../../api/notifications'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await notificationsApi.getNotifications()
      const data = res.data?.data
      setNotifications(Array.isArray(data) ? data : data?.notifications || [])
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Activity Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time alerts for lead assignments, scheduled follow-ups, and service alerts
          </p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <Button
            variant="secondary"
            size="sm"
            icon={<CheckCheck className="w-4 h-4" />}
            onClick={handleMarkAllAsRead}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="md" message="Loading notifications..." />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-10 h-10 text-slate-300" />}
            title="All Caught Up"
            description="You have no notifications or pending operational alerts right now."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                className={`p-4 sm:px-6 transition-colors flex items-start justify-between gap-4 cursor-pointer ${
                  n.isRead ? 'hover:bg-slate-50/60' : 'bg-primary-50/20 hover:bg-primary-50/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    n.isRead ? 'bg-slate-100 text-slate-500' : 'bg-primary-100 text-primary-700'
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${n.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                        {n.title || 'System Notification'}
                      </span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMarkAsRead(n._id)
                    }}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
