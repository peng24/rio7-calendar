import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  User, 
  Phone, 
  Building2, 
  Paperclip, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Copy, 
  Check, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import { formatFullMeetingSchedule, formatThaiDateTime } from '../../utils/dateUtils';
import { APP_CONFIG } from '../../config/constants';

export const EventDetailModal: React.FC = () => {
  const { 
    isDetailModalOpen, 
    closeDetailModal, 
    selectedEvent, 
    openBookingModal, 
    deleteBooking,
    rooms 
  } = useCalendar();

  const { currentUser, isAdmin } = useAuth();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isDetailModalOpen || !selectedEvent) return null;

  const room = rooms.find(r => r.id === selectedEvent.roomId || r.name === selectedEvent.roomName);
  
  // ตรวจสอบสิทธิ์การแก้ไข/ลบ: Admin หรือ ผู้สร้างการจองนี้
  const canModify = isAdmin || (currentUser && (
    currentUser.email === selectedEvent.createdByEmail ||
    currentUser.name === selectedEvent.organizerName
  ));

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleEdit = () => {
    closeDetailModal();
    openBookingModal({ event: selectedEvent });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBooking(selectedEvent.id, currentUser?.email);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const getFormatBadge = (format: string) => {
    switch (format?.toLowerCase()) {
      case 'zoom':
        return { label: 'ZOOM MEETING', bg: 'bg-blue-600' };
      case 'webex':
        return { label: 'CISCO WEBEX', bg: 'bg-emerald-600' };
      case 'google_meet':
        return { label: 'GOOGLE MEET', bg: 'bg-amber-600' };
      case 'ms_teams':
        return { label: 'MS TEAMS', bg: 'bg-indigo-600' };
      case 'hybrid':
        return { label: 'HYBRID MEETING', bg: 'bg-purple-600' };
      default:
        return { label: 'ONSITE (ห้องประชุม)', bg: 'bg-slate-700' };
    }
  };

  const formatInfo = getFormatBadge(selectedEvent.meetingFormat);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={closeDetailModal}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full text-white ${formatInfo.bg}`}>
              {formatInfo.label}
            </span>
            {selectedEvent.syncedWithGoogle && (
              <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-300" />
                <span>Google Calendar</span>
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-xl font-bold text-white leading-tight">
            {selectedEvent.rawTitle || selectedEvent.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-blue-200 mt-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-white">
              {formatFullMeetingSchedule(selectedEvent)}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Room & Location Info */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 font-bold"
              style={{ backgroundColor: room?.color || '#0284c7' }}
            >
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {selectedEvent.roomName}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {room?.location || 'สำนักงานชลประทานที่ 7'} • ความจุ {room?.capacity || 30} ที่นั่ง
              </p>
              {room?.equipment && room.equipment.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {room.equipment.map((eq, idx) => (
                    <span key={idx} className="bg-white border border-slate-200 text-[10px] text-slate-600 px-2 py-0.5 rounded-md">
                      {eq}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Online Meeting Join Box */}
          {(selectedEvent.meetingUrl || selectedEvent.meetingId) && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-blue-600" />
                  <span>การประชุมออนไลน์ ({selectedEvent.meetingFormat?.toUpperCase()})</span>
                </span>

                {selectedEvent.meetingUrl && (
                  <a
                    href={selectedEvent.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition-transform active:scale-95"
                  >
                    <span>เข้าร่วมการประชุม</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedEvent.meetingId && (
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Meeting ID</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {selectedEvent.meetingId}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(selectedEvent.meetingId!, 'id')}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      title="คัดลอก Meeting ID"
                    >
                      {copiedField === 'id' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {selectedEvent.passcode && (
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Passcode</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {selectedEvent.passcode}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(selectedEvent.passcode!, 'pass')}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      title="คัดลอก Passcode"
                    >
                      {copiedField === 'pass' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Organizer & Department Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">หน่วยงาน / ฝ่าย</span>
              <span className="font-semibold text-slate-800">{selectedEvent.department}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block font-medium">ผู้ประสานงาน / ผู้จอง</span>
              <span className="font-semibold text-slate-800">{selectedEvent.organizerName}</span>
            </div>

            {selectedEvent.contactPhone && (
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">เบอร์โทรศัพท์</span>
                <span className="font-semibold text-blue-700">{selectedEvent.contactPhone}</span>
              </div>
            )}

            {selectedEvent.chairman && (
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">ประธานการประชุม</span>
                <span className="font-semibold text-slate-800">{selectedEvent.chairman}</span>
              </div>
            )}
          </div>

          {/* Description & Agenda */}
          {selectedEvent.description && (
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>รายละเอียด / วาระการประชุม</span>
              </h4>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {selectedEvent.description}
              </div>
            </div>
          )}

          {/* File Attachments */}
          {selectedEvent.attachments && selectedEvent.attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-blue-600" />
                <span>เอกสารแนบการประชุม ({selectedEvent.attachments.length} ไฟล์)</span>
              </h4>
              <div className="space-y-1.5">
                {selectedEvent.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors text-xs group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="font-semibold text-slate-800 group-hover:text-blue-700 truncate">
                        {att.name}
                      </span>
                    </div>
                    <span className="text-blue-600 font-semibold flex items-center gap-1 text-[11px] flex-shrink-0">
                      เปิดดูเอกสาร <ExternalLink className="w-3 h-3" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Delete confirmation alert */}
          {confirmDelete && (
            <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl space-y-2">
              <p className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600" />
                ยืนยันการลบรายการจองห้องประชุมนี้หรือไม่?
              </p>
              <p className="text-[11px] text-red-700">
                รายการนี้จะถูกลบออกจากทั้งหน้าเว็บและ Google Calendar ({APP_CONFIG.CALENDAR_ID}) ทันที
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  {isDeleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <a
            href={APP_CONFIG.GOOGLE_CALENDAR_EMBED_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>ดูใน Google Calendar</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2">
            {canModify && !confirmDelete && (
              <>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="ลบการจอง"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>แก้ไข</span>
                </button>
              </>
            )}

            <button
              onClick={closeDetailModal}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              ปิด
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
