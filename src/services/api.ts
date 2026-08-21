import { BookingEvent, MeetingRoom, MeetingTypeOption, User, UserRole } from '../types';
import { StorageService } from '../utils/storage';
import { callGasApi, fileToBase64 } from './gasConnector';
import { APP_CONFIG } from '../config/constants';

export const ApiService = {
  // ==========================================
  // Calendar Events & Bookings
  // ==========================================
  
  async getEvents(startDate?: string, endDate?: string): Promise<{ events: BookingEvent[]; fromGoogle: boolean }> {
    try {
      const res = await callGasApi('listEvents', { startDate, endDate });
      if (res.success && Array.isArray(res.events) && res.events.length > 0) {
        // อัปเดต Cache ใน LocalStorage
        StorageService.saveEvents(res.events);
        StorageService.saveLastSyncTime(new Date().toISOString());
        return { events: res.events, fromGoogle: true };
      }
    } catch (e) {
      console.warn('[ApiService] Failed to fetch events from GAS:', e);
    }
    
    // Fallback: ดึงจาก Local Storage
    const localEvents = StorageService.getEvents();
    return { events: localEvents, fromGoogle: false };
  },

  async createBooking(
    bookingData: Omit<BookingEvent, 'id' | 'createdAt' | 'updatedAt' | 'syncedWithGoogle'>,
    attachmentFile?: File | null,
    userEmail?: string
  ): Promise<{ success: boolean; event: BookingEvent; message: string }> {
    let filePayload: any = {};
    if (attachmentFile) {
      // ตรวจสอบขนาดไฟล์ไม่เกิน 20MB
      if (attachmentFile.size > APP_CONFIG.MAX_ATTACHMENT_SIZE_BYTES) {
        throw new Error(`ขนาดไฟล์แนบเกินกำหนด (สูงสุด ${APP_CONFIG.MAX_ATTACHMENT_SIZE_MB} MB)`);
      }
      const b64 = await fileToBase64(attachmentFile);
      filePayload = {
        fileBase64: b64.base64,
        fileName: b64.fileName,
        fileMimeType: b64.mimeType,
        eventDate: bookingData.startDate,
      };
    }

    try {
      const res = await callGasApi('createEvent', {
        event: bookingData,
        ...filePayload,
        userEmail: userEmail,
      });

      if (res.success && res.event) {
        const currentEvents = StorageService.getEvents();
        const updated = [res.event, ...currentEvents.filter(ev => ev.id !== res.event.id && ev.googleEventId !== res.event.id)];
        StorageService.saveEvents(updated);
        return { success: true, event: res.event, message: res.message || 'บันทึกและซิงค์กับ Google Calendar สำเร็จ' };
      }
    } catch (e) {
      console.warn('[ApiService] createBooking via GAS failed, falling back to local:', e);
    }

    // Local / Standalone Fallback Mode
    const newId = 'local_' + Date.now();
    const newAttachments = [...(bookingData.attachments || [])];
    if (attachmentFile) {
      newAttachments.push({
        name: attachmentFile.name,
        url: APP_CONFIG.GOOGLE_DRIVE_FOLDER_URL,
        size: attachmentFile.size,
        type: attachmentFile.type,
      });
    }

    const formatTag = (bookingData.meetingFormat || 'ONSITE').toUpperCase();
    const cleanTitle = (bookingData.rawTitle || bookingData.title || '').replace(/^\s*\([^)]+\)\s*/, '');
    const fullTitle = `(${formatTag}) ${cleanTitle}`;

    const newEvent: BookingEvent = {
      ...bookingData,
      id: newId,
      title: fullTitle,
      rawTitle: cleanTitle,
      attachments: newAttachments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedWithGoogle: false,
    };

    const currentEvents = StorageService.getEvents();
    const updated = [newEvent, ...currentEvents];
    StorageService.saveEvents(updated);

    return {
      success: true,
      event: newEvent,
      message: 'บันทึกการจองเรียบร้อย (บันทึกในเครื่อง)',
    };
  },

  async updateBooking(
    eventId: string,
    bookingData: Partial<BookingEvent>,
    attachmentFile?: File | null,
    userEmail?: string
  ): Promise<{ success: boolean; event: BookingEvent; message: string }> {
    let filePayload: any = {};
    if (attachmentFile) {
      if (attachmentFile.size > APP_CONFIG.MAX_ATTACHMENT_SIZE_BYTES) {
        throw new Error(`ขนาดไฟล์แนบเกินกำหนด (สูงสุด ${APP_CONFIG.MAX_ATTACHMENT_SIZE_MB} MB)`);
      }
      const b64 = await fileToBase64(attachmentFile);
      filePayload = {
        fileBase64: b64.base64,
        fileName: b64.fileName,
        fileMimeType: b64.mimeType,
        eventDate: bookingData.startDate,
      };
    }

    try {
      const res = await callGasApi('updateEvent', {
        id: eventId,
        event: bookingData,
        ...filePayload,
        userEmail: userEmail,
      });

      if (res.success && res.event) {
        const currentEvents = StorageService.getEvents();
        const updated = currentEvents.map(ev => (ev.id === eventId || ev.googleEventId === eventId ? res.event : ev));
        StorageService.saveEvents(updated);
        return { success: true, event: res.event, message: res.message || 'อัปเดตและซิงค์กับ Google Calendar สำเร็จ' };
      }
    } catch (e) {
      console.warn('[ApiService] updateBooking via GAS failed, falling back to local:', e);
    }

    // Local Update
    const currentEvents = StorageService.getEvents();
    const existingIndex = currentEvents.findIndex(ev => ev.id === eventId || ev.googleEventId === eventId);
    if (existingIndex === -1) {
      throw new Error('ไม่พบข้อมูลการจองที่ต้องการแก้ไข');
    }

    const existing = currentEvents[existingIndex];
    const newAttachments = [...(bookingData.attachments || existing.attachments || [])];
    if (attachmentFile) {
      newAttachments.push({
        name: attachmentFile.name,
        url: APP_CONFIG.GOOGLE_DRIVE_FOLDER_URL,
        size: attachmentFile.size,
        type: attachmentFile.type,
      });
    }

    const formatTag = (bookingData.meetingFormat || existing.meetingFormat || 'ONSITE').toUpperCase();
    const cleanTitle = (bookingData.rawTitle || bookingData.title || existing.rawTitle || existing.title).replace(/^\s*\([^)]+\)\s*/, '');
    const fullTitle = `(${formatTag}) ${cleanTitle}`;

    const updatedEvent: BookingEvent = {
      ...existing,
      ...bookingData,
      title: fullTitle,
      rawTitle: cleanTitle,
      attachments: newAttachments,
      updatedAt: new Date().toISOString(),
    };

    currentEvents[existingIndex] = updatedEvent;
    StorageService.saveEvents(currentEvents);

    return {
      success: true,
      event: updatedEvent,
      message: 'อัปเดตข้อมูลการจองสำเร็จ',
    };
  },

  async deleteBooking(eventId: string, userEmail?: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await callGasApi('deleteEvent', {
        id: eventId,
        eventId: eventId,
        userEmail: userEmail,
      });

      if (res.success) {
        const currentEvents = StorageService.getEvents();
        const updated = currentEvents.filter(ev => ev.id !== eventId && ev.googleEventId !== eventId);
        StorageService.saveEvents(updated);
        return { success: true, message: res.message || 'ลบการจองและอัปเดต Google Calendar สำเร็จ' };
      }
    } catch (e) {
      console.warn('[ApiService] deleteBooking via GAS failed, falling back to local:', e);
    }

    // Local Delete
    const currentEvents = StorageService.getEvents();
    const updated = currentEvents.filter(ev => ev.id !== eventId && ev.googleEventId !== eventId);
    StorageService.saveEvents(updated);

    return { success: true, message: 'ลบรายการจองสำเร็จ' };
  },

  async syncWithGoogleCalendar(): Promise<{ success: boolean; count: number; message: string }> {
    try {
      const res = await callGasApi('listEvents');
      if (res.success && Array.isArray(res.events)) {
        StorageService.saveEvents(res.events);
        StorageService.saveLastSyncTime(new Date().toISOString());
        return {
          success: true,
          count: res.events.length,
          message: `ซิงค์ข้อมูลสำเร็จ (${res.events.length} รายการ)`,
        };
      }
      return {
        success: false,
        count: 0,
        message: res.error || res.message || 'การซิงค์ข้อมูลล้มเหลว',
      };
    } catch (e: any) {
      return {
        success: false,
        count: 0,
        message: e.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google Calendar',
      };
    }
  },

  // ==========================================
  // User Authentication & RBAC
  // ==========================================

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      const res = await callGasApi('login', { email, password });
      if (res.success && res.user) {
        StorageService.saveCurrentUser(res.user);
        return { success: true, user: res.user, message: res.message || 'เข้าสู่ระบบสำเร็จ' };
      } else if (!res.offlineMode) {
        return { success: false, message: res.message || 'เข้าสู่ระบบไม่สำเร็จ' };
      }
    } catch (e) {
      console.warn('[ApiService] login via GAS failed, falling back to local:', e);
    }

    // Fallback: Local Storage Users
    const users = StorageService.getUsers();
    const normalizedEmail = email.trim().toLowerCase();

    // Default admin shortcut
    if (normalizedEmail === 'peng24@gmail.com' && password === 'peng24@31197012') {
      const adminUser: User = {
        id: 'usr_admin_01',
        email: 'peng24@gmail.com',
        name: 'ผู้ดูแลระบบ สชป.7 (Admin)',
        department: 'ฝ่ายบริหารทั่วไป / สชป.7',
        phone: '045-312-345',
        role: 'admin',
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        approvedBy: 'SYSTEM',
      };
      StorageService.saveCurrentUser(adminUser);
      return { success: true, user: adminUser, message: 'เข้าสู่ระบบในฐานะผู้ดูแลระบบ (Admin) สำเร็จ' };
    }

    const found = users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (!found) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบ' };
    }

    if (found.role === 'disabled') {
      return { success: false, message: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' };
    }

    StorageService.saveCurrentUser(found);
    return { success: true, user: found, message: 'เข้าสู่ระบบสำเร็จ' };
  },

  async register(userData: {
    email: string;
    name: string;
    department: string;
    phone: string;
    password?: string;
  }): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      const res = await callGasApi('register', userData);
      if (res.success && res.user) {
        return { success: true, user: res.user, message: res.message || 'ลงทะเบียนสำเร็จ รอการอนุมัติจาก Admin' };
      } else if (!res.offlineMode) {
        return { success: false, message: res.message || 'ลงทะเบียนไม่สำเร็จ' };
      }
    } catch (e) {
      console.warn('[ApiService] register via GAS failed, falling back to local:', e);
    }

    // Fallback Local Storage
    const users = StorageService.getUsers();
    const normalizedEmail = userData.email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, message: 'อีเมลนี้ได้ลงทะเบียนไว้แล้ว' };
    }

    const newUser: User = {
      id: 'usr_' + Date.now(),
      email: normalizedEmail,
      name: userData.name.trim(),
      department: userData.department.trim(),
      phone: userData.phone.trim(),
      role: 'pending',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    StorageService.saveUsers(users);

    return {
      success: true,
      user: newUser,
      message: 'ลงทะเบียนสำเร็จ! กรุณารอผู้ดูแลระบบ (Admin) ตรวจสอบและอนุมัติสิทธิ์การใช้งาน',
    };
  },

  async getUsers(): Promise<User[]> {
    try {
      const res = await callGasApi('listUsers');
      if (res.success && Array.isArray(res.users)) {
        StorageService.saveUsers(res.users);
        return res.users;
      }
    } catch (e) {
      console.warn('[ApiService] getUsers via GAS failed:', e);
    }
    return StorageService.getUsers();
  },

  async updateUserRole(userId: string, newRole: UserRole, adminEmail?: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await callGasApi('updateUserStatus', { userId, role: newRole, adminEmail });
      if (res.success) {
        const users = StorageService.getUsers().map(u => (u.id === userId ? { ...u, role: newRole } : u));
        StorageService.saveUsers(users);
        return { success: true, message: res.message || 'ปรับปรุงสิทธิ์สำเร็จ' };
      }
    } catch (e) {
      console.warn('[ApiService] updateUserRole via GAS failed:', e);
    }

    const users = StorageService.getUsers().map(u => (u.id === userId ? { ...u, role: newRole, approvedAt: new Date().toISOString(), approvedBy: adminEmail } : u));
    StorageService.saveUsers(users);
    return { success: true, message: `เปลี่ยนสิทธิ์ผู้ใช้เป็น ${newRole} สำเร็จ` };
  },

  // ==========================================
  // Rooms & Meeting Types Management
  // ==========================================

  getRooms(): MeetingRoom[] {
    return StorageService.getRooms();
  },

  saveRooms(rooms: MeetingRoom[]): void {
    StorageService.saveRooms(rooms);
    callGasApi('saveRooms', { rooms }).catch(() => {});
  },

  getMeetingTypes(): MeetingTypeOption[] {
    return StorageService.getMeetingTypes();
  },

  saveMeetingTypes(types: MeetingTypeOption[]): void {
    StorageService.saveMeetingTypes(types);
    callGasApi('saveMeetingTypes', { meetingTypes: types }).catch(() => {});
  },
};
