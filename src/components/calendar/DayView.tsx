import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import { formatThaiDate, TIME_SLOTS, toYyyyMmDd } from '../../utils/dateUtils';
import { Plus, Users, Clock, Paperclip, ChevronLeft, ChevronRight, Video } from 'lucide-react';

export const DayView: React.FC = () => {
  const { 
    selectedDate, 
    setSelectedDate, 
    filteredEvents, 
    rooms, 
    openDetailModal, 
    openBookingModal, 
    setIsLoginModalOpen 
  } = useCalendar();
  
  const { isAuthenticated } = useAuth();
  const dateStr = toYyyyMmDd(selectedDate);

  const dayEvents = filteredEvents.filter(ev => ev.startDate === dateStr || (ev.startDate <= dateStr && ev.endDate >= dateStr));

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Day Subheader */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button onClick={handlePrevDay} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-slate-800 px-2">
              {formatThaiDate(selectedDate, false)}
            </span>
            <button onClick={handleNextDay} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            if (!isAuthenticated) setIsLoginModalOpen(true);
            else openBookingModal({ date: dateStr });
          }}
          className="flex items-center gap-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl shadow transition-transform active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>จองห้องวันนี้</span>
        </button>
      </div>

      {/* Hourly Schedule */}
      <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
        {TIME_SLOTS.slice(0, 18).map(slot => {
          const slotEvents = dayEvents.filter(ev => {
            const evStart = ev.startTime || '08:30';
            return evStart.substring(0, 2) === slot.substring(0, 2);
          });

          return (
            <div key={slot} className="grid grid-cols-[90px_1fr] min-h-[64px] hover:bg-slate-50/50 transition-colors">
              <div className="p-3 text-xs font-bold text-slate-500 border-r border-slate-100 bg-slate-50/40 text-center">
                {slot} น.
              </div>

              <div className="p-2 flex flex-col gap-2">
                {slotEvents.map(event => {
                  const room = rooms.find(r => r.id === event.roomId || r.name === event.roomName);
                  return (
                    <div
                      key={event.id}
                      onClick={() => openDetailModal(event)}
                      className="p-3 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      style={{ borderLeftColor: room?.color || '#3b82f6', borderLeftWidth: '4px' }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {event.meetingFormat?.toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-slate-600">
                            {event.startTime} - {event.endTime} น.
                          </span>
                          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            📍 {event.roomName}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          {event.rawTitle || event.title}
                        </h4>
                        <div className="text-xs text-slate-500 mt-0.5">
                          ผู้จอง: {event.organizerName} ({event.department})
                        </div>
                      </div>

                      {event.attachments && event.attachments.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg self-start sm:self-center">
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>{event.attachments.length} ไฟล์แนบ</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
