import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronDown } from 'lucide-react';
import { THAI_MONTHS_FULL, THAI_MONTHS_SHORT, toBuddhistYear } from '../../utils/dateUtils';

interface ThaiDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
  minDate?: string;
}

export const ThaiDatePicker: React.FC<ThaiDatePickerProps> = ({
  value,
  onChange,
  label,
  minDate,
}) => {
  const currentDate = value ? new Date(value) : new Date();
  const validDate = isNaN(currentDate.getTime()) ? new Date() : currentDate;

  const currentDay = validDate.getDate();
  const currentMonth = validDate.getMonth(); // 0-11
  const currentYear = validDate.getFullYear(); // CE
  const currentBeYear = toBuddhistYear(currentYear); // BE (เช่น 2569)

  const handleDayChange = (d: number) => {
    const newDate = new Date(currentYear, currentMonth, d);
    onChange(formatToYyyyMmDd(newDate));
  };

  const handleMonthChange = (m: number) => {
    const maxDays = new Date(currentYear, m + 1, 0).getDate();
    const safeDay = Math.min(currentDay, maxDays);
    const newDate = new Date(currentYear, m, safeDay);
    onChange(formatToYyyyMmDd(newDate));
  };

  const handleYearChange = (beYear: number) => {
    const ceYear = beYear - 543;
    const maxDays = new Date(ceYear, currentMonth + 1, 0).getDate();
    const safeDay = Math.min(currentDay, maxDays);
    const newDate = new Date(ceYear, currentMonth, safeDay);
    onChange(formatToYyyyMmDd(newDate));
  };

  const setQuickDate = (type: 'today' | 'tomorrow' | 'nextWeek') => {
    const d = new Date();
    if (type === 'tomorrow') d.setDate(d.getDate() + 1);
    if (type === 'nextWeek') d.setDate(d.getDate() + 7);
    onChange(formatToYyyyMmDd(d));
  };

  // จำนวนวันในเดือนที่เลือก
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysList = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // ปี พ.ศ. ให้เลือก (พ.ศ. 2567 - 2572)
  const beYearsList = [2567, 2568, 2569, 2570, 2571, 2572];

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>{label}</span>
          </label>

          {/* Quick buttons */}
          <div className="flex items-center gap-1 text-[10px]">
            <button
              type="button"
              onClick={() => setQuickDate('today')}
              className="text-blue-600 hover:text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded font-medium"
            >
              วันนี้
            </button>
            <button
              type="button"
              onClick={() => setQuickDate('tomorrow')}
              className="text-slate-600 hover:text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded font-medium"
            >
              พรุ่งนี้
            </button>
          </div>
        </div>
      )}

      {/* Thai Date Selector: วัน / เดือน / ปี พ.ศ. */}
      <div className="grid grid-cols-3 gap-1.5">
        {/* วัน */}
        <div className="relative">
          <select
            value={currentDay}
            onChange={(e) => handleDayChange(Number(e.target.value))}
            className="w-full pl-2.5 pr-6 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
          >
            {daysList.map((d) => (
              <option key={d} value={d}>
                วันที่ {d}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* เดือน */}
        <div className="relative">
          <select
            value={currentMonth}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
            className="w-full pl-2 pr-6 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
          >
            {THAI_MONTHS_SHORT.map((m, idx) => (
              <option key={idx} value={idx}>
                {m}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* ปี พ.ศ. */}
        <div className="relative">
          <select
            value={currentBeYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="w-full pl-2 pr-6 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
          >
            {beYearsList.map((y) => (
              <option key={y} value={y}>
                พ.ศ. {y}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

interface ThaiTimePickerProps {
  value: string; // HH:mm (เช่น "13:30")
  onChange: (value: string) => void;
  label?: string;
}

export const ThaiTimePicker: React.FC<ThaiTimePickerProps> = ({
  value,
  onChange,
  label,
}) => {
  const [hour, minute] = (value || '08:30').split(':');

  const hoursList = [
    '07', '08', '09', '10', '11', '12',
    '13', '14', '15', '16', '17', '18', '19', '20'
  ];

  const minutesList = ['00', '15', '30', '45'];

  const handleHourChange = (h: string) => {
    onChange(`${h}:${minute || '00'}`);
  };

  const handleMinuteChange = (m: string) => {
    onChange(`${hour || '08'}:${m}`);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>{label} (แบบ 24 ชั่วโมง)</span>
        </label>
      )}

      {/* Thai Time Selector: ชั่วโมง : นาที น. */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <select
            value={hour || '08'}
            onChange={(e) => handleHourChange(e.target.value)}
            className="w-full pl-3 pr-6 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
          >
            {hoursList.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <span className="font-bold text-slate-500">:</span>

        <div className="relative flex-1">
          <select
            value={minute || '30'}
            onChange={(e) => handleMinuteChange(e.target.value)}
            className="w-full pl-3 pr-6 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
          >
            {minutesList.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <span className="text-xs font-bold text-slate-700 pl-0.5">น.</span>
      </div>
    </div>
  );
};

function formatToYyyyMmDd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
