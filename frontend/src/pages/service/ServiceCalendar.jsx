import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Tractor, 
  Plus, 
  Wrench, 
  User 
} from 'lucide-react'
import { serviceApi } from '../../api/service'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function ServiceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCalendarServices = async () => {
    try {
      setLoading(true)
      const res = await serviceApi.getServices({ limit: 100 })
      const data = res.data?.data
      setServices(Array.isArray(data) ? data : data?.services || [])
    } catch (err) {
      console.error('Failed to load calendar services:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCalendarServices()
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

  // Map services into days
  const servicesByDay = {}
  services.forEach((s) => {
    if (!s.scheduledDate) return
    const d = new Date(s.scheduledDate)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dayNum = d.getDate()
      if (!servicesByDay[dayNum]) servicesByDay[dayNum] = []
      servicesByDay[dayNum].push(s)
    }
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Service Workshop Schedule</h1>
          <p className="text-sm text-slate-500 mt-1">
            Visual calendar of upcoming tractor maintenance appointments and bay occupancy
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/service/records/new">
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
              Book Service Slot
            </Button>
          </Link>
        </div>
      </div>

      {/* Calendar Controls */}
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
            <LoadingSpinner size="md" message="Loading workshop calendar..." />
          </div>
        ) : (
          <div className="grid grid-cols-7 border-b border-slate-200/80 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/70">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-3 border-r last:border-r-0 border-slate-100">
                {d}
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-7 auto-rows-fr">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[110px] bg-slate-50/30 border-b border-r border-slate-100 p-2" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dayServices = servicesByDay[day] || []
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[110px] border-b border-r border-slate-100 p-2.5 transition-colors ${
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
                    {dayServices.length > 0 && (
                      <span className="text-[10px] font-semibold text-primary-700 bg-primary-50 px-1.5 py-0.2 rounded-full border border-primary-100">
                        {dayServices.length} {dayServices.length === 1 ? 'Job' : 'Jobs'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[85px]">
                    {dayServices.map((s) => (
                      <Link
                        key={s._id}
                        to="/service/records"
                        className="block p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs hover:border-primary-300 transition-all text-[11px]"
                      >
                        <div className="font-semibold text-slate-800 truncate">
                          {s.tractor?.model || 'Tractor Service'}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                          <User className="w-2.5 h-2.5" />
                          <span>{s.customer?.fullName || 'Walk-in'}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
