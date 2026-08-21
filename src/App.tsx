import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CalendarProvider, useCalendar } from './context/CalendarContext';
import { Navbar } from './components/layout/Navbar';
import { FilterBar } from './components/calendar/FilterBar';
import { MonthView } from './components/calendar/MonthView';
import { WeekView } from './components/calendar/WeekView';
import { DayView } from './components/calendar/DayView';
import { RoomMatrixView } from './components/calendar/RoomMatrixView';
import { AgendaView } from './components/calendar/AgendaView';
import { BookingModal } from './components/booking/BookingModal';
import { EventDetailModal } from './components/booking/EventDetailModal';
import { LoginModal } from './components/auth/LoginModal';
import { AdminModal } from './components/admin/AdminModal';
import { Footer } from './components/layout/Footer';

const CalendarMainContent: React.FC = () => {
  const { viewMode } = useCalendar();

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 flex-1">
      {viewMode === 'month' && <MonthView />}
      {viewMode === 'week' && <WeekView />}
      {viewMode === 'day' && <DayView />}
      {viewMode === 'matrix' && <RoomMatrixView />}
      {viewMode === 'agenda' && <AgendaView />}

      {/* Global Modals */}
      <BookingModal />
      <EventDetailModal />
      <LoginModal />
      <AdminModal />
    </main>
  );
};

export function App() {
  return (
    <AuthProvider>
      <CalendarProvider>
        <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-800">
          <Navbar />
          <FilterBar />
          <CalendarMainContent />
          <Footer />
        </div>
      </CalendarProvider>
    </AuthProvider>
  );
}

export default App;
