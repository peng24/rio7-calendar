import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import { getWeekDays, THAI_DAYS_SHORT, TIME_SLOTS, toYyyyMmDd } from '../../utils/dateUtils';
import { BookingEvent } from '../../types';
import { Plus, Paperclip } from 'lucide-react';

export const WeekView: React.FC = () => {
  const { 
    selectedDate, 
    filteredEvents, 
    rooms, 
    openDetailModal, 
    openBookingModal, 
    setIsLoginModalOpen 
  } = useCalendar();
  
  const { isAuthenticated } = useAuth();
  const weekDays = getWeekDays(selectedDate);

  const handleCellClick = (dateStr: string, timeSlot: string) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    } else {
      openBookingModal({
        date: dateStr,
        startTime: timeSlot,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Week Header */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)] bg-slate-50 border-b border-slate-200 sticky top-0 z-10 text-center">
        <div className="p-3 border-r border-slate-200 font-bold text-xs text-slate-500">
          เวลา
        </div>
        {weekDays.map((day, idx) => (
          <div
            key={day.dateString}
            className={`p-2 border-r border-slate-200 ${
              day.isToday ? 'bg-blue-50/70' : ''
            }`}
          >
            <div className={`text-[11px] font-bold ${
              idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-slate-600'
            }`}>
              {THAI_DAYS_SHORT[day.date.getDay()]}
            </div>
            <div className={`text-sm font-extrabold mt-0.5 inline-block px-2 py-0.5 rounded-full ${
              day.isToday ? 'bg-blue-600 text-white' : 'text-slate-800'
            }`}>
              {day.date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Week Time Slots Grid */}
      <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
        {TIME_SLOTS.slice(0, 18).map((slot) => (
          <div key={slot} className="grid grid-cols-[80px_repeat(7,1fr)] min-h-[56px]">
            {/* Time label */}
            <div className="p-2 text-center text-xs font-semibold text-slate-500 border-r border-slate-100 bg-slate-50/30">
              {slot}
            </div>

            {/* 7 Days Columns */}
            {weekDays.map((day) => {
              // หา Event ที่เริ่มในช่องเวลานี้ หรือครอบคลุม
              const slotEvents = filteredEvents.filter(ev => {
                if (ev.startDate !== day.dateString) return false;
                const evStart = ev.startTime || '08:30';
                return evStart.substring(0, 2) === slot.substring(0, 2);
              });

              return (
                <div
                  key={`${day.dateString}-${slot}`}
                  onClick={() => handleCellClick(day.dateString, slot)}
                  className={`p-1 border-r border-slate-100 hover:bg-blue-50/40 cursor-pointer relative group transition-colors ${
                    day.isToday ? 'bg-blue-50/20' : ''
                  }`}
                >
                  <Plus className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 absolute top-1 right-1" />

                  {slotEvents.map(event => {
                    const room = rooms.find(r => r.id === event.roomId || r.name === event.roomName);
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetailModal(event);
                        }}
                        className="bg-blue-700 hover:bg-blue-800 text-white p-1.5 rounded-lg text-[10px] mb-1 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer"
                        style={{
                          backgroundColor: event.meetingFormat === 'zoom' ? '#1d4ed8' : event.meetingFormat === 'webex' ? '#047857' : '#334155'
                        }}
                      >
                        <div className="flex items-center justify-between font-bold text-[9px]">
                          <span>{event.meetingFormat?.toUpperCase()}</span>
                          <span>{event.startTime}</span>
                        </div>
                        <div className="font-semibold truncate mt-0.5">
                          {event.rawTitle || event.title}
                        </div>
                        <div className="text-[9px] text-white/80 truncate">
                          {event.roomName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
