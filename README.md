<div align="center">

# 🎓 CampusLedger
### Enterprise Academic Operating System & University ERP (v2.0)

[![React](https://img.shields.io/badge/Frontend-React%2018%20(Vite)-61DAFB?logo=react&logoColor=black&style=for-the-badge)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white&style=for-the-badge)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white&style=for-the-badge)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Real--Time-Socket.io-010101?logo=socket.io&logoColor=white&style=for-the-badge)](https://socket.io/)
[![Docker](https://img.shields.io/badge/DevOps-Docker%20%2B%20Compose-2496ED?logo=docker&logoColor=white&style=for-the-badge)](https://www.docker.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb&logoColor=white&style=for-the-badge)](https://www.mongodb.com/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay%20Gateway-02042B?logo=razorpay&logoColor=white&style=for-the-badge)](https://razorpay.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<p align="center">
  A production-grade, full-stack university enterprise resource planning (ERP) platform featuring <strong>Multi-Tier RBAC</strong>, <strong>AI-Driven Academic Diagnostics</strong>, <strong>Real-Time WebSockets</strong>, <strong>Assignments LMS</strong>, <strong>Placement & Career Cell</strong>, <strong>Hostel Facilities Management</strong>, <strong>Parent-Faculty Appointment Booking</strong>, <strong>Library Center</strong>, <strong>PDFKit Document Streaming</strong>, and <strong>Automated Fee Reconciliation</strong>.
</p>

[Key Features](#-enterprise-feature-matrix) • [Architecture](#-system-architecture) • [Demo Logins](#-demo-credentials--1-click-switchers) • [Docker Deployment](#-docker-deployment) • [API Reference](#-complete-api-reference)

</div>

---

## 📑 Table of Contents

1. [Enterprise Feature Matrix](#-enterprise-feature-matrix)
2. [Demo Credentials & 1-Click Role Switchers](#-demo-credentials--1-click-switchers)
3. [System Architecture & Data Flow](#-system-architecture)
4. [Role Capabilities & Portals](#-role-capabilities--portals)
5. [Core Mathematical Algorithms](#-core-mathematical-algorithms)
6. [Complete API Reference](#-complete-api-reference)
7. [Docker & Local Setup Guide](#-installation--getting-started)
8. [Environment Variables Specification](#-environment-variables-specification)
9. [Security Governance & Auditing](#-security-governance--auditing)

---

## 🚀 Enterprise Feature Matrix

| Module | Purpose & Core Capabilities |
| :--- | :--- |
| **🤖 AI Study Advisor** | Server-side predictive engine forecasting semester CGPA, academic backlog probability, and subject-specific remediation roadmaps. |
| **📚 Coursework LMS** | Assignment publishing, student file submissions, deadline countdown timers, and faculty rubric grading. |
| **💼 Placement & Career Cell** | Corporate recruitment drives, automated CGPA eligibility validation, 1-click applications, and interview round tracking. |
| **🏢 Hostel & Maintenance** | Dormitory block & room inventory, bed occupancy management, and student repair ticketing with priority queues. |
| **📅 Parent-Faculty Scheduler**| 1-on-1 consultation booking with Google Meet links, discussion agendas, and faculty approval workflows. |
| **⚡ Real-Time WebSockets** | Bi-directional `Socket.io` event stream broadcasting live circulars, grade releases, and attendance alerts with floating toasts. |
| **📖 Library Center** | Book cataloging by shelf location (`Stack CS-101`), real-time stock counters, reservations, and returns. |
| **💳 Razorpay Invoicing** | Digital fee invoicing, online settlement, and server-side HMAC-SHA256 cryptographic verification. |
| **📄 Programmatic PDF Engine**| Server-side vector PDF generation for official Student ID Cards and Multi-Semester Academic Transcripts. |
| **📁 CSV Roster Ingestion** | Bulk stream-processing of `.csv` and `.xlsx` files to onboard hundreds of students in seconds. |
| **🔒 Two-Factor Auth (2FA)** | Time-based One-Time Password (TOTP) protection compatible with Google Authenticator and Authy. |

---

## ⚡ Demo Credentials & 1-Click Switchers

The login screen at `http://localhost:5173/login` features **1-Click Autofill Buttons** for instant evaluation across all roles:

| Role | Demo Email | Password | Primary Capabilities & Scope |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@campusledger.edu` | `Admin123!` | Institutional analytics, user provisioning, CSV import, fees, placements, hostel tickets, audit trail |
| **👨‍🏫 Teacher** | `dr.sharma@campusledger.edu` | `Teacher123!` | Class rosters, roll call register, marks entry with auto-GPA, LMS assignments, parent meetings |
| **🎓 Student** | `alex.morgan@campusledger.edu` | `Student123!` | **AI Performance Advisor**, `<75%` attendance alerts, coursework submissions, placement drives, hostel repairs, fees, library |
| **👨‍👩‍👧 Parent** | `parent.morgan@campusledger.edu` | `Parent123!` | Multi-child switcher tabs, **AI Advisor for child**, attendance reports, consultation bookings |

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Client["Frontend Client (React 18 + Vite + Tailwind CSS)"]
        UI["Glassmorphism UI System"]
        AuthCtx["AuthContext (JWT & Role State)"]
        SockCtx["SocketContext (Real-Time Toast Alerts)"]
        AIWidget["AI Academic Advisor Widget"]
        AxiosInst["Axios Interceptor (Bearer Token)"]
    end

    subgraph Server["Backend REST API & Micro-Services (Node.js + Express.js + Socket.io)"]
        Router["Express API Routers (/api/*)"]
        AuthGuard["JWT Auth & RBAC Guard"]
        AuditMid["Audit Logger Interceptor"]
        Controllers["Feature Controllers (CRUD & Business Logic)"]
        AIEngine["AI Performance Predictor Engine"]
        CGPAMath["CGPA & GPA Math Utility"]
        PDFEngine["PDFKit Document Generator"]
        CSVIngest["Multer + CSV/Excel Parser"]
        TwoFactor["TOTP / 2FA Cryptography Engine"]
    end

    subgraph Data["Database & External Integrations"]
        Mongo[(MongoDB Atlas / Local DB)]
        Rzp["Razorpay Payment Gateway"]
        SMTP["Nodemailer (SMTP Service)"]
    end

    UI --> AuthCtx
    UI --> SockCtx
    UI --> AIWidget
    AuthCtx --> AxiosInst
    AxiosInst -->|REST API / HTTPS| Router
    Router --> AuthGuard
    AuthGuard --> AuditMid
    AuditMid --> Controllers
    Controllers --> AIEngine
    Controllers --> CGPAMath
    Controllers --> PDFEngine
    Controllers --> CSVIngest
    Controllers --> TwoFactor
    Controllers -->|Mongoose ODM| Mongo
    Controllers -->|Create Order & Verify Signature| Rzp
    Controllers -->|Password Reset Emails| SMTP
```

---

## 🧮 Core Mathematical Algorithms

### 1. 10-Point Academic CGPA & GPA Formula
$$\text{Semester GPA} = \frac{\sum_{i=1}^{n} (\text{Grade Point}_i \times \text{Credits}_i)}{\sum_{i=1}^{n} \text{Credits}_i}$$

$$\text{Cumulative CGPA} = \frac{\sum_{j=1}^{m} (\text{Grade Point}_j \times \text{Credits}_j)}{\sum_{j=1}^{m} \text{Credits}_j}$$

### 2. Mandatory 75% Attendance Warning Logic
$$\text{Attendance Rate (\%)} = \left(\frac{\text{Sessions Present}}{\text{Total Conducted Sessions}}\right) \times 100$$
- If $\text{Attendance Rate} < 75.0\%$: System triggers low-attendance danger banners across student, parent, and teacher consoles.

### 3. Server-Side Cryptographic Payment Verification
$$\text{Signature} = \text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{RAZORPAY\_KEY\_SECRET})$$

---

## 📡 Complete API Reference

### 📚 Coursework & LMS (`/api/assignments`)
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/assignments` | Authenticated | List assignments filtered by department & semester |
| `POST` | `/api/assignments` | Teacher, Admin | Publish new assignment with deadline & max marks |
| `POST` | `/api/assignments/:id/submit` | Student | Submit solution summary & file attachment URL |
| `GET` | `/api/assignments/:id/submissions` | Teacher, Admin, Student | View student submissions for an assignment |
| `POST` | `/api/assignments/submissions/:id/grade` | Teacher, Admin | Enter marks and rubric feedback |

### 💼 Career & Placements (`/api/placements`)
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/placements/drives` | Authenticated | List active, upcoming, and closed recruitment drives |
| `POST` | `/api/placements/drives` | Admin | Post new corporate recruitment drive |
| `POST` | `/api/placements/apply` | Student | Apply to drive (with automated CGPA eligibility check) |
| `GET` | `/api/placements/my-applications` | Student, Admin | List submitted applications and round statuses |
| `PATCH`| `/api/placements/applications/:id/status`| Admin | Update interview round & offer status |

### 🏢 Hostel & Maintenance (`/api/hostel`)
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/hostel/rooms` | Authenticated | View dormitory room blocks & bed occupancy |
| `GET` | `/api/hostel/tickets` | Authenticated | View facility maintenance repair tickets |
| `POST` | `/api/hostel/tickets` | Student | Raise repair ticket (Electrical, Plumbing, AC, etc.) |
| `PATCH`| `/api/hostel/tickets/:id/resolve` | Admin | Resolve ticket and log resolution notes |

### 📅 Consultations (`/api/appointments`)
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/appointments` | Authenticated | List scheduled parent-teacher meetings |
| `POST` | `/api/appointments` | Parent | Request 1-on-1 consultation slot with faculty |
| `PATCH`| `/api/appointments/:id/status` | Teacher, Admin | Confirm appointment & attach Google Meet link |

### 🔐 Authentication & Security (`/api/auth` & `/api/2fa`)
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate credentials & return JWT |
| `POST` | `/api/auth/register` | Admin | Provision a new user account |
| `GET` | `/api/auth/users` | Admin | Paginated user directory |
| `POST` | `/api/2fa/generate` | Authenticated | Generate TOTP secret & QR code data URL |
| `POST` | `/api/2fa/verify` | Authenticated | Verify 6-digit TOTP code and enable 2FA |

---

## 🐳 Docker Deployment

Deploy the entire stack with a single command:

```bash
# Clone the repository
git clone https://github.com/amruthck177/Student_management_system.git
cd Student_management_system

# Launch containerized cluster
docker-compose up --build -d
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **MongoDB Database**: `localhost:27017`

---

## 🛠️ Local Development Setup

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run seed      # Seeds users, grades, library, LMS, placements, hostel
npm run dev       # Starts server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev       # Starts UI on http://localhost:5173
```

---

## 📄 License

This project is licensed under the **MIT License**.

<div align="center">
  <sub>CampusLedger Enterprise v2.0 • Built for Modern Collegiate Institutions</sub>
</div>
