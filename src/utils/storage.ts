import { BookingEvent, MeetingRoom, MeetingTypeOption, User } from '../types';
import { STORAGE_KEYS, DEFAULT_ROOMS, DEFAULT_MEETING_TYPES, APP_CONFIG } from '../config/constants';
import { toYyyyMmDd } from './dateUtils';

// ตัวอย่างข้อมูลการประชุมเริ่มต้น (รวมถึงตัวอย่างตามรูปภาพของ สชป.7)
function getInitialSampleEvents(): BookingEvent[] {
  const today = new Date();
  const todayStr = toYyyyMmDd(today);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = toYyyyMmDd(tomorrow);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 5);
  const nextWeekStr = toYyyyMmDd(nextWeek);

  return [
    {
      id: 'gcal_sample_01',
      googleEventId: 'gcal_sample_01',
      title: '(ZOOM) ประชุมคณะกรรมการพิจารณาจัดทำหลักเกณฑ์การคำนวณราคากลาง',
      rawTitle: 'ประชุมคณะกรรมการพิจารณาจัดทำหลักเกณฑ์การคำนวณราคากลาง',
      roomId: 'room-swoc7',
      roomName: 'ห้องประชุม SWOC7',
      meetingFormat: 'zoom',
      formatLabel: 'ZOOM',
      startDate: todayStr,
      startTime: '14:00',
      endDate: todayStr,
      endTime: '16:00',
      isAllDay: false,
      meetingId: '940 0752 2101',
      passcode: '718195',
      meetingUrl: 'https://zoom.us/j/94007522101?pwd=xxx',
      organizerName: 'ส่วนวิศวกรรม สชป.7',
      department: 'ส่วนวิศวกรรม',
      contactPhone: '045-312-345 ต่อ 201',
      chairman: 'ผู้อำนวยการส่วนวิศวกรรม',
      attendeeCount: 15,
      description: 'ประชุมพิจารณารายละเอียดการกำหนดราคากลางงานก่อสร้างอาคารบังคับน้ำและระบบส่งน้ำ โครงการฯ ประจำปีงบประมาณ 2569\n\nMeeting ID: 940 0752 2101\nPasscode: 718195',
      attachments: [
        {
          name: 'กพง03_341_2569_ระเบียบราคากลาง.pdf',
          url: 'https://drive.google.com/drive/folders/1C7A4qaEHCpQqgVYV-uwnEGDzVqNGFZUO?usp=sharing',
          size: 2450000
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedWithGoogle: true,
      googleHtmlLink: APP_CONFIG.GOOGLE_CALENDAR_EMBED_URL
    },
    {
      id: 'gcal_sample_02',
      googleEventId: 'gcal_sample_02',
      title: '(WEBEX) ประชุมติดตามสถานการณ์น้ำและวิเคราะห์แนวโน้มฝนภาคตะวันออกเฉียงเหนือตอนล่าง',
      rawTitle: 'ประชุมติดตามสถานการณ์น้ำและวิเคราะห์แนวโน้มฝนภาคตะวันออกเฉียงเหนือตอนล่าง',
      roomId: 'room-swoc7',
      roomName: 'ห้องประชุม SWOC7',
      meetingFormat: 'webex',
      formatLabel: 'WEBEX',
      startDate: tomorrowStr,
      startTime: '09:30',
      endDate: tomorrowStr,
      endTime: '12:00',
      isAllDay: false,
      meetingId: '2512 884 9102',
      passcode: 'Rio7Water2026',
      meetingUrl: 'https://cisco.webex.com/meet/rio7swoc',
      organizerName: 'ศูนย์ปฏิบัติการน้ำอัจฉริยะ (SWOC7)',
      department: 'ส่วนบริหารจัดการน้ำและบำรุงรักษา',
      contactPhone: '045-312-345 ต่อ 105',
      chairman: 'ผู้อำนวยการสำนักงานชลประทานที่ 7',
      attendeeCount: 30,
      description: 'วิเคราะห์ข้อมูลอุตุนิยมวิทยา ปริมาณน้ำในเขื่อนหลัก และวางแผนการจัดสรรน้ำฤดูแล้ง/ฤดูฝน',
      attachments: [
        {
          name: 'รายงานสรุปสถานการณ์น้ำ_สชป7.pdf',
          url: 'https://drive.google.com/drive/folders/1C7A4qaEHCpQqgVYV-uwnEGDzVqNGFZUO?usp=sharing'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedWithGoogle: true,
    },
    {
      id: 'gcal_sample_03',
      googleEventId: 'gcal_sample_03',
      title: '(ONSITE) ประชุมคณะกรรมการบริหารจัดการองค์ความรู้ (KM) สำนักงานชลประทานที่ 7',
      rawTitle: 'ประชุมคณะกรรมการบริหารจัดการองค์ความรู้ (KM) สำนักงานชลประทานที่ 7',
      roomId: 'room-main-3',
      roomName: 'ห้องประชุมชั้น 3 อาคารอำนวยการ',
      meetingFormat: 'onsite',
      formatLabel: 'ONSITE',
      startDate: nextWeekStr,
      startTime: '13:30',
      endDate: nextWeekStr,
      endTime: '16:30',
      isAllDay: false,
      organizerName: 'ฝ่ายบริหารทั่วไป',
      department: 'ฝ่ายบริหารทั่วไป',
      contactPhone: '045-312-345 ต่อ 101',
      chairman: 'รองผู้อำนวยการ สชป.7',
      attendeeCount: 25,
      description: 'ทบทวนแผนการจัดการความรู้และนวัตกรรมกรมชลประทาน ประจำปีงบประมาณ',
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedWithGoogle: true,
    }
  ];
}

export const StorageService = {
  // ---- Events ----
  getEvents(): BookingEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (!data) {
        const initial = getInitialSampleEvents();
        this.saveEvents(initial);
        return initial;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading events from storage', e);
      return [];
    }
  },

  saveEvents(events: BookingEvent[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (e) {
      console.error('Error saving events to storage', e);
    }
  },

  // ---- Rooms ----
  getRooms(): MeetingRoom[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROOMS);
      if (!data) {
        this.saveRooms(DEFAULT_ROOMS);
        return DEFAULT_ROOMS;
      }
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_ROOMS;
    }
  },

  saveRooms(rooms: MeetingRoom[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    } catch (e) {
      console.error('Error saving rooms', e);
    }
  },

  // ---- Meeting Types ----
  getMeetingTypes(): MeetingTypeOption[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEETING_TYPES);
      if (!data) {
        this.saveMeetingTypes(DEFAULT_MEETING_TYPES);
        return DEFAULT_MEETING_TYPES;
      }
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_MEETING_TYPES;
    }
  },

  saveMeetingTypes(types: MeetingTypeOption[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MEETING_TYPES, JSON.stringify(types));
    } catch (e) {
      console.error('Error saving meeting types', e);
    }
  },

  // ---- Auth User ----
  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveCurrentUser(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.error('Error saving current user', e);
    }
  },

  // ---- Registered Users (Local DB Mock / Cache) ----
  getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!data) {
        const initialUsers: User[] = [
          {
            id: 'usr_admin_01',
            email: 'sarabun07@gmail.com',
            name: 'ผู้ดูแลระบบ สชป.7 (Admin)',
            department: 'ฝ่ายบริหารทั่วไป',
            phone: '045-312-345',
            role: 'admin',
            createdAt: new Date().toISOString(),
            approvedAt: new Date().toISOString(),
            approvedBy: 'SYSTEM'
          },
          {
            id: 'usr_staff_01',
            email: 'engineer07@rio7.go.th',
            name: 'นายช่างวิศวกรรม สชป.7',
            department: 'ส่วนวิศวกรรม',
            phone: '081-234-5678',
            role: 'user',
            createdAt: new Date().toISOString(),
            approvedAt: new Date().toISOString(),
            approvedBy: 'sarabun07@gmail.com'
          },
          {
            id: 'usr_pending_01',
            email: 'officer@rio7.go.th',
            name: 'เจ้าหน้าที่โครงการชลประทาน (รออนุมัติ)',
            department: 'โครงการชลประทานอุบลราชธานี',
            phone: '089-999-8888',
            role: 'pending',
            createdAt: new Date().toISOString()
          }
        ];
        this.saveUsers(initialUsers);
        return initialUsers;
      }
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  saveUsers(users: User[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users', e);
    }
  },

  // ---- Google Apps Script URL ----
  getGasApiUrl(): string {
    return localStorage.getItem(STORAGE_KEYS.GAS_API_URL) || '';
  },

  saveGasApiUrl(url: string): void {
    localStorage.setItem(STORAGE_KEYS.GAS_API_URL, url.trim());
  },

  // ---- Last Sync Time ----
  getLastSyncTime(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  },

  saveLastSyncTime(isoString: string): void {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, isoString);
  }
};
