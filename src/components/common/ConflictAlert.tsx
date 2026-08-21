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
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4 shadow-sm animate-pulse">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
        </div>
        <div className="ml-3 text-sm text-red-800">
          <h4 className="font-bold text-red-900 flex items-center gap-1.5">
            ⚠️ ห้องประชุมนี้มีการจองซ้อนทับกันในช่วงเวลาดังกล่าว!
          </h4>
          <div className="mt-2 text-xs space-y-1 text-red-700 bg-red-100/60 p-2.5 rounded border border-red-200">
            <p className="font-semibold text-slate-900">
              📌 {conflictEvent.title || conflictEvent.rawTitle}
            </p>
            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="w-3.5 h-3.5 text-red-500" />
              <span>เวลา: {formatFullMeetingSchedule(conflictEvent)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>ห้อง: {conflictEvent.roomName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <UserIcon className="w-3.5 h-3.5 text-red-500" />
              <span>ผู้จอง: {conflictEvent.organizerName} ({conflictEvent.department})</span>
            </div>
          </div>
          <p className="mt-2 text-xs font-medium text-red-600">
            * กรุณาเปลี่ยนห้องประชุมหรือปรับเวลาการประชุมใหม่เพื่อป้องกันการใช้ห้องชนกัน
          </p>
        </div>
      </div>
    </div>
  );
};
