import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import { getMonthDays, THAI_DAYS_SHORT, toYyyyMmDd } from '../../utils/dateUtils';
import { BookingEvent } from '../../types';
import { Plus, Video, Users, Tv, Paperclip } from 'lucide-react';

export const MonthView: React.FC = () => {
  const { 
    selectedDate, 
    filteredEvents, 
    rooms, 
    openDetailModal, 
    openBookingModal, 
    setIsLoginModalOpen 
  } = useCalendar();
  
  const { isAuthenticated } = useAuth();

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const days = getMonthDays(year, month);
  const todayStr = toYyyyMmDd(new Date());

  // จัดกลุ่ม Events ตามวันที่ (YYYY-MM-DD)
  const eventsByDate = React.useMemo(() => {
    const map: Record<string, BookingEvent[]> = {};
    filteredEvents.forEach(ev => {
      if (!map[ev.startDate]) {
        map[ev.startDate] = [];
      }
      map[ev.startDate].push(ev);
    });
    return map;
  }, [filteredEvents]);

  const handleCellClick = (dateStr: string) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    } else {
      openBookingModal({ date: dateStr });
    }
  };

  const getFormatBadgeStyle = (format: string) => {
    switch (format?.toLowerCase()) {
      case 'zoom':
        return 'bg-blue-600 text-white border-blue-700';
      case 'webex':
        return 'bg-emerald-600 text-white border-emerald-700';
      case 'google_meet':
        return 'bg-amber-600 text-white border-amber-700';
      case 'ms_teams':
        return 'bg-indigo-600 text-white border-indigo-700';
      case 'hybrid':
        return 'bg-purple-600 text-white border-purple-700';
      default:
        return 'bg-slate-700 text-white border-slate-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Day Headers (อา. - ส.) */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5">
        {THAI_DAYS_SHORT.map((day, idx) => (
          <div
            key={day}
            className={`text-xs font-bold ${
              idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-slate-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[680px]">
        {days.map((item, idx) => {
          const isToday = item.dateString === todayStr;
          const dayEvents = eventsByDate[item.dateString] || [];
          const dayNumber = item.date.getDate();

          return (
            <div
              key={idx}
              onClick={() => handleCellClick(item.dateString)}
              className={`p-1.5 sm:p-2 relative flex flex-col justify-between group transition-colors cursor-pointer min-h-[110px] ${
                !item.isCurrentMonth
                  ? 'bg-slate-50/50 text-slate-300'
                  : isToday
                  ? 'bg-blue-50/40'
                  : 'bg-white hover:bg-slate-50/80'
              }`}
            >
              {/* Day Header Inside Cell */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center transition-colors ${
                    isToday
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : !item.isCurrentMonth
                      ? 'text-slate-400'
                      : 'text-slate-700 group-hover:text-blue-600'
                  }`}
                >
                  {dayNumber}
                </span>

                {/* Quick Add Button on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCellClick(item.dateString);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-all text-xs"
                  title="จองห้องประชุมในวันนี้"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Event Pills */}
              <div className="space-y-1 flex-1 overflow-y-auto max-h-[105px] pr-0.5 custom-scrollbar">
                {dayEvents.slice(0, 3).map((event) => {
                  const room = rooms.find(r => r.id === event.roomId || r.name === event.roomName);
                  const roomColor = room?.color || '#0284c7';

                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetailModal(event);
                      }}
                      className="group/pill flex items-center gap-1.5 p-1 rounded-lg text-[11px] font-medium border shadow-xs hover:shadow-sm transition-all hover:scale-[1.01] bg-white border-slate-200/80 hover:border-blue-400 overflow-hidden"
                      title={`${event.title} (${event.roomName})`}
                    >
                      {/* Meeting Type Badge */}
                      <span 
                        className={`text-[9px] font-extrabold uppercase px-1 py-0.2 rounded flex-shrink-0 ${getFormatBadgeStyle(event.meetingFormat)}`}
                      >
                        {event.meetingFormat === 'zoom' ? 'ZOOM' : event.meetingFormat === 'webex' ? 'WEBEX' : event.meetingFormat?.toUpperCase() || 'ONSITE'}
                      </span>

                      {/* Time and Title */}
                      <div className="flex-1 truncate flex items-center gap-1">
                        {!event.isAllDay && (
                          <span className="text-[10px] text-slate-500 font-bold flex-shrink-0">
                            {event.startTime}
                          </span>
                        )}
                        <span className="truncate text-slate-800 font-semibold">
                          {event.rawTitle || event.title}
                        </span>
                      </div>

                      {/* Attachment Icon */}
                      {event.attachments && event.attachments.length > 0 && (
                        <Paperclip className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                      )}

                      {/* Room Color Bar */}
                      <span
                        className="w-1.5 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: roomColor }}
                        title={event.roomName}
                      />
                    </div>
                  );
                })}

                {/* +More Button */}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] font-bold text-blue-600 hover:text-blue-800 pl-1">
                    + อีก {dayEvents.length - 3} การประชุม
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
