# LaLiga Table & Match Results Tracker
ระบบติดตามตารางคะแนนและผลการแข่งขัน LaLiga

โปรเจกต์เว็บสำหรับแสดงตารางคะแนน ผลการแข่งขัน และข้อมูลทีม LaLiga
โดยใช้ External REST API และโครงสร้างข้อมูล (Data Structures)

---

## Technologies
เทคโนโลยีที่ใช้

- Node.js — ใช้สำหรับรัน JavaScript ฝั่ง Server
- Express.js — Framework สำหรับสร้าง Web Server
- JavaScript — ภาษาหลักที่ใช้พัฒนาระบบ
- HTML — ใช้สร้างโครงสร้างหน้าเว็บ
- CSS — ใช้ตกแต่งและออกแบบหน้าเว็บ
- OpenLigaDB API — External API สำหรับดึงข้อมูลการแข่งขันฟุตบอล

---

## Features
ความสามารถของระบบ

- แสดงตารางคะแนน LaLiga
- แสดงข้อมูลการแข่งขันของแต่ละทีม
- แสดงนัดถัดไปของทีม
- แสดงรายชื่อดาวซัลโว
- เรียงตารางด้วย Selection Sort
- เรียงตารางด้วย Insertion Sort
- เรียงตารางด้วย Bubble Sort
- Queue สำหรับเลือกทีมที่ต้องการดู
- Stack สำหรับเก็บประวัติการทำงาน
- Undo การทำงานล่าสุด
- แสดงสถานะ Loading
- แสดง Error เมื่อโหลดข้อมูลไม่สำเร็จ

---

## Data Structures
โครงสร้างข้อมูลที่ใช้

### Sort
ใช้ Algorithm สำหรับเรียงข้อมูลทีมตามคะแนนจากมากไปน้อย

- Selection Sort — การเรียงแบบเลือก
- Insertion Sort — การเรียงแบบแทรก
- Bubble Sort — การเรียงแบบฟอง

### Queue
ใช้ Queue สำหรับจัดลำดับทีมที่ผู้ใช้เลือกดู

ทำงานแบบ FIFO (First In, First Out)
หรือ "เข้าก่อน ออกก่อน"

### Stack
ใช้ Stack สำหรับเก็บประวัติการทำงานของผู้ใช้
และใช้สำหรับฟังก์ชัน Undo

ทำงานแบบ LIFO (Last In, First Out)
หรือ "เข้าทีหลัง ออกก่อน"

---

## API
API ที่ใช้

ใช้ OpenLigaDB API ซึ่งเป็น External REST API
สำหรับดึงข้อมูลตารางคะแนนและการแข่งขันของ LaLiga

---

## How to Run
วิธีเปิดใช้งานโปรเจกต์

ติดตั้ง Dependencies:

```bash
npm install