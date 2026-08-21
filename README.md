# ระบบปฏิทินห้องประชุม สำนักงานชลประทานที่ 7 (สชป.7 / RIO 7)
### Meeting Room Calendar & Booking System — 100% Free Architecture

ระบบบริหารจัดการปฏิทินและการจองห้องประชุมออนไลน์/ออนไซต์ สำหรับ **สำนักงานชลประทานที่ 7 กรมชลประทาน** พร้อมระบบซิงค์ข้อมูล 2 ทางกับ **Google Calendar (`sarabun07@gmail.com`)** และจัดเก็บเอกสารวาระการประชุมบน **Google Drive** โดยไม่มีค่าใช้จ่ายตลอดการใช้งาน (100% Free)

---

## 🌟 ฟังก์ชันและคุณสมบัติเด่น

- **📅 5 มุมมองปฏิทินรองรับการใช้งานทุกระดับ**:
  1. **มุมมองรายเดือน (Month View)**: เห็นภาพรวมการประชุมทั้งเดือน พร้อมแท็กสีแยกตามห้องและรูปแบบการประชุม
  2. **มุมมองรายสัปดาห์ (Week View)**: ตารางเวลา 08:00 - 18:00 น. เจาะลึกแต่ละวัน
  3. **มุมมองรายวัน (Day View)**: รายการประชุมประจำวันอย่างละเอียด
  4. **ผังการใช้ห้องประชุม (Room Timeline Matrix)**: เปรียบเทียบทุกห้องประชุมพร้อมกันในแต่ละช่วงเวลา ช่วยให้หาห้องว่างได้ทันที
  5. **มุมมองรายการ (Agenda View)**: รายการประชุมเรียงตามลำดับเวลา พร้อมปุ่มกดเข้าร่วม Zoom/Webex และเปิดไฟล์แนบ
- **🔄 ซิงค์ข้อมูล Real-time กับ Google Calendar (`sarabun07@gmail.com`)**:
  - เมื่อมีการ **เพิ่ม / แก้ไข / ลบ** การจองในเว็บ ระบบจะซิงค์ข้อมูลกับ Google Calendar ทันที
  - ตั้งชื่อหัวข้อตามรูปแบบมาตรฐาน เช่น `(ZOOM) ประชุมคณะกรรมการ...`, `(WEBEX) ประชุม...`
  - กำหนดสถานที่ (Location) เป็นชื่อห้องประชุม เช่น `ห้องประชุม SWOC7`
  - บันทึก Meeting ID, Passcode, ลิงก์ และไฟล์แนบลงใน Description ของ Google Calendar อัตโนมัติ
- **👥 ระบบผู้ใช้งานและรอ Admin อนุมัติสิทธิ์ (Approval Workflow)**:
  - ผู้ใช้งานทั่วไปลงทะเบียนแล้วจะอยู่ในสถานะ `รออนุมัติ (Pending)` เพื่อความปลอดภัย
  - ผู้ดูแลระบบ (Admin) สามารถกด **"อนุมัติใช้งาน"** หรือมอบสิทธิ์ Admin ได้
  - บุคคลภายนอกและเจ้าหน้าที่ทุกคนสามารถเปิดดูปฏิทินและวาระการประชุมได้โดยไม่ต้องล็อกอิน
- **⚠️ ระบบตรวจจับการจองห้องซ้ำซ้อน (Conflict Detection)**:
  - ตรวจสอบอัตโนมัติแบบ Real-time: $\text{เวลาเริ่มใหม่} < \text{เวลาสิ้นสุดเดิม} \text{ และ } \text{เวลาสิ้นสุดใหม่} > \text{เวลาเริ่มเดิม}$
  - แสดงกล่องเตือนสีแดงทันทีหากห้องและเวลาตรงกับการประชุมอื่น
- **📎 แนบไฟล์วาระการประชุมเข้า Google Drive**:
  - รองรับไฟล์ PDF, Word, Excel, PowerPoint และรูปภาพ (จำกัดขนาดไม่เกิน 20 MB)
  - จัดเก็บเข้าสู่โฟลเดอร์ Google Drive: [1C7A4qaEHCpQqgVYV-uwnEGDzVqNGFZUO](https://drive.google.com/drive/folders/1C7A4qaEHCpQqgVYV-uwnEGDzVqNGFZUO?usp=sharing)
- **🎥 รองรับทุกรูปแบบการประชุม**:
  - Zoom Cloud Meetings, Cisco Webex, Google Meet, Microsoft Teams, ประชุมปกติ (Onsite), และ Hybrid
- **⚙️ แผงควบคุมผู้ดูแลระบบ (Admin Dashboard)**:
  - อนุมัติ/จัดการสิทธิ์ผู้ใช้งาน
  - เพิ่ม/ลบ/แก้ไข ห้องประชุม อุปกรณ์ และสีประจำห้อง
  - ตรวจสอบสถานะการเชื่อมต่อ Google Calendar & สั่ง Force Sync

---

## 🏗️ โครงสร้างสถาปัตยกรรม (100% Free Stack)

```
[ Frontend: React + Vite + Tailwind CSS ]  --->  Hosted on [ Cloudflare Pages ] (Free)
                   │
                   ├── Cloudflare Pages Functions (/api/*) [Reverse Proxy]
                   │
                   ▼
       [ Google Apps Script Web App ]  --->  Hosted on [ sarabun07@gmail.com ] (Free)
                   │
         ┌─────────┴─────────┬──────────────────────┐
         ▼                   ▼                      ▼
[ Google Calendar ]   [ Google Drive ]     [ Google Sheets DB ]
 (sarabun07@gmail.com)  (Folder ID: ...)     (Users, Passwords, Logs)
```

---

## 🚀 ขั้นตอนการติดตั้งและ Deploy

### ขั้นตอนที่ 1: ติดตั้ง Google Apps Script Backend (ทำครั้งเดียว)

1. เข้าสู่ระบบ Google ด้วยบัญชี `sarabun07@gmail.com`
2. ไปที่ [https://script.google.com](https://script.google.com) -> คลิก **"New Project" (โครงการใหม่)**
3. คัดลอกโค้ดจากไฟล์ [`google-apps-script/Code.gs`](./google-apps-script/Code.gs) ไปวางทั้งหมด
4. กด **Deploy** -> **New deployment** -> เลือกประเภท **Web app**
   - **Execute as**: `Me (sarabun07@gmail.com)`
   - **Who has access**: `Anyone` (ทุกคน)
5. กด **Deploy** และกดยินยอมสิทธิ์ (Authorize)
6. คุณจะได้รับ **Web app URL** เช่น `https://script.google.com/macros/s/AKfycb.../exec`
7. *(ดูคู่มือฉบับละเอียดได้ที่ [`google-apps-script/README_GAS.md`](./google-apps-script/README_GAS.md))*

---

### ขั้นตอนที่ 2: นำขึ้น GitHub

1. เปิด Terminal ในโฟลเดอร์โปรเจกต์นี้:
```bash
git init
git add .
git commit -m "feat: initial RIO7 Meeting Calendar with Google Calendar Sync"
```
2. สร้าง Repository ใหม่บน [GitHub.com](https://github.com/new) เช่นชื่อ `rio7-calendar`
3. เชื่อมต่อและ Push ขึ้น GitHub:
```bash
git remote add origin https://github.com/<your-username>/rio7-calendar.git
git branch -M main
git push -u origin main
```

---

### ขั้นตอนที่ 3: Deploy ไปยัง Cloudflare Pages (ฟรี 100%)

1. เข้าสู่ระบบ [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. เมนูด้านซ้ายเลือก **Workers & Pages** -> คลิก **Create Application** -> แท็บ **Pages** -> **Connect to Git**
3. เลือก Repository `rio7-calendar` จาก GitHub
4. ตั้งค่า Build Settings ดังนี้:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. ในส่วน **Environment variables (production)** (ถ้าต้องการเชื่อมต่อผ่าน Reverse Proxy):
   - Variable name: `GAS_API_URL`
   - Value: *(URL ของ Google Apps Script Web App ที่ได้จากขั้นตอนที่ 1)*
6. กด **Save and Deploy**
7. รอประมาณ 1 นาที เว็บไซต์ของคุณจะพร้อมใช้งานทันที เช่น `https://rio7-calendar.pages.dev`!

---

## 🔐 บัญชีผู้ดูแลระบบเริ่มต้น (Initial Admin)

ระบบได้ตั้งค่าบัญชี Admin เริ่มต้นไว้ดังนี้:
- **Email**: `sarabun07@gmail.com`
- **Password**: `Admin@RIO7#2026`

*หลังจากเข้าสู่ระบบแล้ว สามารถเปลี่ยนรหัสผ่านและอนุมัติผู้ใช้งานคนอื่นๆ ได้ที่ไอคอนฟันเฟือง ⚙️ (Admin Dashboard) ที่มุมขวาบน*

---

## 💻 การรันเพื่อทดสอบในเครื่อง (Local Development)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. เริ่มต้น Dev Server
npm run dev

# 3. ทดสอบ Build สำหรับ Production
npm run build
```

---

## 🏢 จัดทำโดย
**สำนักงานชลประทานที่ 7 (สชป.7)**
กรมชลประทาน กระทรวงเกษตรและสหกรณ์
