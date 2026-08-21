export type MeetingFormat = 'zoom' | 'webex' | 'google_meet' | 'ms_teams' | 'onsite' | 'hybrid' | string;

export type UserRole = 'admin' | 'user' | 'pending' | 'disabled';

export interface User {
  id: string;
  email: string;
  name: string;
  department: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface AuthSession {
  user: User | null;
  token: string | null;
}

export interface MeetingRoom {
  id: string;
  name: string;
  location: string;
  capacity: number;
  color: string; // Hex color for calendar badge/display
  equipment: string[]; // e.g. ['Projector', 'Smart TV', 'Microphone', 'Sound System', 'Video Conference']
  description?: string;
  isActive: boolean;
}

export interface MeetingTypeOption {
  id: string;
  name: string;
  badgeColor: string;
  iconName: string;
  isOnline: boolean;
  requiresLink: boolean;
}

export interface MeetingAttachment {
  name: string;
  url: string;
  size?: number;
  type?: string;
  driveFileId?: string;
}

export interface BookingEvent {
  id: string; // Unique ID (matches Google Calendar Event ID or Local ID)
  googleEventId?: string;
  title: string; // e.g. "(ZOOM) ประชุมคณะกรรมการ..."
  rawTitle?: string; // e.g. "ประชุมคณะกรรมการ..."
  roomId: string; // Room ID
  roomName: string; // e.g. "ห้องประชุม SWOC7"
  meetingFormat: MeetingFormat; // e.g. "zoom"
  formatLabel?: string; // e.g. "ZOOM"
  
  // Date & Time
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:mm
  isAllDay: boolean;

  // Online Meeting Details
  meetingUrl?: string;
  meetingId?: string; // Zoom Meeting ID or Webex ID
  passcode?: string; // Zoom Passcode

  // Organizer / Department Details
  organizerName: string; // ผู้ประสานงาน / ผู้จอง
  department: string; // ฝ่าย / กอง / โครงการ
  contactPhone: string;
  chairman?: string; // ประธานการประชุม (ถ้ามี)
  attendeeCount?: number;

  // Notes & Attachments
  description?: string; // รายละเอียด / วาระการประชุม
  attachments: MeetingAttachment[];
  
  // Metadata
  createdByUserId?: string;
  createdByEmail?: string;
  createdAt: string;
  updatedAt: string;
  syncedWithGoogle: boolean;
  googleHtmlLink?: string;
}

export interface CalendarFilter {
  searchQuery: string;
  selectedRooms: string[];
  selectedFormats: string[];
  selectedDepartments: string[];
  startDate?: string;
  endDate?: string;
}

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda' | 'matrix';

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
  syncedCount: number;
}
