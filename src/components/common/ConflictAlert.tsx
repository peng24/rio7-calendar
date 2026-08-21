import React from 'react';
import { AlertTriangle, Clock, MapPin, User as UserIcon } from 'lucide-react';
import { BookingEvent } from '../../types';
import { formatFullMeetingSchedule } from '../../utils/dateUtils';

interface ConflictAlertProps {
  conflictEvent: BookingEvent | null;
}

export const ConflictAlert: React.FC<ConflictAlertProps> = ({ conflictEvent }) => {
  if (!conflictEvent) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-2xl mb-3 shadow-xs">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
        </div>
        <div className="ml-3 text-xs text-amber-900 flex-1">
          <h4 className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
            ⚠️ แจ้งเตือน: มีการจองห้องประชุมนี้ในช่วงเวลาใกล้เคียงกัน
          </h4>
          <div className="mt-1.5 text-[11px] space-y-0.5 text-amber-800 bg-amber-100/70 p-2.5 rounded-xl border border-amber-200">
            <p className="font-semibold text-slate-900 truncate">
              📌 {conflictEvent.title || conflictEvent.rawTitle}
            </p>
            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>เวลา: {formatFullMeetingSchedule(conflictEvent)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <UserIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>ผู้จอง: {conflictEvent.organizerName} ({conflictEvent.department})</span>
            </div>
          </div>
          <p className="mt-1.5 text-[10px] font-medium text-amber-700">
            * หากได้รับการประสานงานเรียบร้อยแล้ว ท่านยังสามารถกดยืนยันการจองได้ตามปกติ
          </p>
        </div>
      </div>
    </div>
  );
};
