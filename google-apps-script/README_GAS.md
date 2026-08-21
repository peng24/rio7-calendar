# คู่มือการติดตั้ง Google Apps Script Backend (ฟรี 100%)
สำหรับระบบปฏิทินห้องประชุม สำนักงานชลประทานที่ 7 (สชป.7)

Backend นี้ใช้ Google Apps Script ทำหน้าที่เชื่อมต่อไปยัง:
1. **Google Calendar**: `sarabun07@gmail.com`
2. **Google Drive Folder**: `1C7A4qaEHCpQqgVYV-uwnEGDzVqNGFZUO`
3. **Google Sheets Database**: สำหรับเก็บข้อมูลผู้ใช้งาน, รหัสผ่านที่เข้ารหัสแบบ SHA-256 และประวัติการจอง

---

## ขั้นตอนการติดตั้ง (ทำเพียงครั้งเดียว ใช้เวลาประมาณ 3 นาที)

### 1. เข้าสู่ระบบ Google Apps Script
1. ล็อกอินเข้าสู่บัญชี Google: `sarabun07@gmail.com` (หรือบัญชีที่ดูแลปฏิทิน สชป.7)
2. เปิดเบราว์เซอร์ไปที่: [https://script.google.com/home/start](https://script.google.com/home/start)
3. กดปุ่ม **"โครงการใหม่" (New Project)** ที่มุมซ้ายบน
4. ตั้งชื่อโครงการว่า: `RIO7 Meeting Calendar API`

### 2. นำโค้ดไปวาง
1. ในหน้าจอแก้ไขโค้ด ลบโค้ดเดิมในไฟล์ `Code.gs` ทั้งหมด
2. คัดลอกเนื้อหาทั้งหมดจากไฟล์ [Code.gs](./Code.gs) ไปวางแทนที่
3. กดไอคอน 💾 **"บันทึกโครงการ" (Save project)** หรือกด `Ctrl + S`

### 3. Deploy ให้เป็น Web App
1. กดปุ่มสีน้ำเงิน **"ทำให้ใช้งานได้" (Deploy)** ที่มุมขวาบน -> เลือก **"รายการใหม่สำหรับการทำให้ใช้งานได้" (New deployment)**
2. คลิกไอคอนรูปเฟือง ⚙️ ข้าง "เลือกประเภท" -> เลือก **"เว็บแอป" (Web app)**
3. ตั้งค่าดังนี้:
   - **คำอธิบาย (Description)**: `RIO7 Calendar API v1`
   - **เรียกใช้ในฐานะ (Execute as)**: `ฉัน (sarabun07@gmail.com)` *(เพื่อให้มีสิทธิ์จัดการ Calendar และ Drive อัตโนมัติ)*
   - **ผู้มีสิทธิ์เข้าถึง (Who has access)**: **`ทุกคน (Anyone)`** *(สำคัญมาก เพื่อให้หน้าเว็บส่งคำขอมาได้)*
4. กดปุ่ม **"ทำให้ใช้งานได้" (Deploy)**
5. ในครั้งแรก Google จะขอสิทธิ์เข้าถึง (Authorize access):
   - กด **"ให้สิทธิ์เข้าถึง" (Authorize access)**
   - เลือกบัญชี Google `sarabun07@gmail.com`
   - หากขึ้นหน้าต่างเตือนว่า "Google ไม่ได้ยืนยันแอปนี้" ให้กดคลิกที่ **"ขั้นสูง" (Advanced)** ด้านล่าง -> แล้วคลิก **"ไปที่ RIO7 Meeting Calendar API (ไม่ปลอดภัย)"**
   - กด **"อนุญาต" (Allow)**
6. หลังจาก Deploy สำเร็จ คุณจะได้รับ **URL ของเว็บแอป (Web app URL)** ซึ่งมีรูปแบบ:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
7. คัดลอก Web app URL นี้ไว้ เพื่อนำไปใส่ในหน้าการตั้งค่า Admin ของเว็บ หรือในไฟล์ `.env` / Cloudflare Pages

---

## บัญชี Admin เริ่มต้น (Initial Admin)
ระบบได้สร้างบัญชี Admin เริ่มต้นให้โดยอัตโนมัติ:
- **Email**: `sarabun07@gmail.com`
- **Password**: `Admin@RIO7#2026` *(แนะนำให้เปลี่ยนรหัสผ่านหลังจากเข้าสู่ระบบสำเร็จ)*

---

## การทดสอบว่า Web App ทำงานได้เรียบร้อย
เปิดเบราว์เซอร์แล้วนำ Web App URL ที่ได้ไปวางตามด้วย `?action=ping` เช่น:
```
https://script.google.com/macros/s/AKfycbx.../exec?action=ping
```
หากขึ้นข้อความ JSON `{"success":true,"message":"RIO 7 Meeting Calendar Backend is online!"}` แสดงว่าพร้อมใช้งาน 100%!
