# LaLiga Table & Match Results Tracker
ระบบติดตามตารางคะแนนและผลการแข่งขัน LaLiga

โปรเจกต์เว็บไซต์สำหรับแสดงตารางคะแนน ผลการแข่งขัน ข้อมูลทีม และดาวซัลโวของฟุตบอล LaLiga โดยใช้ External REST API ร่วมกับโครงสร้างข้อมูล (Data Structures) เพื่อฝึกการพัฒนาเว็บไซต์และการจัดการข้อมูล

## Technologies
- React — พัฒนาส่วนติดต่อผู้ใช้ (Frontend)
- Vite — เครื่องมือสำหรับพัฒนาและรัน Frontend
- Node.js — ใช้รัน JavaScript ฝั่ง Server
- Express.js — Framework สำหรับสร้าง Backend API
- JavaScript — ภาษาหลักที่ใช้พัฒนาระบบ
- HTML / CSS — ใช้สร้างและตกแต่งหน้าเว็บไซต์
- OpenLigaDB API — External API สำหรับดึงข้อมูลฟุตบอล

## Features
- แสดงตารางคะแนน LaLiga
- แสดงข้อมูลทีมและผลการแข่งขัน
- แสดงนัดถัดไปของทีม
- แสดงรายชื่อดาวซัลโว
- ใช้ Sorting Algorithms สำหรับเรียงข้อมูล
- Queue สำหรับจัดลำดับทีมที่ผู้ใช้เลือก
- Stack สำหรับเก็บประวัติการทำงาน
- Undo สำหรับย้อนกลับการทำงานล่าสุด
- แสดงสถานะ Loading ระหว่างโหลดข้อมูล
- แสดง Error เมื่อโหลดข้อมูลไม่สำเร็จ
- แสดงสถิติและกราฟข้อมูลการแข่งขัน

## Data Structures

### Sorting Algorithms
ใช้สำหรับเรียงข้อมูลทีมตามคะแนนจากมากไปน้อย
- Selection Sort — การเรียงแบบเลือก
- Insertion Sort — การเรียงแบบแทรก
- Bubble Sort — การเรียงแบบฟอง

### Queue
ใช้จัดลำดับทีมที่ผู้ใช้เลือกดู โดยทำงานแบบ FIFO (First In, First Out) หรือเข้าก่อนออกก่อน

### Stack
ใช้เก็บประวัติการทำงานของผู้ใช้ โดยทำงานแบบ LIFO (Last In, First Out) หรือเข้าทีหลังออกก่อน และนำมาใช้กับฟังก์ชัน Undo

## API
ใช้ OpenLigaDB API ซึ่งเป็น External REST API สำหรับดึงข้อมูลตารางคะแนนและการแข่งขันฟุตบอล LaLiga

Backend ให้บริการ API สำหรับ Frontend เช่น
- `/teams`
- `/scorers`
- `/teamqueue`
- `/teamqueue/process`
- `/history`
- `/undo`

## Project Structure
```text
LaLiga Table/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── server.js
│   └── package.json
│
└── README.md
```

## How to Run
### 1. Backend
เปิด Terminal แล้วใช้คำสั่ง

```bash
cd backend
npm install
npm run dev
```

Backend จะทำงานที่ `http://localhost:3000`

### 2. Frontend
เปิด Terminal อีกหน้าต่างหนึ่ง แล้วใช้คำสั่ง

```bash
cd frontend
npm install
npm run dev
```

เปิดเว็บไซต์ตาม URL ที่ Vite แสดง โดยปกติคือ `http://localhost:5173`

## Team Members & Responsibilities
| ชื่อสมาชิก | หน้าที่รับผิดชอบ |
|---|---|
| [ดัสกร เขียวมณี] | [ทำตารางคะแนนและหน้าทีมและการแข่งขัน] |
| [ธีรยุทธ แสงทับทิม] | [สติถิทีมและหาข้อมูล] |


## Recommendations
| หัวข้อ | ข้อเสนอแนะ |
|---|---|
| ข้อมูลการแข่งขัน | ควรอัปเดตข้อมูลให้เป็นปัจจุบันอยู่เสมอ |
| ประสิทธิภาพ | ควรปรับปรุงความเร็วในการโหลดข้อมูล |
| การใช้งาน | ควรพัฒนาหน้าจอให้ใช้งานง่ายและรองรับมือถือ |
| ฟังก์ชันเพิ่มเติม | สามารถเพิ่มการแจ้งเตือนผลการแข่งขันและสถิติทีมเพิ่มเติมได้ |

## Future Development
- เพิ่มข้อมูลการแข่งขันแบบ Real-time
- เพิ่มรายละเอียดสถิติของแต่ละทีม
- ปรับปรุงการแสดงผลให้รองรับอุปกรณ์หลายขนาด
- เพิ่มฟังก์ชันสำหรับติดตามทีมโปรด
