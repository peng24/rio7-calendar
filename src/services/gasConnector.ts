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
  offlineMode?: boolean;
  [key: string]: any;
}

/**
 * เรียกใช้งาน Google Apps Script Web App
 * 1. เรียกผ่าน Cloudflare Pages Functions Reverse Proxy (/api/gas) โดยอัตโนมัติ
 * 2. หากไม่ได้อยู่บน Cloudflare หรือ Proxy ไม่ได้ตั้งค่า ให้ส่งตรงไปยัง GAS Web App URL ด้วย text/plain POST
 */
export async function callGasApi<T = any>(action: string, payload: Record<string, any> = {}): Promise<GasApiResponse<T>> {
  const requestBody = {
    action,
    ...payload,
    timestamp: new Date().toISOString(),
  };

  const jsonBody = JSON.stringify(requestBody);

  // 1. ลองส่งผ่าน Cloudflare Pages Function Proxy (/api/gas) ก่อนเป็นอันดับแรก
  try {
    const proxyRes = await fetch('/api/gas', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: jsonBody,
    });

    if (proxyRes.ok) {
      const json = await proxyRes.json();
      if (json && json.success) {
        return json;
      }
      if (json && !json.offlineMode) {
        return json;
      }
    }
  } catch (proxyErr) {
    // ข้ามไปลอง Direct GAS URL
  }

  // 2. หาก Proxy ไม่พร้อม ให้ใช้ Direct GAS URL จาก LocalStorage
  const gasUrl = StorageService.getGasApiUrl();

  if (gasUrl) {
    try {
      const directRes = await fetch(gasUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: jsonBody,
        redirect: 'follow',
      });

      if (directRes.ok) {
        const json = await directRes.json();
        return json;
      }
    } catch (directErr: any) {
      console.warn(`[GAS Connector] Direct request '${action}' failed:`, directErr);
      return {
        success: false,
        error: directErr.message || 'ไม่สามารถเชื่อมต่อกับ Google Apps Script ได้',
        offlineMode: true,
      };
    }
  }

  return {
    success: false,
    message: 'ยังไม่ได้ระบุ Google Apps Script Web App URL หรือการเชื่อมต่อออฟไลน์',
    offlineMode: true,
  };
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
