import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { BookingEvent, MeetingRoom, MeetingTypeOption, CalendarFilter, CalendarViewMode, SyncStatus } from '../types';
import { ApiService } from '../services/api';
import { StorageService } from '../utils/storage';
import { APP_CONFIG } from '../config/constants';
import { checkBookingConflict, toYyyyMmDd } from '../utils/dateUtils';

interface CalendarContextType {
  events: BookingEvent[];
  filteredEvents: BookingEvent[];
  rooms: MeetingRoom[];
  meetingTypes: MeetingTypeOption[];
  selectedDate: Date;
  viewMode: CalendarViewMode;
  filters: CalendarFilter;
  syncStatus: SyncStatus;
  
  // Modals & Active State
  isBookingModalOpen: boolean;
  isDetailModalOpen: boolean;
  isLoginModalOpen: boolean;
  isAdminModalOpen: boolean;
  selectedEvent: BookingEvent | null;
  editingEvent: BookingEvent | null;
  initialRoomForBooking?: string;
  initialDateForBooking?: string;

  // Actions
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: CalendarViewMode) => void;
  setFilters: React.Dispatch<React.SetStateAction<CalendarFilter>>;
  openBookingModal: (options?: { event?: BookingEvent; roomId?: string; date?: string; startTime?: string }) => void;
  closeBookingModal: () => void;
  openDetailModal: (event: BookingEvent) => void;
  closeDetailModal: () => void;
  setIsLoginModalOpen: (open: boolean) => void;
  setIsAdminModalOpen: (open: boolean) => void;

  // CRUD Operations
  createBooking: (data: Omit<BookingEvent, 'id' | 'createdAt' | 'updatedAt' | 'syncedWithGoogle'>, file?: File | null, userEmail?: string) => Promise<{ success: boolean; message: string }>;
  updateBooking: (id: string, data: Partial<BookingEvent>, file?: File | null, userEmail?: string) => Promise<{ success: boolean; message: string }>;
  deleteBooking: (id: string, userEmail?: string) => Promise<{ success: boolean; message: string }>;
  syncNow: () => Promise<void>;
  
  // Helpers
  checkConflict: (target: { id?: string; roomId: string; startDate: string; startTime: string; endDate: string; endTime: string; isAllDay?: boolean }) => BookingEvent | null;
  refreshRoomsAndTypes: () => void;
}

const initialFilters: CalendarFilter = {
  searchQuery: '',
  selectedRooms: [],
  selectedFormats: [],
  selectedDepartments: [],
};

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<BookingEvent[]>(() => StorageService.getEvents());
  const [rooms, setRooms] = useState<MeetingRoom[]>(() => StorageService.getRooms());
  const [meetingTypes, setMeetingTypes] = useState<MeetingTypeOption[]>(() => StorageService.getMeetingTypes());
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [filters, setFilters] = useState<CalendarFilter>(initialFilters);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncedAt: StorageService.getLastSyncTime(),
    error: null,
    syncedCount: events.length,
  });

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<BookingEvent | null>(null);
  const [initialRoomForBooking, setInitialRoomForBooking] = useState<string | undefined>();
  const [initialDateForBooking, setInitialDateForBooking] = useState<string | undefined>();

  const refreshRoomsAndTypes = useCallback(() => {
    setRooms(StorageService.getRooms());
    setMeetingTypes(StorageService.getMeetingTypes());
  }, []);

  // โหลดข้อมูลปฏิทินและซิงค์
  const syncNow = useCallback(async () => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));
    try {
      const result = await ApiService.getEvents();
      setEvents(result.events);
      setSyncStatus({
        isSyncing: false,
        lastSyncedAt: new Date().toISOString(),
        error: null,
        syncedCount: result.events.length,
      });
    } catch (err: any) {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: err.message || 'ซิงค์ข้อมูลไม่สำเร็จ',
      }));
    }
  }, []);

  // เริ่มต้นทำงาน: ดึงข้อมูลและตั้ง Auto-refresh ทุก 3 นาที
  useEffect(() => {
    syncNow();
    const interval = setInterval(() => {
      syncNow();
    }, APP_CONFIG.DEFAULT_AUTO_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [syncNow]);

  // ค้นหาและกรองการประชุม
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // 1. ค้นหาคำค้น (Search Query)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchTitle = (event.title || '').toLowerCase().includes(q);
        const matchRoom = (event.roomName || '').toLowerCase().includes(q);
        const matchOrganizer = (event.organizerName || '').toLowerCase().includes(q);
        const matchDept = (event.department || '').toLowerCase().includes(q);
        const matchMeetingId = (event.meetingId || '').toLowerCase().includes(q);
        const matchDesc = (event.description || '').toLowerCase().includes(q);

        if (!matchTitle && !matchRoom && !matchOrganizer && !matchDept && !matchMeetingId && !matchDesc) {
          return false;
        }
      }

      // 2. กรองห้องประชุม
      if (filters.selectedRooms.length > 0) {
        const matchRoom = filters.selectedRooms.includes(event.roomId) || filters.selectedRooms.includes(event.roomName);
        if (!matchRoom) return false;
      }

      // 3. กรองรูปแบบการประชุม
      if (filters.selectedFormats.length > 0) {
        if (!filters.selectedFormats.includes(event.meetingFormat)) {
          return false;
        }
      }

      // 4. กรองหน่วยงาน/ฝ่าย
      if (filters.selectedDepartments.length > 0) {
        if (!filters.selectedDepartments.includes(event.department)) {
          return false;
        }
      }

      return true;
    });
  }, [events, filters]);

  // ตรวจสอบการชนกันของห้องประชุม
  const checkConflict = useCallback((target: {
    id?: string;
    roomId: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    isAllDay?: boolean;
  }) => {
    return checkBookingConflict(target, events);
  }, [events]);

  // Modal Handlers
  const openBookingModal = (options?: { event?: BookingEvent; roomId?: string; date?: string; startTime?: string }) => {
    if (options?.event) {
      setEditingEvent(options.event);
      setInitialRoomForBooking(options.event.roomId);
      setInitialDateForBooking(options.event.startDate);
    } else {
      setEditingEvent(null);
      setInitialRoomForBooking(options?.roomId || rooms[0]?.id || 'room-swoc7');
      setInitialDateForBooking(options?.date || toYyyyMmDd(selectedDate));
    }
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setEditingEvent(null);
  };

  const openDetailModal = (event: BookingEvent) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedEvent(null);
  };

  // CRUD Actions
  const createBooking = async (
    data: Omit<BookingEvent, 'id' | 'createdAt' | 'updatedAt' | 'syncedWithGoogle'>,
    file?: File | null,
    userEmail?: string
  ) => {
    const res = await ApiService.createBooking(data, file, userEmail);
    if (res.success) {
      setEvents(StorageService.getEvents());
      closeBookingModal();
    }
    return res;
  };

  const updateBooking = async (
    id: string,
    data: Partial<BookingEvent>,
    file?: File | null,
    userEmail?: string
  ) => {
    const res = await ApiService.updateBooking(id, data, file, userEmail);
    if (res.success) {
      setEvents(StorageService.getEvents());
      closeBookingModal();
      if (selectedEvent && selectedEvent.id === id) {
        setSelectedEvent(res.event);
      }
    }
    return res;
  };

  const deleteBooking = async (id: string, userEmail?: string) => {
    const res = await ApiService.deleteBooking(id, userEmail);
    if (res.success) {
      setEvents(StorageService.getEvents());
      closeDetailModal();
      closeBookingModal();
    }
    return res;
  };

  return (
    <CalendarContext.Provider
      value={{
        events,
        filteredEvents,
        rooms,
        meetingTypes,
        selectedDate,
        viewMode,
        filters,
        syncStatus,
        isBookingModalOpen,
        isDetailModalOpen,
        isLoginModalOpen,
        isAdminModalOpen,
        selectedEvent,
        editingEvent,
        initialRoomForBooking,
        initialDateForBooking,
        setSelectedDate,
        setViewMode,
        setFilters,
        openBookingModal,
        closeBookingModal,
        openDetailModal,
        closeDetailModal,
        setIsLoginModalOpen,
        setIsAdminModalOpen,
        createBooking,
        updateBooking,
        deleteBooking,
        syncNow,
        checkConflict,
        refreshRoomsAndTypes,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
