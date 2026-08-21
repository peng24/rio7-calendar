import React from 'react';
import { Search, Filter, X, Building2, Video, Users } from 'lucide-react';
import { useCalendar } from '../../context/CalendarContext';
import { DEPARTMENTS } from '../../config/constants';

export const FilterBar: React.FC = () => {
  const { 
    rooms, 
    meetingTypes, 
    filters, 
    setFilters, 
    filteredEvents, 
    events 
  } = useCalendar();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const toggleRoomFilter = (roomId: string) => {
    setFilters(prev => {
      const exists = prev.selectedRooms.includes(roomId);
      return {
        ...prev,
        selectedRooms: exists 
          ? prev.selectedRooms.filter(id => id !== roomId) 
          : [...prev.selectedRooms, roomId]
      };
    });
  };

  const toggleFormatFilter = (formatId: string) => {
    setFilters(prev => {
      const exists = prev.selectedFormats.includes(formatId);
      return {
        ...prev,
        selectedFormats: exists
          ? prev.selectedFormats.filter(id => id !== formatId)
          : [...prev.selectedFormats, formatId]
      };
    });
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFilters(prev => ({
      ...prev,
      selectedDepartments: val ? [val] : []
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      searchQuery: '',
      selectedRooms: [],
      selectedFormats: [],
      selectedDepartments: []
    });
  };

  const hasActiveFilters = 
    filters.searchQuery.trim() !== '' || 
    filters.selectedRooms.length > 0 || 
    filters.selectedFormats.length > 0 || 
    filters.selectedDepartments.length > 0;

  return (
    <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อการประชุม, ห้อง, ผู้ประสานงาน, Meeting ID..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Badges & Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          
          {/* Quick Room Filters */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0">
            <span className="text-slate-500 font-medium hidden lg:inline flex-shrink-0">ห้อง:</span>
            {rooms.slice(0, 4).map(room => {
              const isSelected = filters.selectedRooms.includes(room.id) || filters.selectedRooms.includes(room.name);
              return (
                <button
                  key={room.id}
                  onClick={() => toggleRoomFilter(room.id)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all flex items-center gap-1 flex-shrink-0 ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span 
                    className="w-2 h-2 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: room.color }} 
                  />
                  <span>{room.name.replace('ห้องประชุม ', '')}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Format Filters */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {meetingTypes.slice(0, 3).map(type => {
              const isSelected = filters.selectedFormats.includes(type.id);
              return (
                <button
                  key={type.id}
                  onClick={() => toggleFormatFilter(type.id)}
                  className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                    isSelected
                      ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {type.name}
                </button>
              );
            })}
          </div>

          {/* Department Select */}
          <select
            value={filters.selectedDepartments[0] || ''}
            onChange={handleDepartmentChange}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[150px] truncate"
          >
            <option value="">ทุกหน่วยงาน/ฝ่าย</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-medium bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors"
            >
              <X className="w-3 h-3" />
              <span>ล้างตัวกรอง</span>
            </button>
          )}

          {/* Result Count Indicator */}
          <div className="text-[11px] text-slate-400 font-medium ml-auto hidden sm:block">
            แสดง {filteredEvents.length} / {events.length} รายการ
          </div>
        </div>

      </div>
    </div>
  );
};
