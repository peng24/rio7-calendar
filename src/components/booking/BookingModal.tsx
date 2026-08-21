import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  Upload, 
  Link as LinkIcon, 
  Check, 
  AlertCircle,
  Paperclip,
  Trash2,
  UserCheck
} from 'lucide-react';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import { MeetingFormat, MeetingAttachment } from '../../types';
import { APP_CONFIG } from '../../config/constants';
import { ConflictAlert } from '../common/ConflictAlert';
import { toYyyyMmDd } from '../../utils/dateUtils';

export const BookingModal: React.FC = () => {
  const { 
    isBookingModalOpen, 
    closeBookingModal, 
    editingEvent, 
    rooms, 
    meetingTypes, 
    initialRoomForBooking, 
    initialDateForBooking,
    createBooking, 
    updateBooking,
    checkConflict 
  } = useCalendar();

  const { currentUser, isPending } = useAuth();

  // Form States
  const [title, setTitle] = useState('');
  const [roomId, setRoomId] = useState(initialRoomForBooking || rooms[0]?.id || 'room-swoc7');
  const [meetingFormat, setMeetingFormat] = useState<MeetingFormat>('zoom');
  const [startDate, setStartDate] = useState(initialDateForBooking || toYyyyMmDd(new Date()));
  const [startTime, setStartTime] = useState('13:30');
  const [endDate, setEndDate] = useState(initialDateForBooking || toYyyyMmDd(new Date()));
  const [endTime, setEndTime] = useState('15:30');
  const [isAllDay, setIsAllDay] = useState(false);

  // Online Meeting details
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [passcode, setPasscode] = useState('');

  const [description, setDescription] = useState('');

  // File Attachments
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingAttachments, setExistingAttachments] = useState<MeetingAttachment[]>([]);
  const [customDriveLink, setCustomDriveLink] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // กำหนดค่าเริ่มต้นเมื่อเปิด Modal
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.rawTitle || editingEvent.title || '');
      setRoomId(editingEvent.roomId);
      setMeetingFormat(editingEvent.meetingFormat);
      setStartDate(editingEvent.startDate);
      setStartTime(editingEvent.startTime || '13:30');
      setEndDate(editingEvent.endDate || editingEvent.startDate);
      setEndTime(editingEvent.endTime || '15:30');
      setIsAllDay(editingEvent.isAllDay || false);
      setMeetingUrl(editingEvent.meetingUrl || '');
      setMeetingId(editingEvent.meetingId || '');
      setPasscode(editingEvent.passcode || '');
      setDescription(editingEvent.description || '');
      setExistingAttachments(editingEvent.attachments || []);
    } else {
      // โหมดสร้างใหม่
      setTitle('');
      setRoomId(initialRoomForBooking || rooms[0]?.id || 'room-swoc7');
      setMeetingFormat('zoom');
      setStartDate(initialDateForBooking || toYyyyMmDd(new Date()));
      setStartTime('13:30');
      setEndDate(initialDateForBooking || toYyyyMmDd(new Date()));
      setEndTime('15:30');
      setIsAllDay(false);
      setMeetingUrl('');
      setMeetingId('');
      setPasscode('');
      setDescription('');
      setSelectedFile(null);
      setExistingAttachments([]);
      setCustomDriveLink('');
    }
    setErrorMessage('');
  }, [editingEvent, isBookingModalOpen, initialRoomForBooking, initialDateForBooking, rooms]);

  // Real-time Conflict Checking
  const conflict = useMemo(() => {
    if (!roomId || !startDate || !startTime) return null;
    return checkConflict({
      id: editingEvent?.id,
      roomId: roomId,
      startDate: startDate,
      startTime: isAllDay ? '00:00' : startTime,
      endDate: endDate || startDate,
      endTime: isAllDay ? '23:59' : endTime,
      isAllDay: isAllDay,
    });
  }, [roomId, startDate, startTime, endDate, endTime, isAllDay, editingEvent, checkConflict]);

  if (!isBookingModalOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > APP_CONFIG.MAX_ATTACHMENT_SIZE_BYTES) {
        setErrorMessage(`ขนาดไฟล์เกิน ${APP_CONFIG.MAX_ATTACHMENT_SIZE_MB} MB กรุณาเลือกไฟล์ที่มีขนาดเล็กลง`);
        return;
      }
      setSelectedFile(file);
      setErrorMessage('');
    }
  };

  const handleRemoveExistingAttachment = (index: number) => {
    setExistingAttachments(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('กรุณาระบุชื่อการประชุม / วาระการประชุม');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedRoom = rooms.find(r => r.id === roomId);
      const roomName = selectedRoom ? selectedRoom.name : 'ห้องประชุม SWOC7';

      const attachmentsPayload = [...existingAttachments];
      if (customDriveLink.trim()) {
        attachmentsPayload.push({
          name: 'ลิงก์เอกสาร Google Drive',
          url: customDriveLink.trim(),
        });
      }

      // ดึงข้อมูลผู้จัดประชุมอัตโนมัติจากบัญชีผู้ใช้ที่ล็อกอินอยู่
      const finalOrganizer = editingEvent?.organizerName || currentUser?.name || 'ผู้ดูแลระบบ สชป.7 (Admin)';
      const finalDept = editingEvent?.department || currentUser?.department || 'สำนักงานชลประทานที่ 7';
      const finalPhone = editingEvent?.contactPhone || currentUser?.phone || '';

      const bookingPayload = {
        title: title.trim(),
        rawTitle: title.trim(),
        roomId: roomId,
        roomName: roomName,
        meetingFormat: meetingFormat,
        startDate: startDate,
        startTime: isAllDay ? '08:30' : startTime,
        endDate: endDate || startDate,
        endTime: isAllDay ? '16:30' : endTime,
        isAllDay: isAllDay,
        meetingUrl: meetingUrl.trim(),
        meetingId: meetingId.trim(),
        passcode: passcode.trim(),
        organizerName: finalOrganizer,
        department: finalDept,
        contactPhone: finalPhone,
        chairman: '',
        attendeeCount: 10,
        description: description.trim(),
        attachments: attachmentsPayload,
        createdByEmail: currentUser?.email || 'sarabun07@gmail.com',
        createdByUserId: currentUser?.id,
      };

      if (editingEvent) {
        await updateBooking(editingEvent.id, bookingPayload, selectedFile, currentUser?.email);
      } else {
        await createBooking(bookingPayload, selectedFile, currentUser?.email);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRoomObj = rooms.find(r => r.id === roomId);
  const isOnlineType = ['zoom', 'webex', 'google_meet', 'ms_teams', 'hybrid'].includes(meetingFormat);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {editingEvent ? 'แก้ไขการจองห้องประชุม' : 'จองห้องประชุมใหม่ (สชป.7)'}
              </h3>
              <p className="text-[11px] text-blue-200">
                ข้อมูลจะถูกบันทึกและซิงค์กับ Google Calendar (sarabun07@gmail.com)
              </p>
            </div>
          </div>
          <button
            onClick={closeBookingModal}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar text-xs sm:text-sm">
          
          {/* User badge */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl px-3.5 py-2 flex items-center justify-between text-xs text-blue-900">
            <span className="flex items-center gap-1.5 font-medium">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>ผู้จอง: <strong>{currentUser?.name || 'ผู้ดูแลระบบ สชป.7 (Admin)'}</strong> ({currentUser?.department || 'สำนักงานชลประทานที่ 7'})</span>
            </span>
          </div>

          {/* Status Warning if User is Pending */}
          {isPending && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                บัญชีของคุณยังอยู่ในสถานะ <strong>รอการอนุมัติจาก Admin</strong>
              </span>
            </div>
          )}

          {/* Real-time Conflict Alert (Warning) */}
          <ConflictAlert conflictEvent={conflict} />

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. ชื่อการประชุม / วาระ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ชื่อการประชุม / หัวข้อวาระ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น ประชุมคณะกรรมการพิจารณาจัดทำหลักเกณฑ์การคำนวณราคากลาง"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 font-medium"
            />
          </div>

          {/* 2. เลือกห้องประชุม & รูปแบบการประชุม */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* ห้องประชุม */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เลือกห้องประชุม <span className="text-red-500">*</span>
              </label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-semibold"
              >
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name} ({room.capacity} ที่นั่ง)
                  </option>
                ))}
              </select>

              {/* Room details snippet */}
              {selectedRoomObj && (
                <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedRoomObj.color }} />
                  <span>{selectedRoomObj.location}</span>
                </div>
              )}
            </div>

            {/* รูปแบบการประชุม */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รูปแบบการประชุม <span className="text-red-500">*</span>
              </label>
              <select
                value={meetingFormat}
                onChange={(e) => setMeetingFormat(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-semibold"
              >
                {meetingTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

          </div>

          {/* 3. วันที่และเวลา */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>กำหนดวันและเวลาประชุม</span>
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>ตลอดวัน</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">วันเริ่มต้น</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate < e.target.value) setEndDate(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                />
              </div>

              {!isAllDay && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">เวลาเริ่ม</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">วันสิ้นสุด</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                />
              </div>

              {!isAllDay && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">เวลาสิ้นสุด</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 4. ข้อมูลการประชุมออนไลน์ (หากเลือก Zoom / Webex / Meet) */}
          {isOnlineType && (
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200 space-y-3">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-blue-600" />
                <span>ข้อมูลการประชุมออนไลน์ ({meetingFormat.toUpperCase()})</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Meeting ID</label>
                  <input
                    type="text"
                    placeholder="เช่น 940 0752 2101"
                    value={meetingId}
                    onChange={(e) => setMeetingId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Passcode</label>
                  <input
                    type="text"
                    placeholder="เช่น 718195"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">ลิงก์การประชุม (Meeting URL)</label>
                <input
                  type="url"
                  placeholder="https://zoom.us/j/... หรือ https://cisco.webex.com/..."
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* 5. รายละเอียด / วาระการประชุม */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              รายละเอียด / วาระการประชุม
            </label>
            <textarea
              rows={3}
              placeholder="ระบุวาระการประชุม สรุปประเด็น หรือข้อความแจ้งผู้เข้าร่วมประชุม..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* 6. แนบไฟล์เอกสาร (Google Drive Folder: 1C7A4qaEHCpQqgVYV-uwnEGDzVqNGFZUO) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-blue-600" />
                <span>แนบไฟล์เอกสารการประชุม (บันทึกเข้า Google Drive สชป.7)</span>
              </span>
              <span className="text-[10px] text-slate-500">
                ขนาดสูงสุด 20 MB (PDF, Word, Excel, รูปภาพ)
              </span>
            </div>

            {/* File input */}
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white rounded-xl p-3 text-center transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-1">
                <Upload className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-semibold text-blue-700 hover:underline">
                  {selectedFile ? selectedFile.name : 'คลิกเพื่อเลือกไฟล์เอกสารวาระการประชุม'}
                </span>
                {selectedFile && (
                  <span className="text-[10px] text-slate-500">
                    ขนาด: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                )}
              </label>
            </div>

            {/* Existing Attachments List */}
            {existingAttachments.length > 0 && (
              <div className="space-y-1 mt-2">
                <span className="text-[11px] font-semibold text-slate-600">ไฟล์แนบเดิม:</span>
                {existingAttachments.map((att, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 text-xs">
                    <span className="truncate font-medium text-slate-700">📎 {att.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingAttachment(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="ลบไฟล์แนบนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* หรือแนบลิงก์ Google Drive โดยตรง */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                หรือใส่ลิงก์ Google Drive เอกสารเพิ่มเติม
              </label>
              <div className="relative">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={customDriveLink}
                  onChange={(e) => setCustomDriveLink(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeBookingModal}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 cursor-pointer rounded-xl shadow-md transition-all active:scale-95"
            >
              {isSubmitting ? (
                <span>กำลังบันทึกและซิงค์...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{editingEvent ? 'บันทึกการแก้ไข' : 'ยืนยันการจองห้อง'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
