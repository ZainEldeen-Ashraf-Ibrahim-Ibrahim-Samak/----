# 📚 EduCenter Financial Management System — Product Requirements Document

> **Version:** 1.0.0  
> **Date:** June 2026  
> **Platform:** Electron.js · TypeScript · MongoDB · SQLite · Tailwind CSS  
> **Languages:** Arabic (RTL) · English (LTR) · i18n  
> **OS Support:** Windows · macOS  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Business Entities & Services](#2-business-entities--services)
3. [System Architecture](#3-system-architecture)
4. [Core Features & Modules](#4-core-features--modules)
   - 4.1 [White-Label & Branding System](#41-white-label--branding-system)
   - 4.2 [Dashboard & Analytics](#42-dashboard--analytics)
   - 4.3 [Centers Management](#43-centers-management)
   - 4.4 [Teachers Management](#44-teachers-management)
   - 4.5 [Students & Sessions](#45-students--sessions)
   - 4.6 [Revenue Tracking](#46-revenue-tracking)
   - 4.7 [Salary & Payroll](#47-salary--payroll)
   - 4.8 [Personal Financial Management](#48-personal-financial-management)
   - 4.9 [Company Financials](#49-company-financials)
   - 4.10 [Photography Studio Module](#410-photography-studio-module)
   - 4.11 [Mobile Teacher Service Module](#411-mobile-teacher-service-module)
   - 4.12 [In-Center Teacher Service Module](#412-in-center-teacher-service-module)
   - 4.13 [Reports & Exports](#413-reports--exports)
5. [UI/UX Requirements](#5-uiux-requirements)
6. [Data Models](#6-data-models)
7. [Technology Stack Details](#7-technology-stack-details)
8. [Sync & Offline Strategy](#8-sync--offline-strategy)
9. [Phased Implementation Plan](#9-phased-implementation-plan)
10. [Non-Functional Requirements](#10-non-functional-requirements)

---

## 1. Project Overview

### Summary

A **cross-platform desktop application** (Windows + macOS) for managing the complete financial and operational lifecycle of a multi-center educational business. The system covers two physical educational centers, three distinct service lines, a partner company, and the owner's personal finances — all in one unified, offline-first app with cloud sync.

### Business Pain Points Being Solved

| Pain Point | Solution |
|---|---|
| Revenue from sessions calculated per-student manually | Automated per-student session billing |
| No unified view of salaries across centers | Centralized payroll module per center/entity |
| Rent payments tracked informally | Rent ledger with due-date alerts |
| Personal installments (أقساط) not tracked digitally | Personal debt & installment tracker |
| Gam3eyya (جمعية) rounds tracked in notebooks | Digital Gam3eyya management module |
| No separation between personal and business cash flows | Separate wallets per entity |
| White-label needed for potential resale | Full in-app white-label system |

---

## 2. Business Entities & Services

The system manages **5 distinct financial entities**:

```
┌─────────────────────────────────────────────────────────┐
│                    OWNER (Personal)                     │
│         أقساط شخصية · جمعيات · اشتراكات                  │
└────────────────────┬────────────────────────────────────┘
                     │ owns / operates
        ┌────────────┴────────────┐
        │                         │
   ┌────▼────┐               ┌────▼────┐
   │ Center 1│               │ Center 2│
   │ سنتر ١  │               │ سنتر ٢  │
   └────┬────┘               └────┬────┘
        │                         │
        └──────────┬──────────────┘
                   │ shared services
        ┌──────────▼──────────────────────────┐
        │           Service Lines             │
        │  ┌──────────────────────────────┐   │
        │  │ 1. Photography Studio        │   │
        │  │    ستوديو تصوير للدروس       │   │
        │  ├──────────────────────────────┤   │
        │  │ 2. In-Center Teacher Service │   │
        │  │    خدمة للمدرسين داخل السنتر  │   │
        │  ├──────────────────────────────┤   │
        │  │ 3. Mobile Teacher Service    │   │
        │  │    خدمة متنقلة للمدرسين      │   │
        │  └──────────────────────────────┘   │
        └─────────────────────────────────────┘
                   │
        ┌──────────▼──────────────┐
        │   Partner Company       │
        │   الشركة الشريكة        │
        └─────────────────────────┘
```

### Entity Descriptions

#### Entity 1 & 2 — Educational Centers (سنتر ١ / سنتر ٢)
- Physical locations offering tutoring sessions
- Revenue = `(number of students in session) × (price per student)`
- Fixed costs: rent, salaries, utilities
- Each center tracked independently with its own P&L

#### Entity 3 — Photography Studio (ستوديو التصوير)
- Dedicated recording/streaming studio for online lessons
- Serves external teachers who book sessions
- Also serves in-house teachers of both centers
- Revenue: session booking fees, hourly rates, packages

#### Entity 4 — In-Center Teacher Service
- Service provided to teachers already working inside the two centers
- Could be equipment, scheduling, production support, or other value-add
- Tracked per teacher per center

#### Entity 5 — Mobile Teacher Service
- On-demand service: team goes to any external teacher's location
- Revenue tracked per visit/job
- Expenses include transport and labor

#### Entity 6 — Partner Company (الشركة)
- Separate legal/financial entity operating within the ecosystem
- Has its own revenue, expenses, and payroll

#### Entity 7 — Owner Personal Finance
- Personal installments (أقساط) with due dates and remaining amounts
- Gam3eyya participation (جمعية) with round tracking
- Personal subscriptions (اشتراكات)
- Personal cash flow distinct from all business entities

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron.js Shell                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  React + Tailwind UI                  │  │
│  │                  (Renderer Process)                   │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │ IPC Bridge                        │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │                   Main Process                        │  │
│  │  ┌─────────────────┐   ┌──────────────────────────┐   │  │
│  │  │  Business Logic  │   │   Sync Service           │   │  │
│  │  │  (TypeScript)    │   │   (MongoDB Adapter)      │   │  │
│  │  └────────┬─────────┘   └─────────────┬────────────┘   │  │
│  │           │                           │                 │  │
│  │  ┌────────▼─────────┐   ┌─────────────▼────────────┐   │  │
│  │  │  SQLite (Local)  │   │  MongoDB (Online Sync)   │   │  │
│  │  │  better-sqlite3  │   │  Atlas / Self-hosted     │   │  │
│  │  └──────────────────┘   └──────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Reason |
|---|---|---|
| Local DB | SQLite via `better-sqlite3` | Fast, zero-config, works offline |
| Cloud DB | MongoDB Atlas | Flexible schema, cross-device sync |
| Sync Strategy | Offline-first, sync on reconnect | Works without internet |
| State Management | Zustand | Lightweight, TypeScript-friendly |
| i18n | `react-i18next` | RTL + LTR, hot-swap |
| Theming | Tailwind CSS + CSS vars | Dark/Light + white-label |
| White-Label | Runtime config JSON | Change name/logo without rebuild |

---

## 4. Core Features & Modules

---

### 4.1 White-Label & Branding System

**Purpose:** Allow rebranding of the app without recompilation — change app name, logo, colors, and icon.

#### Features
- In-app settings panel for branding customization
- Upload custom logo (PNG/SVG) stored locally and applied immediately
- Change app display name (shown in title bar, sidebar, reports)
- Custom accent color picker (updates entire Tailwind theme via CSS variables)
- App icon change: user uploads icon → Electron rebuilds tray icon + window icon at runtime
- All branding saved to local config file: `branding.json`

#### `branding.json` Schema
```json
{
  "appName": "EduCenter Pro",
  "logoPath": "/assets/custom-logo.png",
  "accentColor": "#2563EB",
  "darkMode": false,
  "language": "ar"
}
```

#### Screens
- **Settings → Branding Tab**: Logo upload, name field, color picker, preview panel

---

### 4.2 Dashboard & Analytics

**Purpose:** Single-screen overview of the entire financial picture across all entities.

#### Widgets (Configurable)
- Total Revenue This Month (all entities combined)
- Revenue per entity (mini bar chart)
- Upcoming rent payments (next 7 days)
- Upcoming personal installment dues
- Gam3eyya next round date
- Top-earning teachers this month
- Expenses vs Revenue trend (line chart — 6 months)
- Net profit per center

#### Filter Options
- Date range picker
- Entity selector (Center 1, Center 2, Studio, Company, Personal)
- Currency display (EGP only in v1)

---

### 4.3 Centers Management

**Purpose:** Configure and manage the two educational centers as distinct entities.

#### Data Per Center
- Center name, address, phone
- Monthly rent amount + due date + landlord info
- Utility bills tracking (electricity, water, internet)
- Total capacity (rooms / students)
- Active teachers list
- Active students list

#### Features
- Rent ledger: history of all rent payments with receipt upload
- Automatic rent due alerts (7 days before, on due date)
- Expense log per center (maintenance, supplies, etc.)
- Monthly P&L summary per center

---

### 4.4 Teachers Management

**Purpose:** Central registry of all teachers across all entities with their financial terms.

#### Teacher Profile Fields
| Field | Type | Description |
|---|---|---|
| Name (AR + EN) | String | Full name, both languages |
| Phone | String | Primary contact |
| Subject | String | المادة الدراسية |
| Center Assignment | Enum | Center 1 / Center 2 / Both / External |
| Service Type | Enum | In-Center / Studio / Mobile |
| Salary Type | Enum | Fixed / Per-Session / Percentage |
| Fixed Salary | Number | Monthly fixed (if applicable) |
| Per-Session Rate | Number | Rate per session (if applicable) |
| Revenue Share % | Number | Owner's cut from teacher's revenue |
| Tax Deduction % | Number | Optional tax holding |
| Status | Enum | Active / Inactive / Suspended |

#### Salary Calculation Modes
```
Mode 1: Fixed Salary
  → Teacher earns flat monthly amount regardless of sessions

Mode 2: Per Session
  → Teacher salary = number of sessions × rate per session

Mode 3: Revenue Share
  → Center collects: students × price_per_student
  → Teacher receives: collection × (1 - owner_percentage)
  → Owner receives: collection × owner_percentage
```

#### Features
- Teacher statement: monthly breakdown of sessions, students, earnings
- Salary slip generation (PDF export)
- Attendance tracking per session
- Notes & documents attachment

---

### 4.5 Students & Sessions

**Purpose:** Core revenue engine — track every session, every student attending, calculate money owed.

#### Session Record Fields
| Field | Type | Description |
|---|---|---|
| Session ID | UUID | Auto-generated |
| Center | FK | Which center |
| Teacher | FK | Who taught |
| Date | Date | Session date |
| Start Time | Time | |
| Duration | Number | Minutes |
| Subject | String | |
| Student Count | Number | مجموع الطلاب في الحصة |
| Price Per Student | Number | سعر الطالب |
| Total Revenue | Computed | `student_count × price_per_student` |
| Teacher Cut | Computed | Based on teacher salary type |
| Owner Net | Computed | `total_revenue - teacher_cut` |
| Notes | String | Optional |

#### Student (Basic Registry)
- Student name
- Grade level
- Parent phone
- Which teacher(s) / center(s)
- Session history
- *Note: Full student management is secondary — focus is financial tracking*

#### Session Entry Flow
1. Select Center → Select Teacher → Enter Date & Time
2. Enter number of students present
3. Price per student auto-filled from teacher profile (editable)
4. System calculates: total, teacher cut, owner net
5. Save → Updates center revenue ledger + teacher earnings ledger

---

### 4.6 Revenue Tracking

**Purpose:** Real-time revenue visibility per entity, per teacher, per time period.

#### Revenue Sources Tracked
| Source | Entity | Calculation Basis |
|---|---|---|
| Session revenue | Centers | students × price |
| Studio bookings | Studio | hourly rate / package |
| Mobile service jobs | Mobile Service | per job rate |
| In-center services | In-Center Service | per service |
| Company revenue | Company | manual entry or invoice |

#### Views
- **Daily View**: all sessions today, total collected
- **Weekly View**: sessions + revenue per day of week
- **Monthly View**: full breakdown by teacher, by center
- **Annual View**: month-by-month comparison

#### Features
- Revenue calendar (color-coded by entity)
- Pending collection tracker (money not yet received)
- Cash vs. transferred payment split
- Revenue goal setting with progress bar

---

### 4.7 Salary & Payroll

**Purpose:** Automated salary calculation and payment tracking for all teachers and staff.

#### Payroll Workflow
```
Monthly Payroll Cycle:
1. System auto-calculates each teacher's salary based on session records
2. Owner reviews the payroll sheet
3. Mark payments as: Paid / Pending / Partial
4. Generate salary slips
5. Lock the month (can't edit past payroll)
```

#### Payroll Sheet Columns
- Teacher Name
- Sessions Count
- Total Students Served
- Gross Revenue Generated
- Salary Due (calculated)
- Deductions (if any)
- Net Salary
- Payment Status
- Payment Date
- Payment Method (Cash / Transfer)

#### Additional Staff Salaries
- Non-teacher staff (e.g., center admin, receptionist)
- Fixed monthly salary entry
- Tracked per center

---

### 4.8 Personal Financial Management

**Purpose:** Manage the owner's personal financial obligations completely separate from business.

#### Sub-modules

##### 4.8.1 Installments (أقساط)
| Field | Description |
|---|---|
| Item Name | e.g., "سيارة", "شقة", "لابتوب" |
| Total Amount | Full loan/purchase amount |
| Monthly Installment | Amount due per month |
| Start Date | First payment date |
| Duration (months) | Total number of installments |
| Paid Count | How many paid so far |
| Remaining Amount | Auto-calculated |
| Due Day | Day of month payment is due |
| Status | Active / Completed / Delayed |
| Alert | Days-before reminder setting |

##### 4.8.2 Gam3eyya (جمعية)
| Field | Description |
|---|---|
| Group Name | Name or identifier of the gam3eyya |
| Total Members | Number of participants |
| Monthly Contribution | Amount paid per month |
| My Round Number | Which round the owner receives |
| Estimated Receipt Date | Calculated from start + round number |
| Total Payout | `monthly × members` |
| Status | Active / Completed |
| Members List | Optional: names for tracking |

##### 4.8.3 Subscriptions (اشتراكات)
| Field | Description |
|---|---|
| Service Name | e.g., "Netflix", "Adobe", "Internet" |
| Amount | Monthly / yearly fee |
| Billing Cycle | Monthly / Yearly / Custom |
| Next Due Date | Calculated |
| Category | Personal / Business |
| Auto-Renew | Yes / No |
| Notes | |

##### 4.8.4 Personal Cash Flow
- Monthly personal income entry (salary from business, etc.)
- Monthly personal expense summary
- Net personal position

---

### 4.9 Company Financials

**Purpose:** Track the partner company as a separate financial entity inside the same system.

#### Features
- Company revenue log (manual entries or import)
- Company expense log
- Company payroll (separate from centers)
- Company monthly P&L
- Shared cost allocation: if company and center share an expense, split tracking

---

### 4.10 Photography Studio Module

**Purpose:** Manage bookings and revenue for the dedicated recording/streaming studio.

#### Booking Types
- **Hourly Booking**: Teacher books by the hour
- **Package Booking**: Half-day / Full-day / Monthly packages
- **Center Teacher**: Free or discounted rate for in-house teachers

#### Booking Record
| Field | Description |
|---|---|
| Teacher/Client | Who booked |
| Date | Session date |
| Start – End Time | Studio usage window |
| Duration | Auto-calculated |
| Rate Type | Hourly / Package / Internal |
| Amount Due | Based on rate |
| Amount Paid | |
| Payment Status | Paid / Pending |
| Notes | Equipment used, setup notes |

#### Studio Expenses
- Equipment maintenance
- Consumables
- Internet / streaming costs
- Staff (if any)

#### Studio P&L
- Monthly revenue from bookings
- Monthly expenses
- Net profit

---

### 4.11 Mobile Teacher Service Module

**Purpose:** Track visits to external teachers' locations and associated revenue + costs.

#### Job Record
| Field | Description |
|---|---|
| Teacher/Client | Who requested |
| Location | Address / center name |
| Visit Date | |
| Service Provided | Description |
| Team Members | Who went |
| Transport Cost | Fuel / ride cost |
| Labor Cost | Hours × rate |
| Total Cost | |
| Amount Charged | What client pays |
| Net Profit | `charged - cost` |
| Payment Status | |

#### Features
- Visit calendar
- Cost vs. revenue per job
- Team scheduling
- Client repeat visit history

---

### 4.12 In-Center Teacher Service Module

**Purpose:** Track services provided to teachers already inside the two centers.

#### Service Types (Configurable)
- Production support
- Equipment rental
- Scheduling service
- Other custom services

#### Service Record
| Field | Description |
|---|---|
| Center | Which center |
| Teacher | Who received service |
| Service Type | From configured list |
| Date | |
| Amount Charged | |
| Notes | |
| Payment Status | |

---

### 4.13 Reports & Exports

**Purpose:** Generate professional financial reports for any entity, any period.

#### Available Reports
| Report | Description |
|---|---|
| Monthly P&L per Center | Revenue - Expenses = Net |
| Teacher Payroll Sheet | Full salary breakdown |
| Session Revenue Report | Per teacher, per period |
| Studio Booking Report | Monthly studio activity |
| Personal Finance Summary | Installments + gam3eyya + subscriptions |
| Company P&L | Full company statement |
| Cash Flow Statement | All entities combined |
| Outstanding Payments | Unpaid sessions/services |

#### Export Formats
- PDF (print-ready, with branding logo + colors)
- Excel / CSV (raw data)
- In-app view (interactive table)

#### Report Features
- Date range selection
- Entity filter
- Language selection for export (Arabic / English)
- Custom header (uses white-label branding)

---

## 5. UI/UX Requirements

### Layout & Navigation

```
┌──────────────────────────────────────────────────────┐
│ [Logo] [App Name]          [🌙 Dark] [🌐 AR/EN] [⚙️] │
├────────────────┬─────────────────────────────────────┤
│                │                                      │
│  Sidebar Nav   │         Main Content Area            │
│                │                                      │
│  🏠 Dashboard  │                                      │
│  🏫 Centers    │                                      │
│  👨‍🏫 Teachers  │                                      │
│  📚 Sessions   │                                      │
│  💰 Revenue    │                                      │
│  💸 Payroll    │                                      │
│  📷 Studio     │                                      │
│  🚗 Mobile Svc │                                      │
│  🏢 Company    │                                      │
│  👤 Personal   │                                      │
│  📊 Reports    │                                      │
│  ⚙️ Settings   │                                      │
│                │                                      │
└────────────────┴─────────────────────────────────────┘
```

### RTL / LTR Support
- Full RTL layout when Arabic is selected
- Sidebar flips to right side
- Text alignment, icons, and navigation reverse
- Tables and forms adapt direction
- Implemented via `react-i18next` + Tailwind `dir` attribute

### Dark / Light Mode
- Toggle in top bar
- Preference saved to `branding.json`
- All components use CSS variables for colors (no hardcoded hex)
- Dark mode: deep grays, no pure black
- Light mode: clean whites, subtle shadows

### Responsive Design
- Minimum width: 900px (desktop target)
- Sidebar collapses to icon-only at smaller widths
- Tables scroll horizontally on narrow screens
- All modals/dialogs max-width constrained and centered
- Fluid typography (clamp-based)

### Component Library Conventions
- All buttons: rounded, with hover + focus states
- Forms: labeled inputs, inline validation, Arabic error messages
- Tables: striped rows, sticky header, pagination (50 rows/page)
- Cards: shadow, hover lift effect
- Charts: Recharts library, themed to match accent color
- Empty states: illustrated with action CTA

---

## 6. Data Models

### Entity: `Center`
```typescript
interface Center {
  id: string;                   // UUID
  name: { ar: string; en: string };
  address: string;
  phone: string;
  rentAmount: number;
  rentDueDay: number;           // Day of month (1-31)
  landlordName: string;
  landlordPhone: string;
  createdAt: Date;
  isActive: boolean;
}
```

### Entity: `Teacher`
```typescript
interface Teacher {
  id: string;
  name: { ar: string; en: string };
  phone: string;
  subject: string;
  centerId: string[];           // Can belong to multiple centers
  serviceType: 'in-center' | 'studio' | 'mobile' | 'multiple';
  salaryType: 'fixed' | 'per-session' | 'revenue-share';
  fixedSalary?: number;
  perSessionRate?: number;
  revenueSharePercent?: number; // Owner takes X%
  status: 'active' | 'inactive';
  createdAt: Date;
}
```

### Entity: `Session`
```typescript
interface Session {
  id: string;
  centerId: string;
  teacherId: string;
  date: Date;
  startTime: string;
  durationMinutes: number;
  subject: string;
  studentCount: number;
  pricePerStudent: number;
  totalRevenue: number;         // Computed: studentCount × pricePerStudent
  teacherEarning: number;       // Computed based on salary type
  ownerNet: number;             // totalRevenue - teacherEarning
  paymentStatus: 'collected' | 'pending';
  collectedAt?: Date;
  notes?: string;
  createdAt: Date;
}
```

### Entity: `Installment`
```typescript
interface Installment {
  id: string;
  itemName: { ar: string; en: string };
  totalAmount: number;
  monthlyAmount: number;
  startDate: Date;
  durationMonths: number;
  paidCount: number;
  remainingAmount: number;      // Computed
  dueDayOfMonth: number;
  alertDaysBefore: number;
  status: 'active' | 'completed' | 'delayed';
  payments: InstallmentPayment[];
}

interface InstallmentPayment {
  date: Date;
  amount: number;
  method: 'cash' | 'transfer';
  notes?: string;
}
```

### Entity: `Gam3eyya`
```typescript
interface Gam3eyya {
  id: string;
  groupName: string;
  totalMembers: number;
  monthlyContribution: number;
  myRoundNumber: number;
  startDate: Date;
  estimatedReceiptDate: Date;   // Computed
  totalPayout: number;          // Computed: monthly × members
  status: 'active' | 'completed';
  notes?: string;
}
```

### Entity: `StudioBooking`
```typescript
interface StudioBooking {
  id: string;
  clientName: string;
  clientType: 'external' | 'center-teacher';
  date: Date;
  startTime: string;
  endTime: string;
  durationHours: number;        // Computed
  rateType: 'hourly' | 'half-day' | 'full-day' | 'internal';
  rateAmount: number;
  totalCharged: number;
  amountPaid: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
  notes?: string;
}
```

### Entity: `SyncLog`
```typescript
interface SyncLog {
  id: string;
  entity: string;               // Which table/collection
  operation: 'create' | 'update' | 'delete';
  recordId: string;
  timestamp: Date;
  syncedAt?: Date;
  status: 'pending' | 'synced' | 'failed';
}
```

---

## 7. Technology Stack Details

### Frontend (Renderer Process)
| Package | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| react-i18next | latest | AR/EN i18n + RTL |
| Recharts | latest | Charts & graphs |
| Zustand | latest | State management |
| React Router | 6.x | In-app navigation |
| React Hook Form | latest | Form management |
| Zod | latest | Validation schemas |
| date-fns | latest | Date manipulation |
| Lucide React | latest | Icons |

### Backend (Main Process)
| Package | Version | Purpose |
|---|---|---|
| Electron | 29.x | Desktop shell |
| better-sqlite3 | latest | Local SQLite DB |
| Mongoose | latest | MongoDB ODM |
| electron-store | latest | Config persistence |
| node-cron | latest | Scheduled alerts |
| electron-updater | latest | Auto-updates |
| pdfkit | latest | PDF generation |
| exceljs | latest | Excel export |

### Build & Dev Tools
| Tool | Purpose |
|---|---|
| Vite + electron-vite | Fast builds |
| ESLint + Prettier | Code quality |
| electron-builder | Package .exe / .dmg |

---

## 8. Sync & Offline Strategy

### Offline-First Principle
- **All data is written to SQLite first** — no network required
- App is fully functional without internet connection
- MongoDB sync happens in the background when connected

### Sync Mechanism
```
Write Operation:
  User Action → SQLite Write → SyncLog Entry (status: pending)
                                    ↓
                          Background Sync Worker
                                    ↓
                    MongoDB Write → SyncLog Update (status: synced)

Read Operation (Online):
  Pull latest from MongoDB → Merge with SQLite → Resolve conflicts

Conflict Resolution:
  - Strategy: Last-Write-Wins (timestamp-based)
  - Device ID tracked per record for audit trail
```

### Sync Status Indicators
- Green dot in header: synced
- Yellow dot: syncing in progress
- Red dot: offline / sync failed
- Sync log viewable in Settings → Sync

---

## 9. Phased Implementation Plan

### Phase 1 — Foundation (Weeks 1–3)
- [ ] Electron + Vite + TypeScript project setup
- [ ] Tailwind CSS + dark/light mode system
- [ ] i18n setup (AR + EN, RTL/LTR switching)
- [ ] SQLite schema creation (all tables)
- [ ] White-label config system (`branding.json`)
- [ ] Main layout: sidebar, top bar, routing

### Phase 2 — Core Business Modules (Weeks 4–7)
- [ ] Centers management (CRUD + rent ledger)
- [ ] Teachers management (CRUD + salary configuration)
- [ ] Session entry form + session list
- [ ] Revenue auto-calculation engine
- [ ] Dashboard with basic KPI widgets

### Phase 3 — Financial Modules (Weeks 8–10)
- [ ] Payroll module (monthly calculation + payment tracking)
- [ ] Personal: Installments module
- [ ] Personal: Gam3eyya module
- [ ] Personal: Subscriptions module
- [ ] Company financials (basic P&L)

### Phase 4 — Service Line Modules (Weeks 11–13)
- [ ] Photography Studio booking system
- [ ] Mobile Teacher Service job tracker
- [ ] In-Center Teacher Service tracker

### Phase 5 — Reports & Sync (Weeks 14–16)
- [ ] All report types (PDF + Excel export)
- [ ] MongoDB Atlas connection + sync engine
- [ ] Sync status indicators + conflict resolution
- [ ] Alert system (rent due, installment due, gam3eyya round)

### Phase 6 — Polish & Release (Weeks 17–18)
- [ ] electron-builder packaging (Windows .exe + macOS .dmg)
- [ ] App icon system + white-label icon swap
- [ ] Full RTL QA pass
- [ ] Performance optimization
- [ ] User guide / onboarding screen

---

## 10. Non-Functional Requirements

### Performance
- App launch: < 3 seconds on mid-range hardware
- Session entry save: < 200ms response
- Report generation (1 month): < 5 seconds
- Sync operation: non-blocking (background thread)

### Security
- Local SQLite encrypted at rest (SQLCipher optional in v2)
- MongoDB connection via TLS
- No plaintext passwords stored
- branding.json not exposed to renderer directly

### Reliability
- Zero data loss: all writes confirmed to SQLite before UI updates
- Crash recovery: unsaved session drafts auto-saved every 30s
- Export fallback: if PDF fails, CSV always available

### Localization
- All UI strings externalized to `ar.json` / `en.json`
- Date formats: Hijri support optional (Gregorian default)
- Number formatting: Arabic-Indic numerals optional
- Currency: EGP (ج.م) displayed correctly in both languages

### Packaging
- Windows: `.exe` NSIS installer, signed
- macOS: `.dmg` + `.app`, notarized
- Auto-update: electron-updater via GitHub Releases or custom server
- Minimum OS: Windows 10, macOS 12 Monterey

---

## Appendix A — Screen List

| Screen ID | Screen Name (EN) | Screen Name (AR) |
|---|---|---|
| SCR-001 | Dashboard | لوحة التحكم |
| SCR-002 | Centers List | قائمة السناتر |
| SCR-003 | Center Detail | تفاصيل السنتر |
| SCR-004 | Teachers List | قائمة المدرسين |
| SCR-005 | Teacher Profile | ملف المدرس |
| SCR-006 | New Session | حصة جديدة |
| SCR-007 | Sessions Log | سجل الحصص |
| SCR-008 | Revenue Overview | نظرة عامة على الإيرادات |
| SCR-009 | Monthly Payroll | مسير الرواتب الشهري |
| SCR-010 | Studio Bookings | حجوزات الستوديو |
| SCR-011 | Mobile Service Jobs | وظائف الخدمة المتنقلة |
| SCR-012 | In-Center Services | خدمات داخل السنتر |
| SCR-013 | Company Financials | ماليات الشركة |
| SCR-014 | Personal: Installments | الأقساط الشخصية |
| SCR-015 | Personal: Gam3eyya | الجمعية |
| SCR-016 | Personal: Subscriptions | الاشتراكات |
| SCR-017 | Reports | التقارير |
| SCR-018 | Settings: General | الإعدادات العامة |
| SCR-019 | Settings: Branding | إعدادات البراندينج |
| SCR-020 | Settings: Sync | إعدادات المزامنة |

---

## Appendix B — Alerts & Notifications System

| Alert Type | Trigger | Timing |
|---|---|---|
| Rent Due | Center rent due date approaching | 7 days before, 3 days before, on due date |
| Installment Due | Personal installment due date | 5 days before, on due date |
| Gam3eyya Round | Owner's round approaching | 30 days before |
| Subscription Renewal | Subscription renewal date | 7 days before |
| Sync Failed | MongoDB sync error | Immediately |
| Payroll Ready | All sessions entered for month | Configurable (e.g., 25th of each month) |

Alerts displayed as:
- In-app notification bell (badge count)
- System tray notification (desktop OS notification)
- Alert log page in Settings

---

*Document maintained by the owner. Last updated: June 2026.*
*System codename: **EduPro Desktop***