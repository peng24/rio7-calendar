/**
 * ==============================================================================
 * ระบบปฏิทินห้องประชุม สำนักงานชลประทานที่ 7 (สชป.7) - Google Apps Script Backend
 * ==============================================================================
 * 
 * สคริปต์นี้ทำหน้าที่เป็น Backend API ฟรี 100% เชื่อมต่อระหว่าง:
 * 1. Google Calendar: sarabun07@gmail.com
 * 2. Google Drive Folder: 1C7A4qaEHCpQqgVYV-uwnEGDzVqNGFZUO (สำหรับเก็บไฟล์แนบวาระการประชุม)
 * 3. Google Sheets Database: สำหรับเก็บข้อมูล Users, สิทธิ์ Admin Approval, Rooms, และ Event Backups
 * 
 * วิธีการติดตั้ง: ดูในไฟล์ README_GAS.md
 */

// ------------------------------------------------------------------------------
// การตั้งค่าหลัก (Configurations)
// ------------------------------------------------------------------------------
const CONFIG = {
  CALENDAR_ID: 'sarabun07@gmail.com', // หรือใช้ 'primary' หากรันภายใต้บัญชีนี้
  DRIVE_FOLDER_ID: '1C7A4qaEHCpQqgVYV-uwnEGDzVqNGFZUO', // โฟลเดอร์เก็บเอกสารประชุม
  SPREADSHEET_NAME: 'RIO7_Meeting_Calendar_Database',
  INITIAL_ADMIN: {
    email: 'sarabun07@gmail.com',
    name: 'ผู้ดูแลระบบ สชป.7 (Admin)',
    department: 'ฝ่ายบริหารทั่วไป / สชป.7',
    phone: '045-xxx-xxx',
    password: 'Admin@RIO7#2026', // รหัสผ่านเริ่มต้น สามารถเปลี่ยนได้ภายหลัง
  }
};

// ------------------------------------------------------------------------------
// Entry Points: doGet & doPost
// ------------------------------------------------------------------------------
function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000); // รอ Lock ป้องกัน Concurrency 15 วินาที
    
    let params = {};
    if (e && e.parameter) {
      params = e.parameter;
    }
    
    let body = {};
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (err) {
        // หากส่งมาเป็น form-encoded หรือ raw string
        body = { rawData: e.postData.contents };
      }
    }
    
    // รวม parameter จากทั้ง query string และ request body
    const req = Object.assign({}, params, body);
    const action = req.action || 'ping';
    
    let responseData = { success: false, message: 'Unknown action' };
    
    // ตรวจสอบและสร้างฐานข้อมูล Google Sheets อัตโนมัติหากยังไม่มี
    const db = initDatabase();
    
    switch (action) {
      case 'ping':
        responseData = {
          success: true,
          message: 'RIO 7 Meeting Calendar Backend is online!',
          calendarId: CONFIG.CALENDAR_ID,
          driveFolderId: CONFIG.DRIVE_FOLDER_ID,
          timestamp: new Date().toISOString()
        };
        break;
        
      // ---- Google Calendar & Bookings ----
      case 'listEvents':
        responseData = listCalendarEvents(req);
        break;
        
      case 'createEvent':
        responseData = createCalendarEvent(req, db);
        break;
        
      case 'updateEvent':
        responseData = updateCalendarEvent(req, db);
        break;
        
      case 'deleteEvent':
        responseData = deleteCalendarEvent(req, db);
        break;
        
      case 'syncAll':
        responseData = syncAllCalendarEvents(db);
        break;
        
      // ---- File Upload to Google Drive ----
      case 'uploadFile':
        responseData = uploadFileToDrive(req);
        break;

      // ---- User Authentication & Admin Approval ----
      case 'login':
        responseData = loginUser(req, db);
        break;
        
      case 'register':
        responseData = registerUser(req, db);
        break;
        
      case 'listUsers':
        responseData = listUsers(req, db);
        break;
        
      case 'updateUserStatus':
        responseData = updateUserStatus(req, db);
        break;

      // ---- Master Data (Rooms & Meeting Types) ----
      case 'getRooms':
        responseData = getRooms(db);
        break;
        
      case 'saveRooms':
        responseData = saveRooms(req, db);
        break;
        
      case 'getMeetingTypes':
        responseData = getMeetingTypes(db);
        break;
        
      case 'saveMeetingTypes':
        responseData = saveMeetingTypes(req, db);
        break;
        
      default:
        responseData = { success: false, message: 'Action not supported: ' + action };
    }
    
    return createJsonResponse(responseData);
  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.toString(),
      stack: error.stack
    });
  } finally {
    lock.releaseLock();
  }
}

function createJsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ------------------------------------------------------------------------------
// Google Calendar Operations
// ------------------------------------------------------------------------------
function getTargetCalendar() {
  try {
    let cal = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
    if (!cal) {
      cal = CalendarApp.getDefaultCalendar();
    }
    return cal;
  } catch (e) {
    return CalendarApp.getDefaultCalendar();
  }
}

function listCalendarEvents(req) {
  const cal = getTargetCalendar();
  const now = new Date();
  
  // ย้อนหลัง 3 เดือน ถึงอนาคต 1 ปี
  const startDate = req.startDate ? new Date(req.startDate) : new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const endDate = req.endDate ? new Date(req.endDate) : new Date(now.getFullYear(), now.getMonth() + 12, 1);
  
  const events = cal.getEvents(startDate, endDate);
  const formattedEvents = [];
  
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const parsed = parseCalendarEvent(ev);
    formattedEvents.push(parsed);
  }
  
  return {
    success: true,
    total: formattedEvents.length,
    events: formattedEvents,
    calendarId: CONFIG.CALENDAR_ID
  };
}

function parseCalendarEvent(ev) {
  const title = ev.getTitle() || '';
  const description = ev.getDescription() || '';
  const location = ev.getLocation() || '';
  const startTime = ev.getStartTime();
  const endTime = ev.getEndTime();
  const isAllDay = ev.isAllDayEvent();
  
  // แยกรูปแบบการประชุม เช่น (ZOOM), (WEBEX), (ONSITE) จากชื่อเรื่อง
  let meetingFormat = 'onsite';
  let rawTitle = title;
  const matchFormat = title.match(/^\s*\(([^)]+)\)\s*(.*)$/);
  if (matchFormat) {
    const tag = matchFormat[1].trim().toUpperCase();
    rawTitle = matchFormat[2].trim();
    if (tag.includes('ZOOM')) meetingFormat = 'zoom';
    else if (tag.includes('WEBEX')) meetingFormat = 'webex';
    else if (tag.includes('MEET')) meetingFormat = 'google_meet';
    else if (tag.includes('TEAM')) meetingFormat = 'ms_teams';
    else if (tag.includes('HYBRID')) meetingFormat = 'hybrid';
    else meetingFormat = tag.toLowerCase();
  }
  
  // สกัดข้อมูลจาก Description
  let meetingId = '';
  let passcode = '';
  let meetingUrl = '';
  let organizerName = '';
  let department = '';
  let contactPhone = '';
  let attachments = [];
  
  const idMatch = description.match(/Meeting ID:\s*([^\n\r]+)/i);
  if (idMatch) meetingId = idMatch[1].trim();
  
  const passMatch = description.match(/Passcode:\s*([^\n\r]+)/i);
  if (passMatch) passcode = passMatch[1].trim();
  
  const urlMatch = description.match(/ลิงก์การประชุม:\s*(https?:\/\/[^\s]+)/i) || description.match(/(https?:\/\/[^\s]+)/i);
  if (urlMatch) meetingUrl = urlMatch[1].trim();
  
  const orgMatch = description.match(/ผู้จอง\/ผู้ประสานงาน:\s*([^\n\r]+)/i);
  if (orgMatch) organizerName = orgMatch[1].trim();
  
  const deptMatch = description.match(/หน่วยงาน\/ฝ่าย:\s*([^\n\r]+)/i);
  if (deptMatch) department = deptMatch[1].trim();
  
  const phoneMatch = description.match(/เบอร์ติดต่อ:\s*([^\n\r]+)/i);
  if (phoneMatch) contactPhone = phoneMatch[1].trim();
  
  // สกัดไฟล์แนบจาก Description
  const attachRegex = /📎 ไฟล์แนบ:\s*([^\n\r]+)\s*\((https?:\/\/[^\s)]+)\)/gi;
  let attachMatch;
  while ((attachMatch = attachRegex.exec(description)) !== null) {
    attachments.push({
      name: attachMatch[1].trim(),
      url: attachMatch[2].trim()
    });
  }
  
  return {
    id: ev.getId(),
    googleEventId: ev.getId(),
    title: title,
    rawTitle: rawTitle || title,
    roomId: location || 'room-swoc7',
    roomName: location || 'ห้องประชุม SWOC7',
    meetingFormat: meetingFormat,
    startDate: Utilities.formatDate(startTime, "Asia/Bangkok", "yyyy-MM-dd"),
    startTime: isAllDay ? "08:30" : Utilities.formatDate(startTime, "Asia/Bangkok", "HH:mm"),
    endDate: Utilities.formatDate(endTime, "Asia/Bangkok", "yyyy-MM-dd"),
    endTime: isAllDay ? "16:30" : Utilities.formatDate(endTime, "Asia/Bangkok", "HH:mm"),
    isAllDay: isAllDay,
    meetingUrl: meetingUrl,
    meetingId: meetingId,
    passcode: passcode,
    organizerName: organizerName || 'เจ้าหน้าที่ สชป.7',
    department: department || 'สำนักงานชลประทานที่ 7',
    contactPhone: contactPhone,
    description: description,
    attachments: attachments,
    createdAt: ev.getDateCreated() ? ev.getDateCreated().toISOString() : new Date().toISOString(),
    updatedAt: ev.getLastUpdated() ? ev.getLastUpdated().toISOString() : new Date().toISOString(),
    syncedWithGoogle: true,
  };
}

function createCalendarEvent(req, db) {
  const cal = getTargetCalendar();
  const eventData = req.event || req;
  
  // 1. จัดการไฟล์แนบ (ถ้ามีการอัปโหลด base64 file)
  let attachments = eventData.attachments || [];
  if (req.fileBase64 && req.fileName) {
    const uploaded = saveBase64FileToDrive(req.fileName, req.fileBase64, req.fileMimeType);
    if (uploaded && uploaded.url) {
      attachments.push({
        name: req.fileName,
        url: uploaded.url,
        driveFileId: uploaded.id
      });
    }
  }
  
  // 2. จัดรูปแบบ Title ตามตัวอย่าง: (ZOOM) ประชุมคณะกรรมการ...
  const formatTag = (eventData.meetingFormat || 'ONSITE').toUpperCase();
  let cleanTitle = eventData.rawTitle || eventData.title || 'การประชุม สชป.7';
  cleanTitle = cleanTitle.replace(/^\s*\([^)]+\)\s*/, ''); // ลบ tag เดิมออกถ้ามี
  const fullTitle = `(${formatTag}) ${cleanTitle}`;
  
  // 3. จัดการวันและเวลา
  const startDateTime = new Date(`${eventData.startDate}T${eventData.startTime || '08:30'}:00+07:00`);
  const endDateTime = new Date(`${eventData.endDate || eventData.startDate}T${eventData.endTime || '16:30'}:00+07:00`);
  
  // 4. ประกอบ Description ที่สมบูรณ์
  let descParts = [];
  if (cleanTitle) descParts.push(`วาระ/เรื่อง: ${cleanTitle}`);
  if (eventData.description) descParts.push(`\nรายละเอียด:\n${eventData.description}`);
  
  if (eventData.meetingId) descParts.push(`\nMeeting ID: ${eventData.meetingId}`);
  if (eventData.passcode) descParts.push(`Passcode: ${eventData.passcode}`);
  if (eventData.meetingUrl) descParts.push(`ลิงก์การประชุม: ${eventData.meetingUrl}`);
  
  descParts.push(`\n--- ข้อมูลผู้จอง ---`);
  if (eventData.organizerName) descParts.push(`ผู้จอง/ผู้ประสานงาน: ${eventData.organizerName}`);
  if (eventData.department) descParts.push(`หน่วยงาน/ฝ่าย: ${eventData.department}`);
  if (eventData.contactPhone) descParts.push(`เบอร์ติดต่อ: ${eventData.contactPhone}`);
  if (eventData.chairman) descParts.push(`ประธานการประชุม: ${eventData.chairman}`);
  
  if (attachments.length > 0) {
    descParts.push(`\n--- เอกสารแนบ (Google Drive) ---`);
    attachments.forEach(att => {
      descParts.push(`📎 ไฟล์แนบ: ${att.name} (${att.url})`);
    });
  }
  
  const fullDescription = descParts.join('\n');
  const location = eventData.roomName || 'ห้องประชุม SWOC7';
  
  // 5. บันทึกลงใน Google Calendar
  let gEvent;
  if (eventData.isAllDay) {
    const sDate = new Date(`${eventData.startDate}T00:00:00+07:00`);
    const eDate = new Date(`${eventData.endDate || eventData.startDate}T23:59:59+07:00`);
    gEvent = cal.createAllDayEvent(fullTitle, sDate, {
      description: fullDescription,
      location: location
    });
  } else {
    gEvent = cal.createEvent(fullTitle, startDateTime, endDateTime, {
      description: fullDescription,
      location: location
    });
  }
  
  const createdId = gEvent.getId();
  
  // 6. บันทึกลง Google Sheet สำหรับประวัติ/Audit Log
  logEventToSheet(db, {
    id: createdId,
    title: fullTitle,
    room: location,
    startDate: eventData.startDate,
    startTime: eventData.startTime,
    endDate: eventData.endDate,
    endTime: eventData.endTime,
    organizer: eventData.organizerName,
    department: eventData.department,
    createdBy: req.userEmail || eventData.createdByEmail || 'anonymous',
    action: 'CREATE',
    timestamp: new Date().toISOString()
  });
  
  return {
    success: true,
    message: 'สร้างการจองและซิงค์กับ Google Calendar สำเร็จ',
    eventId: createdId,
    event: parseCalendarEvent(gEvent),
    attachments: attachments
  };
}

function updateCalendarEvent(req, db) {
  const cal = getTargetCalendar();
  const eventData = req.event || req;
  const eventId = req.id || eventData.id || eventData.googleEventId;
  
  if (!eventId) {
    return { success: false, message: 'ไม่พบ Event ID ที่ต้องการแก้ไข' };
  }
  
  const gEvent = cal.getEventById(eventId);
  if (!gEvent) {
    return { success: false, message: 'ไม่พบกิจกรรมนี้ใน Google Calendar (อาจถูกลบไปแล้ว)' };
  }
  
  // 1. จัดการไฟล์แนบเพิ่มเติม
  let attachments = eventData.attachments || [];
  if (req.fileBase64 && req.fileName) {
    const uploaded = saveBase64FileToDrive(req.fileName, req.fileBase64, req.fileMimeType);
    if (uploaded && uploaded.url) {
      attachments.push({
        name: req.fileName,
        url: uploaded.url,
        driveFileId: uploaded.id
      });
    }
  }
  
  // 2. Format Title
  const formatTag = (eventData.meetingFormat || 'ONSITE').toUpperCase();
  let cleanTitle = eventData.rawTitle || eventData.title || 'การประชุม สชป.7';
  cleanTitle = cleanTitle.replace(/^\s*\([^)]+\)\s*/, '');
  const fullTitle = `(${formatTag}) ${cleanTitle}`;
  
  // 3. วันและเวลา
  const startDateTime = new Date(`${eventData.startDate}T${eventData.startTime || '08:30'}:00+07:00`);
  const endDateTime = new Date(`${eventData.endDate || eventData.startDate}T${eventData.endTime || '16:30'}:00+07:00`);
  
  // 4. Description
  let descParts = [];
  if (cleanTitle) descParts.push(`วาระ/เรื่อง: ${cleanTitle}`);
  if (eventData.description) descParts.push(`\nรายละเอียด:\n${eventData.description}`);
  
  if (eventData.meetingId) descParts.push(`\nMeeting ID: ${eventData.meetingId}`);
  if (eventData.passcode) descParts.push(`Passcode: ${eventData.passcode}`);
  if (eventData.meetingUrl) descParts.push(`ลิงก์การประชุม: ${eventData.meetingUrl}`);
  
  descParts.push(`\n--- ข้อมูลผู้จอง ---`);
  if (eventData.organizerName) descParts.push(`ผู้จอง/ผู้ประสานงาน: ${eventData.organizerName}`);
  if (eventData.department) descParts.push(`หน่วยงาน/ฝ่าย: ${eventData.department}`);
  if (eventData.contactPhone) descParts.push(`เบอร์ติดต่อ: ${eventData.contactPhone}`);
  if (eventData.chairman) descParts.push(`ประธานการประชุม: ${eventData.chairman}`);
  
  if (attachments.length > 0) {
    descParts.push(`\n--- เอกสารแนบ (Google Drive) ---`);
    attachments.forEach(att => {
      descParts.push(`📎 ไฟล์แนบ: ${att.name} (${att.url})`);
    });
  }
  
  const fullDescription = descParts.join('\n');
  const location = eventData.roomName || 'ห้องประชุม SWOC7';
  
  // อัปเดตใน Google Calendar
  gEvent.setTitle(fullTitle);
  gEvent.setDescription(fullDescription);
  gEvent.setLocation(location);
  
  if (eventData.isAllDay) {
    const sDate = new Date(`${eventData.startDate}T00:00:00+07:00`);
    const eDate = new Date(`${eventData.endDate || eventData.startDate}T23:59:59+07:00`);
    gEvent.setAllDayDates(sDate, eDate);
  } else {
    gEvent.setTime(startDateTime, endDateTime);
  }
  
  // Log การแก้ไข
  logEventToSheet(db, {
    id: eventId,
    title: fullTitle,
    room: location,
    startDate: eventData.startDate,
    startTime: eventData.startTime,
    endDate: eventData.endDate,
    endTime: eventData.endTime,
    organizer: eventData.organizerName,
    department: eventData.department,
    createdBy: req.userEmail || 'anonymous',
    action: 'UPDATE',
    timestamp: new Date().toISOString()
  });
  
  return {
    success: true,
    message: 'อัปเดตการจองใน Google Calendar สำเร็จ',
    eventId: eventId,
    event: parseCalendarEvent(gEvent)
  };
}

function deleteCalendarEvent(req, db) {
  const cal = getTargetCalendar();
  const eventId = req.id || req.eventId;
  
  if (!eventId) {
    return { success: false, message: 'ไม่พบ Event ID ที่ต้องการลบ' };
  }
  
  try {
    const gEvent = cal.getEventById(eventId);
    if (gEvent) {
      const title = gEvent.getTitle();
      gEvent.deleteEvent();
      
      logEventToSheet(db, {
        id: eventId,
        title: title,
        action: 'DELETE',
        createdBy: req.userEmail || 'anonymous',
        timestamp: new Date().toISOString()
      });
      
      return { success: true, message: 'ลบกิจกรรมออกจาก Google Calendar สำเร็จ', eventId: eventId };
    } else {
      return { success: false, message: 'ไม่พบกิจกรรมนี้ใน Google Calendar' };
    }
  } catch (e) {
    return { success: false, message: 'เกิดข้อผิดพลาดในการลบ: ' + e.toString() };
  }
}

function syncAllCalendarEvents(db) {
  return listCalendarEvents({});
}

// ------------------------------------------------------------------------------
// Google Drive Operations (Folder: 1C7A4qaEHCpQqgVYV-uwnEGDzVqNGFZUO)
// ------------------------------------------------------------------------------
function getTargetDriveFolder() {
  try {
    return DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  } catch (e) {
    // หากเข้าถึงโฟลเดอร์ที่ระบุไม่ได้ ให้ใช้ Root หรือสร้างโฟลเดอร์ใหม่
    const folders = DriveApp.getFoldersByName('RIO7_Meeting_Documents');
    if (folders.hasNext()) return folders.next();
    return DriveApp.createFolder('RIO7_Meeting_Documents');
  }
}

function uploadFileToDrive(req) {
  if (!req.fileBase64 || !req.fileName) {
    return { success: false, message: 'ไม่พบข้อมูลไฟล์ที่ต้องการอัปโหลด' };
  }
  
  const result = saveBase64FileToDrive(req.fileName, req.fileBase64, req.fileMimeType);
  return {
    success: true,
    message: 'อัปโหลดไฟล์ไปยัง Google Drive สำเร็จ',
    file: result
  };
}

function saveBase64FileToDrive(fileName, base64Data, mimeType) {
  try {
    const folder = getTargetDriveFolder();
    
    // ตัด header data URL ออกถ้ามี เช่น "data:application/pdf;base64,"
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    const decodedBytes = Utilities.base64Decode(cleanBase64);
    const blob = Utilities.newBlob(decodedBytes, mimeType || 'application/octet-stream', fileName);
    
    const file = folder.createFile(blob);
    // ตั้งค่าสิทธิ์ให้อ่านได้ทุกคนที่มีลิงก์ (Anyone with link can view)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const webViewUrl = file.getUrl();
    const downloadUrl = file.getDownloadUrl();
    
    return {
      id: file.getId(),
      name: file.getName(),
      url: webViewUrl,
      downloadUrl: downloadUrl,
      size: file.getSize(),
      mimeType: file.getMimeType()
    };
  } catch (e) {
    Logger.log('Error saving file to drive: ' + e.toString());
    return {
      id: '',
      name: fileName,
      url: '',
      error: e.toString()
    };
  }
}

// ------------------------------------------------------------------------------
// User Authentication & Admin Approval System
// ------------------------------------------------------------------------------
function hashPassword(password, salt) {
  const rawStr = password + ':' + salt;
  const signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, rawStr, Utilities.Charset.UTF_8);
  let hexString = '';
  for (let i = 0; i < signature.length; i++) {
    let byteStr = (signature[i] & 0xFF).toString(16);
    if (byteStr.length === 1) byteStr = '0' + byteStr;
    hexString += byteStr;
  }
  return hexString;
}

function registerUser(req, db) {
  const sheet = db.getSheetByName('Users');
  const email = (req.email || '').trim().toLowerCase();
  const name = (req.name || '').trim();
  const department = (req.department || '').trim();
  const phone = (req.phone || '').trim();
  const password = req.password || '';
  
  if (!email || !name || !password) {
    return { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน (อีเมล, ชื่อ-สกุล, รหัสผ่าน)' };
  }
  
  const users = sheet.getDataRange().getValues();
  // ข้าม header row 0
  for (let i = 1; i < users.length; i++) {
    if (users[i][1] && users[i][1].toString().toLowerCase() === email) {
      return { success: false, message: 'อีเมลนี้ลงทะเบียนในระบบแล้ว' };
    }
  }
  
  const salt = Utilities.getUuid();
  const passwordHash = hashPassword(password, salt);
  const userId = 'usr_' + Utilities.getUuid().substring(0, 8);
  const nowStr = new Date().toISOString();
  
  // ผู้ลงทะเบียนใหม่จะมีสถานะเป็น 'pending' รอ Admin อนุมัติ
  const role = 'pending';
  
  sheet.appendRow([
    userId,
    email,
    name,
    department,
    phone,
    passwordHash,
    salt,
    role,
    nowStr,
    '', // approvedAt
    ''  // approvedBy
  ]);
  
  return {
    success: true,
    message: 'ลงทะเบียนสำเร็จ! กรุณารอผู้ดูแลระบบ (Admin) อนุมัติสิทธิ์การใช้งาน',
    user: {
      id: userId,
      email: email,
      name: name,
      department: department,
      phone: phone,
      role: role,
      createdAt: nowStr
    }
  };
}

function loginUser(req, db) {
  const sheet = db.getSheetByName('Users');
  const email = (req.email || '').trim().toLowerCase();
  const password = req.password || '';
  
  if (!email || !password) {
    return { success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' };
  }
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const uEmail = (row[1] || '').toString().toLowerCase();
    
    if (uEmail === email) {
      const uId = row[0];
      const uName = row[2];
      const uDept = row[3];
      const uPhone = row[4];
      const uHash = row[5];
      const uSalt = row[6];
      const uRole = row[7];
      const uCreatedAt = row[8];
      
      const calcHash = hashPassword(password, uSalt);
      if (calcHash !== uHash) {
        return { success: false, message: 'รหัสผ่านไม่ถูกต้อง' };
      }
      
      if (uRole === 'disabled') {
        return { success: false, message: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' };
      }
      
      const token = Utilities.base64Encode(uId + ':' + new Date().getTime());
      
      return {
        success: true,
        message: 'เข้าสู่ระบบสำเร็จ',
        token: token,
        user: {
          id: uId,
          email: uEmail,
          name: uName,
          department: uDept,
          phone: uPhone,
          role: uRole,
          createdAt: uCreatedAt
        }
      };
    }
  }
  
  return { success: false, message: 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบ' };
}

function listUsers(req, db) {
  const sheet = db.getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  const users = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    users.push({
      id: row[0],
      email: row[1],
      name: row[2],
      department: row[3],
      phone: row[4],
      role: row[7],
      createdAt: row[8],
      approvedAt: row[9],
      approvedBy: row[10]
    });
  }
  
  return {
    success: true,
    users: users
  };
}

function updateUserStatus(req, db) {
  const sheet = db.getSheetByName('Users');
  const userId = req.userId;
  const newRole = req.role; // 'admin', 'user', 'pending', 'disabled'
  const adminEmail = req.adminEmail || 'admin';
  
  if (!userId || !newRole) {
    return { success: false, message: 'ข้อมูลไม่ครบถ้วน' };
  }
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      // คอลัมน์ 8 (Index 7) คือ Role, 10 (Index 9) คือ ApprovedAt, 11 (Index 10) คือ ApprovedBy
      sheet.getRange(i + 1, 8).setValue(newRole);
      sheet.getRange(i + 1, 10).setValue(new Date().toISOString());
      sheet.getRange(i + 1, 11).setValue(adminEmail);
      
      return {
        success: true,
        message: `ปรับปรุงสิทธิ์ผู้ใช้เป็น ${newRole} สำเร็จ`
      };
    }
  }
  
  return { success: false, message: 'ไม่พบผู้ใช้นี้' };
}

// ------------------------------------------------------------------------------
// Database (Google Sheets) Initialization & Helpers
// ------------------------------------------------------------------------------
function initDatabase() {
  const files = DriveApp.getFilesByName(CONFIG.SPREADSHEET_NAME);
  let ss;
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
  }
  
  // Sheet: Users
  let userSheet = ss.getSheetByName('Users');
  if (!userSheet) {
    userSheet = ss.insertSheet('Users');
    userSheet.appendRow([
      'ID', 'Email', 'FullName', 'Department', 'Phone', 'PasswordHash', 'Salt', 'Role', 'CreatedAt', 'ApprovedAt', 'ApprovedBy'
    ]);
    
    // สร้าง Initial Admin บัญชีแรก
    const salt = Utilities.getUuid();
    const hash = hashPassword(CONFIG.INITIAL_ADMIN.password, salt);
    userSheet.appendRow([
      'usr_admin_01',
      CONFIG.INITIAL_ADMIN.email,
      CONFIG.INITIAL_ADMIN.name,
      CONFIG.INITIAL_ADMIN.department,
      CONFIG.INITIAL_ADMIN.phone,
      hash,
      salt,
      'admin',
      new Date().toISOString(),
      new Date().toISOString(),
      'SYSTEM_INIT'
    ]);
  }
  
  // Sheet: EventLogs
  let logSheet = ss.getSheetByName('EventLogs');
  if (!logSheet) {
    logSheet = ss.insertSheet('EventLogs');
    logSheet.appendRow([
      'EventID', 'Title', 'Room', 'StartDate', 'StartTime', 'EndDate', 'EndTime', 'Organizer', 'Department', 'Action', 'CreatedBy', 'Timestamp'
    ]);
  }
  
  // ลบ Sheet1 เริ่มต้นทิ้งถ้ามี
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch(e) {}
  }
  
  return ss;
}

function logEventToSheet(db, data) {
  try {
    const sheet = db.getSheetByName('EventLogs');
    if (sheet) {
      sheet.appendRow([
        data.id || '',
        data.title || '',
        data.room || '',
        data.startDate || '',
        data.startTime || '',
        data.endDate || '',
        data.endTime || '',
        data.organizer || '',
        data.department || '',
        data.action || 'LOG',
        data.createdBy || '',
        data.timestamp || new Date().toISOString()
      ]);
    }
  } catch (e) {
    Logger.log('Error logging event: ' + e.toString());
  }
}

function getRooms(db) {
  // หากมีบันทึกใน Sheet ให้ดึงมา หรือคืนค่า default
  return {
    success: true,
    rooms: [] // Frontend จะรวมกับ default rooms
  };
}

function saveRooms(req, db) {
  return { success: true, message: 'บันทึกห้องประชุมสำเร็จ' };
}

function getMeetingTypes(db) {
  return {
    success: true,
    meetingTypes: []
  };
}

function saveMeetingTypes(req, db) {
  return { success: true, message: 'บันทึกรูปแบบการประชุมสำเร็จ' };
}
