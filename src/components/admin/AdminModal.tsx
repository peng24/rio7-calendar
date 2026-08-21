import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Users, 
  DoorOpen, 
  Video, 
  Cloud, 
  Check, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Edit, 
  ExternalLink,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import { User, UserRole, MeetingRoom, MeetingTypeOption } from '../../types';
import { StorageService } from '../../utils/storage';
import { APP_CONFIG } from '../../config/constants';
import { ApiService } from '../../services/api';
import { formatThaiDateTime } from '../../utils/dateUtils';

export const AdminModal: React.FC = () => {
  const { 
    isAdminModalOpen, 
    setIsAdminModalOpen, 
    rooms, 
    meetingTypes, 
    syncNow, 
    syncStatus,
    refreshRoomsAndTypes 
  } = useCalendar();

  const { usersList, refreshUsers, updateUserRole, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'users' | 'rooms' | 'types' | 'sync'>('users');
  
  // Google Apps Script Configuration
  const [gasUrl, setGasUrl] = useState(StorageService.getGasApiUrl());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Manage Rooms State
  const [roomList, setRoomList] = useState<MeetingRoom[]>(rooms);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomLocation, setNewRoomLocation] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState<number>(30);
  const [newRoomColor, setNewRoomColor] = useState('#0284c7');

  useEffect(() => {
    if (isAdminModalOpen) {
      refreshUsers();
      setGasUrl(StorageService.getGasApiUrl());
      setRoomList(rooms);
    }
  }, [isAdminModalOpen, refreshUsers, rooms]);

  if (!isAdminModalOpen) return null;

  const handleSaveGasUrl = () => {
    StorageService.saveGasApiUrl(gasUrl);
    setSaveStatus('บันทึกการตั้งค่า Google Apps Script เรียบร้อยแล้ว');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    await updateUserRole(userId, role);
  };

  const handleAddRoom = () => {
    if (!newRoomName.trim()) return;
    const newRoom: MeetingRoom = {
      id: 'room_' + Date.now(),
      name: newRoomName.trim(),
      location: newRoomLocation.trim() || 'สำนักงานชลประทานที่ 7',
      capacity: Number(newRoomCapacity) || 20,
      color: newRoomColor,
      equipment: ['Smart TV', 'ไมโครโฟน', 'ระบบเสียง'],
      isActive: true,
    };

    const updated = [...roomList, newRoom];
    setRoomList(updated);
    ApiService.saveRooms(updated);
    refreshRoomsAndTypes();
    
    // Reset Form
    setNewRoomName('');
    setNewRoomLocation('');
    setNewRoomCapacity(30);
  };

  const handleDeleteRoom = (id: string) => {
    if (roomList.length <= 1) {
      alert('ต้องมีห้องประชุมอย่างน้อย 1 ห้อง');
      return;
    }
    const updated = roomList.filter(r => r.id !== id);
    setRoomList(updated);
    ApiService.saveRooms(updated);
    refreshRoomsAndTypes();
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 font-bold px-2 py-0.5 rounded text-[10px]">ผู้ดูแลระบบ (Admin)</span>;
      case 'user':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">อนุมัติแล้ว (User)</span>;
      case 'pending':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded text-[10px] animate-pulse">รออนุมัติสิทธิ์ (Pending)</span>;
      case 'disabled':
        return <span className="bg-red-100 text-red-800 border border-red-300 font-bold px-2 py-0.5 rounded text-[10px]">ระงับการใช้งาน</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">แผงควบคุมระบบ (Admin Dashboard)</h3>
              <p className="text-xs text-blue-200">จัดการสิทธิ์ผู้ใช้งาน, ห้องประชุม, และการซิงค์ข้อมูล</p>
            </div>
          </div>
          <button
            onClick={() => setIsAdminModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="grid grid-cols-4 bg-slate-100 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 flex items-center justify-center gap-1.5 transition-all border-b-2 ${
              activeTab === 'users'
                ? 'bg-white text-blue-700 font-bold border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>อนุมัติผู้ใช้งาน ({usersList.filter(u => u.role === 'pending').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`py-3 flex items-center justify-center gap-1.5 transition-all border-b-2 ${
              activeTab === 'rooms'
                ? 'bg-white text-blue-700 font-bold border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <DoorOpen className="w-4 h-4" />
            <span>ห้องประชุม</span>
          </button>

          <button
            onClick={() => setActiveTab('types')}
            className={`py-3 flex items-center justify-center gap-1.5 transition-all border-b-2 ${
              activeTab === 'types'
                ? 'bg-white text-blue-700 font-bold border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>รูปแบบประชุม</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`py-3 flex items-center justify-center gap-1.5 transition-all border-b-2 ${
              activeTab === 'sync'
                ? 'bg-white text-blue-700 font-bold border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Google Sync</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-xs sm:text-sm">
          
          {/* TAB 1: USERS APPROVAL */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">รายชื่อผู้ใช้งานและคำขออนุมัติสิทธิ์</h4>
                  <p className="text-xs text-slate-500">ผู้ใช้ที่ลงทะเบียนใหม่ต้องได้รับการอนุมัติก่อนจึงจะสามารถจองห้องประชุมได้</p>
                </div>
                <button
                  onClick={refreshUsers}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors border border-blue-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>รีเฟรช</span>
                </button>
              </div>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {usersList.map((user) => (
                  <div key={user.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{user.name}</span>
                        {getRoleBadge(user.role)}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        📧 {user.email} • 🏢 {user.department} • 📞 {user.phone}
                      </div>
                      {user.approvedBy && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          อนุมัติโดย: {user.approvedBy} ({formatThaiDateTime(user.approvedAt?.split('T')[0] || '')})
                        </div>
                      )}
                    </div>

                    {/* Role Action Controls */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {user.role === 'pending' && (
                        <button
                          onClick={() => handleRoleChange(user.id, 'user')}
                          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>อนุมัติใช้งาน</span>
                        </button>
                      )}

                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleRoleChange(user.id, 'admin')}
                          className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold rounded-lg text-xs"
                          title="มอบสิทธิ์ Admin"
                        >
                          ตั้งเป็น Admin
                        </button>
                      )}

                      {user.role !== 'user' && user.role !== 'pending' && (
                        <button
                          onClick={() => handleRoleChange(user.id, 'user')}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                        >
                          สิทธิ์ User ปกติ
                        </button>
                      )}

                      {user.role !== 'disabled' && user.email !== currentUser?.email && (
                        <button
                          onClick={() => handleRoleChange(user.id, 'disabled')}
                          className="px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs"
                          title="ระงับการใช้งาน"
                        >
                          ระงับสิทธิ์
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ROOMS */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">จัดการห้องประชุม สชป.7</h4>
                  <p className="text-xs text-slate-500">เพิ่ม ลบ หรือแก้ไขห้องประชุมสำหรับให้บริการ</p>
                </div>
              </div>

              {/* Add Room Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h5 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>เพิ่มห้องประชุมใหม่</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">ชื่อห้องประชุม</label>
                    <input
                      type="text"
                      placeholder="เช่น ห้องประชุมสารบรรณ"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">สถานที่ / อาคาร</label>
                    <input
                      type="text"
                      placeholder="เช่น อาคารอำนวยการ ชั้น 2"
                      value={newRoomLocation}
                      onChange={(e) => setNewRoomLocation(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">ความจุที่นั่ง</label>
                    <input
                      type="number"
                      value={newRoomCapacity}
                      onChange={(e) => setNewRoomCapacity(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">สีประจำห้อง</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newRoomColor}
                        onChange={(e) => setNewRoomColor(e.target.value)}
                        className="w-10 h-8 rounded-lg cursor-pointer border border-slate-300"
                      />
                      <span className="text-xs font-mono text-slate-600">{newRoomColor}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddRoom}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                >
                  บันทึกเพิ่มห้องประชุม
                </button>
              </div>

              {/* Rooms List */}
              <div className="space-y-2">
                {roomList.map((room) => (
                  <div key={room.id} className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: room.color }} />
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs">{room.name}</h5>
                        <p className="text-[11px] text-slate-500">{room.location} • ความจุ {room.capacity} ที่นั่ง</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="ลบห้องประชุม"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MEETING TYPES */}
          {activeTab === 'types' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">รูปแบบการประชุมที่รองรับ</h4>
                <p className="text-xs text-slate-500">รองรับ Zoom, Cisco Webex, Google Meet, Microsoft Teams, ประชุมปกติ และ Hybrid</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {meetingTypes.map((type) => (
                  <div key={type.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${type.badgeColor}`}>
                        {type.name}
                      </div>
                      <span className="text-xs text-slate-600">
                        {type.isOnline ? 'ออนไลน์' : 'ณ ห้องประชุม'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: GOOGLE CALENDAR & SYNC SETTINGS */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">การเชื่อมต่อ Google Calendar & Google Drive</h4>
                <p className="text-xs text-slate-500">
                  เชื่อมต่อไปยังบัญชี Google: <strong>{APP_CONFIG.CALENDAR_ID}</strong> และ Drive Folder: <strong>{APP_CONFIG.GOOGLE_DRIVE_FOLDER_ID}</strong>
                </p>
              </div>

              {/* Status Info Box */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-2 text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Google Calendar: <strong>{APP_CONFIG.CALENDAR_ID}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Google Drive Folder: <a href={APP_CONFIG.GOOGLE_DRIVE_FOLDER_URL} target="_blank" rel="noopener noreferrer" className="underline font-bold">1C7A4qaEHCpQqgVYV-uwnEGDzVqNGFZUO</a> (Editor)</span>
                </div>
              </div>

              {/* GAS Web App URL Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Google Apps Script Web App URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    value={gasUrl}
                    onChange={(e) => setGasUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                  <button
                    onClick={handleSaveGasUrl}
                    className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>บันทึก URL</span>
                  </button>
                </div>
                {saveStatus && (
                  <p className="text-xs text-emerald-600 font-semibold">{saveStatus}</p>
                )}
                <p className="text-[11px] text-slate-500">
                  ดูวิธีการติดตั้ง Google Apps Script แบบละเอียดได้ในโฟลเดอร์ <code>google-apps-script/README_GAS.md</code>
                </p>
              </div>

              {/* Manual Full Sync Trigger */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-800 block">สั่งซิงค์ข้อมูลกับ Google Calendar ทันที</span>
                  <span className="text-[11px] text-slate-500">
                    ซิงค์ล่าสุด: {syncStatus.lastSyncedAt ? formatThaiDateTime(syncStatus.lastSyncedAt.split('T')[0], syncStatus.lastSyncedAt.split('T')[1]?.substring(0, 5)) : 'ยังไม่ได้ซิงค์'}
                  </span>
                </div>

                <button
                  onClick={syncNow}
                  disabled={syncStatus.isSyncing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                  <span>{syncStatus.isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูลทันที'}</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsAdminModalOpen(false)}
            className="px-5 py-2 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
