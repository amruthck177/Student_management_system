# 🎓 CampusLedger — Student Management System (SMS)

> **Enterprise Academic Operating System & Collegiate Management Portal**  
> Built with React (Vite), Node.js, Express.js, MongoDB, Tailwind CSS, and Razorpay.

---

## 📌 Overview

**CampusLedger** is a full-stack web application designed for academic institutions to manage scholars, faculty, attendance, examinations, fee collections, timetables, and circular notices.

Featuring complete **Role-Based Access Control (RBAC)** across 4 distinct user tiers:
1. 🛡️ **Administrator**: Institutional analytics, user provisioning, student records, CSV/Excel bulk import, fee invoicing, and an immutable security audit trail.
2. 👨‍🏫 **Teacher / Faculty**: Assigned student rosters, interactive roll-call attendance register, marks entry with automatic 10-point GPA calculation, and class schedules.
3. 🎓 **Student**: Attendance tracking with **`<75%` low-attendance warning alerts**, semester transcripts & CGPA, Razorpay online fee payments, and downloadable official ID & Report Card PDFs.
4. 👨‍👩‍👧 **Parent / Guardian**: Multi-child overview switcher, live attendance monitoring, academic transcripts, and outstanding fee invoices.

---

## ⚡ Quick Demo Login Credentials

The portal at `http://localhost:5173/login` includes **1-Click Autofill Demo Buttons** for instant evaluation:

| Role | Demo Email | Password | Primary Console & Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campusledger.edu` | `Admin123!` | System stats, user management, student directory, CSV bulk import, fee reconciliation, audit trail |
| **Teacher** | `dr.sharma@campusledger.edu` | `Teacher123!` | Assigned class rosters, roll call attendance register, marks/grade entry with auto-GPA |
| **Student** | `alex.morgan@campusledger.edu` | `Student123!` | Attendance analytics with `<75%` warnings, semester transcripts, Razorpay fee checkout, PDF downloads |
| **Parent** | `parent.morgan@campusledger.edu` | `Parent123!` | Multi-child switcher tabs, linked student attendance reports, academic transcripts, and fees |

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18+ (Vite), Tailwind CSS, React Router v6, Recharts, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js REST API |
| **Database** | MongoDB Atlas / Local MongoDB, Mongoose ODM |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs salt-hashing, RBAC route guards |
| **Document Generation** | PDFKit (Programmatic official Report Cards & ID Cards) |
| **Payments** | Razorpay SDK with server-side HMAC-SHA256 signature verification |
| **Data Ingestion** | Multer + `csv-parse` + `xlsx` (Bulk student onboarding) |
| **Mailing** | Nodemailer (Password recovery flow) |

---

## 📂 Project Architecture

```text
CampusLedger/
├── backend/
│   ├── config/          # MongoDB connection, mailer & Razorpay SDK setup
│   ├── controllers/     # Route handlers (auth, students, attendance, grades, fees, notices, timetable, audit)
│   ├── middleware/      # JWT verification, RBAC guard, audit logger, file upload
│   ├── models/          # Mongoose models (User, Student, Attendance, Grade, Fee, Notice, Timetable, AuditLog)
│   ├── routes/          # REST API route endpoints
│   ├── utils/           # CGPA math calculator, PDFKit generator, CSV/Excel parser, token helper
│   ├── seed.js          # Realistic demo seeder script
│   └── server.js        # Express app bootstrap
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios instance with Bearer token interceptor
│   │   ├── components/  # Navbar, Sidebar, ProtectedRoute, DataTable, StatCard, Modal, AlertBanner
│   │   ├── context/     # AuthContext (state, tokens, session management)
│   │   └── pages/       # Role dashboards (Admin, Teacher, Student, Parent, Shared)
│   └── vite.config.js
├── sample_students_import.csv # Ready-to-use bulk CSV roster for testing
├── CampusLedger.md            # In-depth architectural & technical specification
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or later)
- **MongoDB** (Local instance or MongoDB Atlas cluster)
- **Git**

### 2. Installation & Setup

#### Clone the repository:
```bash
git clone https://github.com/amruthck177/Student_management_system.git
cd Student_management_system
```

#### Backend Setup:
```bash
cd backend
npm install
cp .env.example .env    # Configure MONGO_URI and JWT_SECRET if needed
npm run seed             # Seed demo users, attendance, grades, and timetables
npm run dev              # Starts API on http://localhost:5000
```

#### Frontend Setup:
```bash
# Open a second terminal
cd frontend
npm install
npm run dev              # Starts UI on http://localhost:5173
```

---

## 📋 Key Features & Business Logic

### 1. Automated Academic CGPA & GPA Computation
$$\text{Semester GPA} = \frac{\sum (\text{Grade Point}_i \times \text{Credits}_i)}{\sum \text{Credits}_i}$$
$$\text{Cumulative CGPA} = \frac{\sum_{\text{all semesters}} (\text{Grade Point}_j \times \text{Credits}_j)}{\sum_{\text{all semesters}} \text{Credits}_j}$$

### 2. Mandatory 75% Attendance Warning System
- Automatically computes session participation: $\text{Attendance \%} = \left(\frac{\text{Present}}{\text{Total Sessions}}\right) \times 100$.
- Proactively flags scholars falling below `<75%` with warning banners across Teacher, Student, and Parent dashboards and on generated PDF report cards.

### 3. Server-Side Cryptographic Payment Verification
- Validates Razorpay payments server-side via `HMAC-SHA256(order_id + "|" + payment_id, SECRET)` before marking fee invoices as paid.

### 4. Server-Side Programmatic PDF Documents
- Generates official **Student ID Cards** and **Semester Transcripts / Report Cards** with custom formatting, headers, tables, and verification tokens.

### 5. CSV / Excel Bulk Roster Ingestion
- Upload `.csv` or `.xlsx` files to onboard hundreds of students in a single click with automated account provisioning.

---

## 🔒 Security & Governance

- **Password Hashing**: Salted and hashed using `bcryptjs`.
- **Stateless Authorization**: JWT with customizable token expiration.
- **RBAC Guards**: Verified on both API endpoints and frontend route trees.
- **Audit Trail**: Every create, edit, delete, import, and payment action is recorded in the `AuditLog` collection.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
