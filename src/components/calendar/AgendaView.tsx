import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { formatThaiDate, formatMeetingTimeRange } from '../../utils/dateUtils';
import { BookingEvent } from '../../types';
import { Calendar, Clock, MapPin, User, Paperclip, ExternalLink, Video } from 'lucide-react';

export const AgendaView: React.FC = () => {
  const { filteredEvents, rooms, openDetailModal } = useCalendar();

  // เรียงลำดับตามวันและเวลา
  const sortedEvents = React.useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      const aTime = new Date(`${a.startDate}T${a.startTime || '00:00'}`).getTime();
      const bTime = new Date(`${b.startDate}T${b.startTime || '00:00'}`).getTime();
      return aTime - bTime;
    });
  }, [filteredEvents]);

  // จัดกลุ่มตามวันที่
  const groupedEvents = React.useMemo(() => {
    const map = new Map<string, BookingEvent[]>();
    sortedEvents.forEach(ev => {
      const list = map.get(ev.startDate) || [];
      list.push(ev);
      map.set(ev.startDate, list);
    });
    return Array.from(map.entries());
  }, [sortedEvents]);

  if (sortedEvents.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-700">ไม่พบรายการประชุมตามเงื่อนไขที่เลือก</h3>
        <p className="text-xs text-slate-500 mt-1">ลองล้างตัวกรองหรือเลือกช่วงเวลาใหม่อีกครั้ง</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedEvents.map(([dateStr, items]) => (
        <div key={dateStr} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Group Date Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">
                {formatThaiDate(dateStr, false)}
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
              {items.length} รายการ
            </span>
          </div>

          {/* Event Items */}
          <div className="divide-y divide-slate-100">
            {items.map(event => {
              const room = rooms.find(r => r.id === event.roomId || r.name === event.roomName);

              return (
                <div
                  key={event.id}
                  onClick={() => openDetailModal(event)}
                  className="p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="w-2.5 h-12 rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: room?.color || '#3b82f6' }}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {event.meetingFormat?.toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatMeetingTimeRange(event)}
                        </span>
                        <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {event.roomName}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                        {event.rawTitle || event.title}
                      </h4>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {event.organizerName} ({event.department})
                        </span>
                        {event.meetingId && (
                          <span className="text-blue-600 font-mono text-[11px] bg-blue-50 px-1.5 py-0.5 rounded">
                            ID: {event.meetingId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Attachment Icons */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {event.attachments && event.attachments.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                        <span>{event.attachments.length} ไฟล์</span>
                      </div>
                    )}

                    {event.meetingUrl && (
                      <a
                        href={event.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>เข้าร่วม</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ))}
    </div>
  );
};
