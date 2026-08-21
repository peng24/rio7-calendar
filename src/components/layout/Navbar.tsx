import React from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  Clock, 
  Grid, 
  Columns, 
  ListFilter, 
  LayoutGrid,
  CalendarDays,
  Settings,
  ExternalLink
} from 'lucide-react';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import { formatThaiDate, toBuddhistYear } from '../../utils/dateUtils';
import { SyncBadge } from '../common/SyncBadge';
import { CalendarViewMode } from '../../types';
import { APP_CONFIG } from '../../config/constants';

export const Navbar: React.FC = () => {
  const { 
    selectedDate, 
    setSelectedDate, 
    viewMode, 
    setViewMode, 
    openBookingModal, 
    setIsLoginModalOpen, 
    setIsAdminModalOpen 
  } = useCalendar();
  
  const { currentUser, isAuthenticated, isAdmin, isPending, logout } = useAuth();

  // ปรับเปลี่ยนเดือน/สัปดาห์/วัน
  const handlePrev = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const monthYearLabel = () => {
    const month = formatThaiDate(selectedDate, false).split(' ')[1];
    const year = toBuddhistYear(selectedDate.getFullYear());
    return `${month} ${year}`;
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      {/* Top Banner with RID Royal Navy branding */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white px-4 py-2.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-inner flex-shrink-0">
              <span className="text-xl">🌊</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                  ระบบปฏิทินห้องประชุม สชป.7
                </h1>
                <span className="bg-amber-400/90 text-slate-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">
                  RIO 7
                </span>
                <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>{APP_CONFIG.VERSION}</span>
                </span>
              </div>
              <p className="text-[11px] text-blue-200 leading-none mt-1 hidden sm:flex items-center gap-1.5">
                <span>สำนักงานชลประทานที่ 7</span>
                <span>•</span>
                <span className="text-amber-300 font-medium">อัปเดตล่าสุด: {APP_CONFIG.LAST_UPDATED}</span>
              </p>
            </div>
          </div>

          {/* Top Actions: Sync badge, Google Calendar Embed Link, Auth buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <SyncBadge />

            <a
              href={APP_CONFIG.GOOGLE_CALENDAR_EMBED_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-100 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors"
              title="เปิด Google Calendar ในแท็บใหม่"
            >
              <span className="hidden md:inline">Google Calendar</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                <div className="text-right text-xs">
                  <div className="font-semibold text-white truncate max-w-[130px]">
                    {currentUser?.name}
                  </div>
                  <div className="text-[10px] text-blue-200 flex items-center justify-end gap-1">
                    {isAdmin && (
                      <span className="bg-amber-400 text-slate-900 font-bold px-1 rounded text-[9px]">Admin</span>
                    )}
                    {isPending && (
                      <span className="bg-amber-500 text-white px-1 rounded text-[9px]">รออนุมัติ</span>
                    )}
                    <span>{currentUser?.department?.split(' ')[0]}</span>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => setIsAdminModalOpen(true)}
                    className="p-1 text-blue-100 hover:text-amber-300 hover:bg-white/10 rounded-full transition-colors"
                    title="จัดการระบบ Admin & อนุมัติผู้ใช้"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={logout}
                  className="p-1 text-blue-200 hover:text-red-300 hover:bg-white/10 rounded-full transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-900 px-3.5 py-1.5 rounded-full shadow transition-transform active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ / ลงทะเบียน</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Subheader: Date controls, View Switcher & Booking Button */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Navigation & Month display */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handlePrev}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-shadow shadow-sm active:scale-95"
              title="ก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-white rounded-lg transition-shadow shadow-sm"
            >
              วันนี้
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-shadow shadow-sm active:scale-95"
              title="ถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <span>{monthYearLabel()}</span>
          </h2>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-1 md:pb-0">
          {/* View Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'month'
                  ? 'bg-white text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>เดือน</span>
            </button>

            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>สัปดาห์</span>
            </button>

            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'day'
                  ? 'bg-white text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>วัน</span>
            </button>

            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'matrix'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="ดูผังการใช้ทุกห้องประชุมเทียบกัน (Room Matrix)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>ผังห้องประชุม</span>
            </button>

            <button
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'agenda'
                  ? 'bg-white text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>รายการ</span>
            </button>
          </div>

          {/* Book Room Button */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                setIsLoginModalOpen(true);
              } else {
                openBookingModal();
              }
            }}
            className="flex-shrink-0 flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>จองห้องประชุม</span>
          </button>
        </div>

      </div>
    </header>
  );
};
