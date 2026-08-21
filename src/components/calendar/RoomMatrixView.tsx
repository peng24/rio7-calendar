import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import { formatThaiDate, TIME_SLOTS, toYyyyMmDd } from '../../utils/dateUtils';
import { Users, Plus, Paperclip, ChevronLeft, ChevronRight } from 'lucide-react';

export const RoomMatrixView: React.FC = () => {
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
  const currentDateStr = toYyyyMmDd(selectedDate);

  // กรองเฉพาะ Event ที่เกิดขึ้นในวันที่เลือก
  const dayEvents = filteredEvents.filter(ev => {
    return ev.startDate <= currentDateStr && ev.endDate >= currentDateStr;
  });

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

  const handleSlotClick = (roomId: string, timeSlot: string) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    } else {
      openBookingModal({
        roomId: roomId,
        date: currentDateStr,
        startTime: timeSlot,
      });
    }
  };

  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 8 * 60;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header with Date Navigation */}
      <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>ผังการใช้ห้องประชุมประจำวัน (Room Timeline Matrix)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            คลิกที่ช่องว่างของห้องที่ต้องการเพื่อเริ่มจองห้องประชุมทันที
          </p>
        </div>

        {/* Date Stepper */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <button
            onClick={handlePrevDay}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            title="วันก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-blue-900 px-2 min-w-[130px] text-center">
            {formatThaiDate(selectedDate, false)}
          </span>
          <button
            onClick={handleNextDay}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            title="วันถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          
          {/* Time Header Row */}
          <div className="grid grid-cols-[220px_repeat(20,1fr)] bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-600 sticky top-0 z-10">
            <div className="p-3 border-r border-slate-200 bg-slate-100 flex items-center font-bold text-slate-700">
              ห้องประชุม / เวลา
            </div>
            {TIME_SLOTS.slice(0, 20).map((slot) => (
              <div
                key={slot}
                className="py-2.5 text-center border-r border-slate-200/70 text-[11px] text-slate-600"
              >
                {slot}
              </div>
            ))}
          </div>

          {/* Room Rows */}
          <div className="divide-y divide-slate-200">
            {rooms.map((room) => {
              const roomEvents = dayEvents.filter(
                ev => ev.roomId === room.id || ev.roomName === room.name
              );

              return (
                <div
                  key={room.id}
                  className="grid grid-cols-[220px_repeat(20,1fr)] min-h-[90px] group/row relative hover:bg-slate-50/40 transition-colors"
                >
                  {/* Room Info Column */}
                  <div className="p-3 border-r border-slate-200 bg-white group-hover/row:bg-slate-50/70 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: room.color }}
                        />
                        <h4 className="text-xs font-bold text-slate-800 leading-tight">
                          {room.name}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                        {room.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-2">
                      <span className="flex items-center gap-0.5 font-medium">
                        <Users className="w-3 h-3 text-slate-400" />
                        {room.capacity} ที่นั่ง
                      </span>
                    </div>
                  </div>

                  {/* 20 Time Slot Cells */}
                  {TIME_SLOTS.slice(0, 20).map((slot) => (
                    <div
                      key={slot}
                      onClick={() => handleSlotClick(room.id, slot)}
                      className="border-r border-slate-100 hover:bg-blue-50/50 cursor-pointer relative group/slot transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover/slot:opacity-100 transition-opacity" />
                    </div>
                  ))}

                  {/* Absolute Positioned Event Overlays */}
                  {roomEvents.map((event) => {
                    const startMin = timeToMinutes(event.startTime || '08:30');
                    const endMin = timeToMinutes(event.endTime || '16:30');
                    const gridStartMin = 8 * 60; // 08:00
                    const totalGridMinutes = 10 * 60; // 08:00 to 18:00 (10 hours = 600 mins)

                    // คำนวณตำแหน่ง Left และ Width เป็นเปอร์เซ็นต์
                    const clampedStart = Math.max(startMin, gridStartMin);
                    const clampedEnd = Math.min(endMin, gridStartMin + totalGridMinutes);
                    
                    const leftPercent = ((clampedStart - gridStartMin) / totalGridMinutes) * 100;
                    const widthPercent = Math.max(((clampedEnd - clampedStart) / totalGridMinutes) * 100, 4);

                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetailModal(event);
                        }}
                        style={{
                          left: `calc(220px + (100% - 220px) * ${leftPercent / 100})`,
                          width: `calc((100% - 220px) * ${widthPercent / 100} - 6px)`,
                          backgroundColor: event.meetingFormat === 'zoom' ? '#1e40af' : event.meetingFormat === 'webex' ? '#065f46' : '#1e293b',
                          borderColor: 'rgba(255,255,255,0.2)'
                        }}
                        className="absolute top-2 bottom-2 z-10 rounded-xl p-2 shadow-md cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg border flex flex-col justify-between overflow-hidden text-white"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-extrabold uppercase bg-white/20 px-1 py-0.5 rounded">
                            {event.meetingFormat?.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-white/90">
                            {event.startTime} - {event.endTime}
                          </span>
                        </div>

                        <div className="truncate font-bold text-xs text-white mt-1">
                          {event.rawTitle || event.title}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-white/80 mt-1 truncate">
                          <span>👤 {event.organizerName}</span>
                          {event.attachments?.length > 0 && (
                            <Paperclip className="w-3 h-3 text-amber-300" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
