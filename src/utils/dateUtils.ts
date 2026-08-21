import { BookingEvent } from '../types';

export const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export const THAI_DAYS_FULL = [
  'อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'
];

export const THAI_DAYS_SHORT = [
  'อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'
];

/**
 * แปลงปี ค.ศ. เป็น พ.ศ. (บวก 543)
 */
export function toBuddhistYear(year: number): number {
  return year + 543;
}

/**
 * ฟอร์แมตวันที่เป็นภาษาไทย เช่น "5 ส.ค. 2569" หรือ "5 สิงหาคม 2569"
 */
export function formatThaiDate(dateInput: string | Date, isShort: boolean = true): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  const day = date.getDate();
  const monthIdx = date.getMonth();
  const beYear = toBuddhistYear(date.getFullYear());
  const monthName = isShort ? THAI_MONTHS_SHORT[monthIdx] : THAI_MONTHS_FULL[monthIdx];

  return `${day} ${monthName} ${beYear}`;
}

/**
 * ฟอร์แมตวันและเวลาภาษาไทย เช่น "5 ส.ค. 2569 14:00 น."
 */
export function formatThaiDateTime(dateStr: string, timeStr?: string): string {
  const dateFormatted = formatThaiDate(dateStr, true);
  if (!timeStr) return dateFormatted;
  return `${dateFormatted} ${timeStr} น.`;
}

/**
 * ฟอร์แมตช่วงเวลาการประชุม เช่น "14:00 - 16:00 น." หรือ "ตลอดวัน"
 */
export function formatMeetingTimeRange(event: BookingEvent): string {
  if (event.isAllDay) {
    return 'ตลอดวัน';
  }
  const start = event.startTime || '08:30';
  const end = event.endTime || '16:30';
  return `${start} - ${end} น.`;
}

/**
 * ฟอร์แมตช่วงวันและเวลาการประชุมเต็มรูปแบบ เช่น "5 ส.ค. 2569, 14:00 - 16:00 น."
 */
export function formatFullMeetingSchedule(event: BookingEvent): string {
  const startFormatted = formatThaiDate(event.startDate, true);
  if (event.startDate === event.endDate || !event.endDate) {
    if (event.isAllDay) return `${startFormatted} (ตลอดวัน)`;
    return `${startFormatted}, ${event.startTime} - ${event.endTime} น.`;
  } else {
    const endFormatted = formatThaiDate(event.endDate, true);
    if (event.isAllDay) return `${startFormatted} - ${endFormatted} (ตลอดวัน)`;
    return `${startFormatted} ${event.startTime} น. - ${endFormatted} ${event.endTime} น.`;
  }
}

/**
 * ตรวจสอบความซ้ำซ้อนของการจองห้องประชุม (Conflict Detection)
 * เงื่อนไข: เวลาเริ่มใหม่ < เวลาสิ้นสุดเดิม AND เวลาสิ้นสุดใหม่ > เวลาเริ่มเดิม สำหรับห้องเดียวกัน
 */
export function checkBookingConflict(
  target: {
    id?: string;
    roomId: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    isAllDay?: boolean;
  },
  existingEvents: BookingEvent[]
): BookingEvent | null {
  // หากเป็นห้องประชุมแบบ Online Only ไม่ต้องตรวจการชนกันของห้องกายภาพ
  if (target.roomId === 'room-online-only' || target.roomId.includes('online')) {
    return null;
  }

  const targetStart = new Date(`${target.startDate}T${target.isAllDay ? '00:00' : target.startTime || '08:30'}:00`).getTime();
  const targetEnd = new Date(`${target.endDate || target.startDate}T${target.isAllDay ? '23:59' : target.endTime || '16:30'}:00`).getTime();

  for (const event of existingEvents) {
    // ข้ามรายการที่กำลังแก้ไข (ถ้าเป็น ID เดียวกัน)
    if (target.id && (event.id === target.id || event.googleEventId === target.id)) {
      continue;
    }

    // ตรวจเฉพาะห้องประชุมเดียวกัน
    if (event.roomId !== target.roomId && event.roomName !== target.roomId) {
      continue;
    }

    const eventStart = new Date(`${event.startDate}T${event.isAllDay ? '00:00' : event.startTime || '08:30'}:00`).getTime();
    const eventEnd = new Date(`${event.endDate || event.startDate}T${event.isAllDay ? '23:59' : event.endTime || '16:30'}:00`).getTime();

    // เช็ก Overlap: newStart < existingEnd && newEnd > existingStart
    if (targetStart < eventEnd && targetEnd > eventStart) {
      return event; // คืนค่ารายการที่ชนกัน
    }
  }

  return null;
}

/**
 * สร้าง Array ของวันที่ในเดือนที่เลือกสำหรับ Month View Grid
 */
export function getMonthDays(year: number, month: number): { date: Date; isCurrentMonth: boolean; dateString: string }[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  const days: { date: Date; isCurrentMonth: boolean; dateString: string }[] = [];

  // วันของเดือนก่อนหน้า (Padding)
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      date: d,
      isCurrentMonth: false,
      dateString: toYyyyMmDd(d)
    });
  }

  // วันของเดือนปัจจุบัน
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    days.push({
      date: d,
      isCurrentMonth: true,
      dateString: toYyyyMmDd(d)
    });
  }

  // วันของเดือนถัดไป (Padding ให้ครบ 35 หรือ 42 ช่อง)
  const totalSlots = days.length <= 35 ? 35 : 42;
  const nextMonthDays = totalSlots - days.length;
  for (let i = 1; i <= nextMonthDays; i++) {
    const d = new Date(year, month + 1, i);
    days.push({
      date: d,
      isCurrentMonth: false,
      dateString: toYyyyMmDd(d)
    });
  }

  return days;
}

/**
 * แปลง Date Object เป็น "YYYY-MM-DD"
 */
export function toYyyyMmDd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * ดึงวันในสัปดาห์ (Sunday to Saturday) สำหรับ Week View
 */
export function getWeekDays(currentDate: Date): { date: Date; dateString: string; isToday: boolean }[] {
  const todayStr = toYyyyMmDd(new Date());
  const dayOfWeek = currentDate.getDay(); // 0 is Sunday
  const sunday = new Date(currentDate);
  sunday.setDate(currentDate.getDate() - dayOfWeek);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const dStr = toYyyyMmDd(d);
    days.push({
      date: d,
      dateString: dStr,
      isToday: dStr === todayStr
    });
  }
  return days;
}

/**
 * ไทม์สล็อตสำหรับ Day View และ Room Matrix View (08:00 - 18:00)
 */
export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
];
