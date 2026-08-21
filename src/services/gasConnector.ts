import { StorageService } from '../utils/storage';

export interface GasApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  events?: any[];
  event?: any;
  eventId?: string;
  users?: any[];
  user?: any;
  token?: string;
  file?: any;
  [key: string]: any;
}

/**
 * เรียกใช้งาน Google Apps Script Web App
 * ใช้เทคนิคส่ง HTTP POST ด้วย Content-Type: text/plain เพื่อป้องกัน CORS Preflight (OPTIONS)
 * และเปิด redirect: 'follow' เพื่อจัดการ HTTP 302 Redirect ของ Google Apps Script อัตโนมัติ
 */
export async function callGasApi<T = any>(action: string, payload: Record<string, any> = {}): Promise<GasApiResponse<T>> {
  const gasUrl = StorageService.getGasApiUrl();

  // หากยังไม่ได้ตั้งค่า Google Apps Script Web App URL ให้ส่งสถานะแจ้งเตือน
  if (!gasUrl) {
    return {
      success: false,
      message: 'ยังไม่ได้ระบุ Google Apps Script Web App URL ในระบบ (กำลังทำงานในโหมด Standalone/Local)',
      offlineMode: true,
    };
  }

  const requestBody = {
    action,
    ...payload,
    timestamp: new Date().toISOString(),
  };

  try {
    // 1. ลองส่งผ่าน Cloudflare Functions Proxy (/api/gas) หากอยู่บน Cloudflare Pages
    // 2. หากรันใน Local Dev หรือตรง ให้ส่งตรงไปยัง gasUrl ด้วย text/plain POST
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(requestBody),
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    return json;
  } catch (error: any) {
    console.warn(`[GAS Connector] Request '${action}' failed:`, error);
    return {
      success: false,
      error: error.message || 'ไม่สามารถเชื่อมต่อกับ Google Apps Script ได้',
      offlineMode: true,
    };
  }
}

/**
 * แปลง File Object ในเบราว์เซอร์เป็น Base64 String สำหรับส่งขึ้น Google Drive ผ่าน GAS
 */
export function fileToBase64(file: File): Promise<{ base64: string; fileName: string; mimeType: string; size: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve({
        base64: result,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      });
    };
    reader.onerror = (err) => reject(err);
  });
}
