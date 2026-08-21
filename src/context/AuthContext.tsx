import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { StorageService } from '../utils/storage';
import { ApiService } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  isPending: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: { email: string; name: string; department: string; phone: string; password?: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  usersList: User[];
  refreshUsers: () => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getCurrentUser());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [usersList, setUsersList] = useState<User[]>([]);

  useEffect(() => {
    // โหลดรายชื่อผู้ใช้งานทั้งหมดถ้าเป็น Admin
    if (currentUser?.role === 'admin') {
      refreshUsers();
    }
  }, [currentUser]);

  const refreshUsers = async () => {
    try {
      const users = await ApiService.getUsers();
      setUsersList(users);
    } catch (e) {
      console.error('Failed to load users', e);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await ApiService.login(email, password);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; name: string; department: string; phone: string; password?: string }) => {
    setIsLoading(true);
    try {
      const res = await ApiService.register(data);
      if (res.success && res.user) {
        // หากต้องการล็อกอินทันทีในสถานะ pending
        setCurrentUser(res.user);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    StorageService.saveCurrentUser(null);
    setCurrentUser(null);
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const res = await ApiService.updateUserRole(userId, newRole, currentUser?.email || 'admin');
      if (res.success) {
        await refreshUsers();
        // หากแก้ Role ของตัวเอง ให้ sync state
        if (currentUser && currentUser.id === userId) {
          const updatedSelf = { ...currentUser, role: newRole };
          setCurrentUser(updatedSelf);
          StorageService.saveCurrentUser(updatedSelf);
        }
      }
      return res;
    } catch (err: any) {
      return { success: false, message: err.message || 'ไม่สามารถเปลี่ยนสิทธิ์ได้' };
    }
  };

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';
  const isApproved = currentUser?.role === 'admin' || currentUser?.role === 'user';
  const isPending = currentUser?.role === 'pending';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isAdmin,
        isApproved,
        isPending,
        isLoading,
        login,
        register,
        logout,
        usersList,
        refreshUsers,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
