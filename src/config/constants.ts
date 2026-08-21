import { MeetingRoom, MeetingTypeOption } from '../types';

export const APP_CONFIG = {
  APP_NAME: 'ระบบปฏิทินห้องประชุม สำนักงานชลประทานที่ 7',
  APP_SHORT_NAME: 'RIO 7 Meeting Calendar',
  ORGANIZATION: 'สำนักงานชลประทานที่ 7 (สชป.7)',
  DEPARTMENT_FULL: 'สำนักงานชลประทานที่ 7 กรมชลประทาน กระทรวงเกษตรและสหกรณ์',
  CALENDAR_ID: 'sarabun07@gmail.com',
  GOOGLE_CALENDAR_EMBED_URL: 'https://calendar.google.com/calendar/embed?src=sarabun07%40gmail.com&ctz=Asia%2FBangkok',
  GOOGLE_DRIVE_FOLDER_ID: '1C7A4qaEHCpQqgVYV-uwnEGDzVqNGFZUO',
  GOOGLE_DRIVE_FOLDER_URL: 'https://drive.google.com/drive/folders/1C7A4qaEHCpQqgVYV-uwnEGDzVqNGFZUO?usp=sharing',
  MAX_ATTACHMENT_SIZE_MB: 20, // 20 MB max file size
  MAX_ATTACHMENT_SIZE_BYTES: 20 * 1024 * 1024,
  DEFAULT_AUTO_REFRESH_INTERVAL_MS: 3 * 60 * 1000, // Auto sync every 3 minutes
};

export const DEFAULT_ROOMS: MeetingRoom[] = [
  {
    id: 'room-swoc7',
    name: 'ห้องประชุม SWOC7',
    location: 'อาคารศูนย์ปฏิบัติการน้ำอัจฉริยะ (SWOC7)',
    capacity: 30,
    color: '#0284c7', // Sky Blue
    equipment: ['Video Conference', 'Smart TV 75"', 'ไมโครโฟนไร้สาย', 'ระบบเสียงห้องประชุม', 'ระบบเชื่อมต่อ Zoom/Webex'],
    description: 'ห้องประชุมศูนย์ปฏิบัติการน้ำอัจฉริยะ สำนักงานชลประทานที่ 7 พร้อมระบบควบคุมการประชุมออนไลน์สมบูรณ์แบบ',
    isActive: true,
  },
  {
    id: 'room-main-3',
    name: 'ห้องประชุมชั้น 3 อาคารอำนวยการ',
    location: 'อาคารอำนวยการ ชั้น 3',
    capacity: 60,
    color: '#0d9488', // Teal
    equipment: ['โปรเจกเตอร์ 5000 Lumens', 'จอภาพไฟฟ้า 150"', 'ไมโครโฟนตั้งโต๊ะ 24 ชุด', 'ระบบเครื่องเสียง', 'Smart TV'],
    description: 'ห้องประชุมใหญ่สำหรับประชุมประจำเดือน สัมมนา และประชุมคณะกรรมการชุดใหญ่',
    isActive: true,
  },
  {
    id: 'room-eng-2',
    name: 'ห้องประชุมฝ่ายวิศวกรรม',
    location: 'อาคารส่วนวิศวกรรม ชั้น 2',
    capacity: 20,
    color: '#7c3aed', // Purple
    equipment: ['Smart TV 65"', 'Webcam Conference', 'ไวท์บอร์ดกระจก', 'ไมโครโฟน'],
    description: 'ห้องประชุมสำหรับการประชุมงานแบบกลุ่มย่อย ตรวจแบบ และประชุมทางเทคนิค',
    isActive: true,
  },
  {
    id: 'room-admin-1',
    name: 'ห้องประชุมฝ่ายบริหารทั่วไป',
    location: 'อาคารอำนวยการ ชั้น 1',
    capacity: 15,
    color: '#ea580c', // Orange
    equipment: ['Smart TV 55"', 'ไมโครโฟนไร้สาย', 'ไวท์บอร์ด'],
    description: 'ห้องประชุมขนาดกะทัดรัดสำหรับงานบริหาร บุคลากร และสารบรรณ',
    isActive: true,
  },
  {
    id: 'room-online-only',
    name: 'ห้องประชุมออนไลน์ (Online Only)',
    location: 'ออนไลน์ (ไม่มีการใช้ห้องกายภาพ)',
    capacity: 300,
    color: '#4f46e5', // Indigo
    equipment: ['Zoom Cloud Meetings', 'Cisco Webex', 'Google Meet', 'MS Teams'],
    description: 'สำหรับการจัดประชุมออนไลน์ผ่าน Zoom / Webex ที่ผู้ร่วมประชุมเข้าร่วมจากโต๊ะทำงานหรือภายนอก',
    isActive: true,
  },
];

export const DEFAULT_MEETING_TYPES: MeetingTypeOption[] = [
  {
    id: 'zoom',
    name: 'ZOOM',
    badgeColor: 'bg-blue-600 text-white',
    iconName: 'Video',
    isOnline: true,
    requiresLink: true,
  },
  {
    id: 'webex',
    name: 'WEBEX',
    badgeColor: 'bg-emerald-600 text-white',
    iconName: 'Video',
    isOnline: true,
    requiresLink: true,
  },
  {
    id: 'google_meet',
    name: 'Google Meet',
    badgeColor: 'bg-amber-600 text-white',
    iconName: 'Video',
    isOnline: true,
    requiresLink: true,
  },
  {
    id: 'ms_teams',
    name: 'MS Teams',
    badgeColor: 'bg-indigo-600 text-white',
    iconName: 'Video',
    isOnline: true,
    requiresLink: true,
  },
  {
    id: 'onsite',
    name: 'ประชุมปกติ (Onsite)',
    badgeColor: 'bg-slate-700 text-white',
    iconName: 'Users',
    isOnline: false,
    requiresLink: false,
  },
  {
    id: 'hybrid',
    name: 'HYBRID (Onsite + Online)',
    badgeColor: 'bg-purple-600 text-white',
    iconName: 'Tv',
    isOnline: true,
    requiresLink: true,
  },
];

export const DEPARTMENTS = [
  'สำนักงานชลประทานที่ 7 (สชป.7)',
  'ส่วนบริหารจัดการน้ำและบำรุงรักษา',
  'ส่วนวิศวกรรม',
  'ส่วนแผนงาน',
  'ส่วนเครื่องจักรกล',
  'ฝ่ายบริหารทั่วไป',
  'ฝ่ายกฎหมายและที่ดิน',
  'โครงการชลประทานอุบลราชธานี',
  'โครงการชลประทานยโสธร',
  'โครงการชลประทานมุกดาหาร',
  'โครงการชลประทานอำนาจเจริญ',
  'โครงการส่งน้ำและบำรุงรักษาโดมน้อย',
  'โครงการส่งน้ำและบำรุงรักษาชีล่างและเซบายล่าง',
  'อื่นๆ / หน่วยงานภายนอก',
];

export const STORAGE_KEYS = {
  EVENTS: 'rio7_calendar_events',
  ROOMS: 'rio7_meeting_rooms',
  MEETING_TYPES: 'rio7_meeting_types',
  USERS: 'rio7_users',
  CURRENT_USER: 'rio7_auth_user',
  GAS_API_URL: 'rio7_gas_api_url',
  LAST_SYNC: 'rio7_last_sync_time',
};
