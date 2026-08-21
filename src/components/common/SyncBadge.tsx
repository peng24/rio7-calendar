import React from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, CloudOff } from 'lucide-react';
import { useCalendar } from '../../context/CalendarContext';
import { formatThaiDateTime } from '../../utils/dateUtils';
import { APP_CONFIG } from '../../config/constants';

export const SyncBadge: React.FC = () => {
  const { syncStatus, syncNow } = useCalendar();

  const handleSyncClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!syncStatus.isSyncing) {
      await syncNow();
    }
  };

  return (
    <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-full px-3 py-1 text-xs transition-colors">
      <div className="flex items-center gap-1.5" title={`ซิงค์กับ ${APP_CONFIG.CALENDAR_ID}`}>
        {syncStatus.isSyncing ? (
          <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
        ) : syncStatus.error ? (
          <CloudOff className="w-3.5 h-3.5 text-amber-500" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        )}
        
        <span className="hidden sm:inline text-slate-700 font-medium">
          {syncStatus.isSyncing
            ? 'กำลังซิงค์ Google Calendar...'
            : syncStatus.error
            ? 'โหมดออฟไลน์/ในเครื่อง'
            : 'Google Calendar ซิงค์แล้ว'}
        </span>
      </div>

      {syncStatus.lastSyncedAt && (
        <span className="hidden md:inline text-slate-500 text-[11px]">
          ({formatThaiDateTime(syncStatus.lastSyncedAt.split('T')[0], syncStatus.lastSyncedAt.split('T')[1]?.substring(0, 5))})
        </span>
      )}

      <button
        onClick={handleSyncClick}
        disabled={syncStatus.isSyncing}
        title="กดเพื่อซิงค์ข้อมูลกับ Google Calendar ทันที"
        className="p-1 rounded-full hover:bg-slate-300 text-slate-600 transition-transform active:scale-95 disabled:opacity-50"
      >
        <RefreshCw className={`w-3 h-3 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};
