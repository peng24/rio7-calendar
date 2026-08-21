import { BookingEvent, MeetingFormat } from '../types';

/**
 * แปลงไฟล์ iCalendar (.ics) จาก Google Calendar เป็น BookingEvent Array
 */
export function parseIcsContent(icsData: string): BookingEvent[] {
  if (!icsData) return [];

  // 1. Unfold multi-line entries (RFC 5545)
  const unfolded = icsData.replace(/\r?\n[ \t]/g, '');
  const lines = unfolded.split(/\r?\n/);

  const events: BookingEvent[] = [];
  let inEvent = false;
  let current: Partial<Record<string, string>> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('BEGIN:VEVENT')) {
      inEvent = true;
      current = {};
      continue;
    }

    if (line.startsWith('END:VEVENT')) {
      if (inEvent && current.UID) {
        const parsed = convertIcsToBookingEvent(current);
        if (parsed) {
          events.push(parsed);
        }
      }
      inEvent = false;
      current = {};
      continue;
    }

    if (inEvent) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const keyPart = line.substring(0, colonIdx);
        const valuePart = line.substring(colonIdx + 1);

        // Normalize key (remove parameters like ;VALUE=DATE or ;TZID=...)
        const cleanKey = keyPart.split(';')[0].trim().toUpperCase();
        
        // Preserve raw key if contains DATE
        if (keyPart.includes('VALUE=DATE')) {
          current[cleanKey + '_IS_DATE'] = 'true';
        }

        current[cleanKey] = unescapeIcsText(valuePart);
      }
    }
  }

  return events;
}

function unescapeIcsText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function convertIcsToBookingEvent(raw: Partial<Record<string, string>>): BookingEvent | null {
  const uid = raw.UID || '';
  let summary = raw.SUMMARY || 'การประชุม สชป.7';
  const description = raw.DESCRIPTION || '';
  const location = raw.LOCATION || 'ห้องประชุม SWOC7';
  const dtStartRaw = raw.DTSTART || '';
  const dtEndRaw = raw.DTEND || dtStartRaw;
  const isDateOnly = raw.DTSTART_IS_DATE === 'true' || dtStartRaw.length === 8;

  if (!dtStartRaw) return null;

  let startDate = '';
  let startTime = '08:30';
  let endDate = '';
  let endTime = '16:30';
  let isAllDay = isDateOnly;

  if (isDateOnly) {
    // เช่น 20260822
    startDate = `${dtStartRaw.substring(0, 4)}-${dtStartRaw.substring(4, 6)}-${dtStartRaw.substring(6, 8)}`;
    if (dtEndRaw && dtEndRaw.length >= 8) {
      // ใน iCal วันสิ้นสุดของ AllDay จะเป็นวันถัดไป จึงควรใช้ startDate เป็นหลักถ้าเป็นวันเดียว
      const eY = dtEndRaw.substring(0, 4);
      const eM = dtEndRaw.substring(4, 6);
      const eD = dtEndRaw.substring(6, 8);
      endDate = `${eY}-${eM}-${eD}`;
    } else {
      endDate = startDate;
    }
  } else {
    // เช่น 20260805T063000Z หรือ 20260805T133000
    const startObj = parseIcsDateTime(dtStartRaw);
    const endObj = parseIcsDateTime(dtEndRaw);

    startDate = startObj.date;
    startTime = startObj.time;
    endDate = endObj.date;
    endTime = endObj.time;
  }

  // แยกรูปแบบการประชุม
  let meetingFormat: MeetingFormat = 'onsite';
  const sumLower = summary.toLowerCase();
  if (sumLower.includes('zoom')) meetingFormat = 'zoom';
  else if (sumLower.includes('webex')) meetingFormat = 'webex';
  else if (sumLower.includes('meet')) meetingFormat = 'google_meet';
  else if (sumLower.includes('team')) meetingFormat = 'ms_teams';
  else if (sumLower.includes('hybrid')) meetingFormat = 'hybrid';

  // ลบแท็กเวลาหรือ (ZOOM) ออกจาก rawTitle
  const cleanTitle = summary
    .replace(/^\s*\d{1,2}[:.]\d{2}\s*น\.\s*/i, '')
    .replace(/^\s*\([^)]+\)\s*/i, '')
    .trim();

  // ดึง Meeting ID, Passcode, URL จาก Description
  let meetingId = '';
  let passcode = '';
  let meetingUrl = '';
  let organizerName = '';
  let department = '';
  let contactPhone = '';
  const attachments: any[] = [];

  const idMatch = description.match(/Meeting ID:\s*([^\n\r]+)/i);
  if (idMatch) meetingId = idMatch[1].trim();

  const passMatch = description.match(/Passcode:\s*([^\n\r]+)/i);
  if (passMatch) passcode = passMatch[1].trim();

  const urlMatch = description.match(/(https?:\/\/[^\s]+)/i);
  if (urlMatch) meetingUrl = urlMatch[1].trim();

  const orgMatch = description.match(/ผู้จอง\/ผู้ประสานงาน:\s*([^\n\r]+)/i);
  if (orgMatch) organizerName = orgMatch[1].trim();

  const deptMatch = description.match(/หน่วยงาน\/ฝ่าย:\s*([^\n\r]+)/i);
  if (deptMatch) department = deptMatch[1].trim();

  const phoneMatch = description.match(/เบอร์ติดต่อ:\s*([^\n\r]+)/i);
  if (phoneMatch) contactPhone = phoneMatch[1].trim();

  const attachRegex = /📎 ไฟล์แนบ:\s*([^\n\r]+)\s*\((https?:\/\/[^\s)]+)\)/gi;
  let attachMatch;
  while ((attachMatch = attachRegex.exec(description)) !== null) {
    attachments.push({
      name: attachMatch[1].trim(),
      url: attachMatch[2].trim(),
    });
  }

  return {
    id: uid,
    googleEventId: uid,
    title: summary,
    rawTitle: cleanTitle || summary,
    roomId: location || 'ห้องประชุม SWOC7',
    roomName: location || 'ห้องประชุม SWOC7',
    meetingFormat: meetingFormat,
    startDate: startDate,
    startTime: isAllDay ? '08:30' : startTime,
    endDate: endDate || startDate,
    endTime: isAllDay ? '16:30' : endTime,
    isAllDay: isAllDay,
    meetingUrl: meetingUrl,
    meetingId: meetingId,
    passcode: passcode,
    organizerName: organizerName || 'เจ้าหน้าที่ สชป.7',
    department: department || 'สำนักงานชลประทานที่ 7',
    contactPhone: contactPhone,
    description: description,
    attachments: attachments,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncedWithGoogle: true,
  };
}

function parseIcsDateTime(dtStr: string): { date: string; time: string } {
  // Format: 20260805T063000Z (UTC) or 20260805T133000 (Local)
  if (dtStr.endsWith('Z')) {
    const y = parseInt(dtStr.substring(0, 4), 10);
    const m = parseInt(dtStr.substring(4, 6), 10) - 1;
    const d = parseInt(dtStr.substring(6, 8), 10);
    const h = parseInt(dtStr.substring(9, 11), 10);
    const min = parseInt(dtStr.substring(11, 13), 10);
    const sec = parseInt(dtStr.substring(13, 15), 10);

    const utcDate = new Date(Date.UTC(y, m, d, h, min, sec));
    
    // แปลงเป็น GMT+7 (Bangkok)
    const bangkokTime = new Date(utcDate.getTime() + 7 * 3600 * 1000);
    const by = bangkokTime.getUTCFullYear();
    const bm = String(bangkokTime.getUTCMonth() + 1).padStart(2, '0');
    const bd = String(bangkokTime.getUTCDate()).padStart(2, '0');
    const bh = String(bangkokTime.getUTCHours()).padStart(2, '0');
    const bmin = String(bangkokTime.getUTCMinutes()).padStart(2, '0');

    return {
      date: `${by}-${bm}-${bd}`,
      time: `${bh}:${bmin}`,
    };
  } else {
    const y = dtStr.substring(0, 4);
    const m = dtStr.substring(4, 6);
    const d = dtStr.substring(6, 8);
    const h = dtStr.substring(9, 11) || '08';
    const min = dtStr.substring(11, 13) || '30';

    return {
      date: `${y}-${m}-${d}`,
      time: `${h}:${min}`,
    };
  }
}
