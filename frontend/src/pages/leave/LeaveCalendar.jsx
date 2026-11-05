import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Plus, 
  ArrowLeft 
} from 'lucide-react'
import { leaveApi } from '../../api/leave'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function LeaveCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true)
        const res = await leaveApi.getLeaves()
        const data = res.data?.data
        setLeaves(Array.isArray(data) ? data : data?.leaves || [])
      } catch (err) {
        console.error('Failed to load leave calendar:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaves()
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Filter approved leaves spanning this month
  const leavesForMonth = leaves.filter(l => l.status === 'approved')

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/leave">
            <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Staff Absence Calendar</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Team availability, scheduled time-off, and coverage overview
            </p>
          </div>
        </div>
        <Link to="/leave/apply">
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
            Apply Leave
          </Button>
        </Link>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-slate-900">
            {monthNames[month]} {year}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center">
            <LoadingSpinner size="md" message="Loading absence schedule..." />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 border-b border-slate-200/80 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/70">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-3 border-r last:border-r-0 border-slate-100">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 auto-rows-fr">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] bg-slate-50/30 border-b border-r border-slate-100 p-2" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const curDayDate = new Date(year, month, day)
                const isToday =
                  new Date().getDate() === day &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year

                const onLeaveToday = leavesForMonth.filter((l) => {
                  const s = new Date(l.startDate)
                  const e = new Date(l.endDate)
                  s.setHours(0,0,0,0)
                  e.setHours(23,59,59,999)
                  return curDayDate >= s && curDayDate <= e
                })

                return (
                  <div
                    key={`day-${day}`}
                    className={`min-h-[100px] border-b border-r border-slate-100 p-2.5 transition-colors ${
                      isToday ? 'bg-primary-50/20' : 'hover:bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                          isToday ? 'bg-primary-600 text-white font-bold' : 'text-slate-700'
                        }`}
                      >
                        {day}
                      </span>
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-[75px]">
                      {onLeaveToday.map((l) => (
                        <div
                          key={l._id}
                          className="p-1 rounded-md bg-amber-50 border border-amber-200/70 text-[11px] text-amber-900 font-medium truncate flex items-center gap-1"
                        >
                          <User className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="truncate">{l.user?.fullName || 'Staff'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
