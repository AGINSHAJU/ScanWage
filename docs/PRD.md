# PRD: ScanWage Pro

## 1. Product Overview

**Product Name:** ScanWage Pro
**Tagline:** Track scan productivity and calculate employee salaries automatically.
**Document Version:** 1.0
**Prepared For:** Internal Development Team
**Prepared By:** ChatGPT
**Date:** May 14, 2026

---

# 2. Problem Statement

Organizations that pay employees based on the number of scans completed currently perform salary calculations manually. This process is time-consuming and prone to errors.

The company uses the following salary formula:
1. Divide the total number of scans by **2250**.
2. Multiply the result by **800**.
3. Divide the result by **2**.
4. The final value is the salary for one employee.

### Formula
Salary per Employee = ((Total Scans / 2250) × 800) / 2
This simplifies to:
Salary per Employee = (Total Scans × 400) / 2250

---

# 3. Product Goal

Develop a web and mobile-friendly application that:
* Tracks daily scans
* Calculates remaining scans to meet monthly targets
* Calculates salary automatically for each employee
* Supports multiple employees
* Generates reports
* Exports data to PDF and Excel

---

# 4. Target Users

### Primary Users
* Team Leaders
* Operations Managers
* HR Executives
* Employees

### Secondary Users
* Finance Team
* Payroll Team

---

# 5. Business Rules

## Monthly Target Rules
* Standard scans per day: **2250** scans
* Working days exclude Sundays
* Monthly target = Working Days × 2250

## Salary Rules
### Per Employee Salary Formula
((Total Scans / 2250) × 800) / 2

### Example
Total Scans = 58,500
* 58,500 / 2250 = 26
* 26 × 800 = 20,800
* 20,800 / 2 = 10,400

**Salary per Employee = ₹10,400** (assuming two employees share the total output)

---

# 6. Core Features

## 6.1 Dashboard
Displays:
* Current month
* Working days (excluding Sundays)
* Total target scans
* Completed scans
* Remaining scans
* Required scans per day
* Salary estimate per employee
* Progress percentage

## 6.2 Daily Scan Entry
Users can enter:
* Date
* Employee Name
* Number of scans completed
* Notes (optional)

## 6.3 Salary Calculator
Automatically calculates:
* Total scans
* Salary per employee
* Total payout

## 6.4 Employee Management
Add, edit, and delete employees.
Fields:
* Employee Name
* Employee ID
* Role
* Active Status

## 6.5 Reports
Generate:
* Daily report
* Weekly report
* Monthly report
* Employee-wise report

## 6.6 Export Options
* PDF
* Excel
* CSV

## 6.7 Authentication
Roles:
* Admin
* Manager
* Employee

---

# 7. Functional Requirements
* **FR-1 Login System**: Users can log in using email and password.
* **FR-2 Create Employees**: Admin can create employee profiles.
* **FR-3 Enter Daily Scans**: Manager can input scan counts.
* **FR-4 Auto Monthly Target Calculation**: System excludes Sundays automatically.
* **FR-5 Salary Calculation**: System calculates salary instantly using the defined formula.
* **FR-6 Progress Tracking**: System shows target vs actual performance.
* **FR-7 Export Reports**: Reports can be downloaded.
* **FR-8 Notifications**: Alerts when performance is below target.

---

# 8. Non-Functional Requirements
* Responsive design for desktop and mobile
* Data encryption
* Fast calculations (<1 second)
* 99.9% uptime
* Backup and restore support

---

# 9. User Stories
* **As a Manager**: I want to enter today's scan count so that I can track productivity.
* **As an HR Executive**: I want salaries calculated automatically so that payroll is accurate.
* **As an Employee**: I want to see my estimated salary and progress.
* **As an Admin**: I want to export reports for payroll processing.

---

# 10. Screen Specifications
* **Login Screen**: Email, Password, Sign In
* **Dashboard Screen**: KPI cards, Progress bar, Charts
* **Scan Entry Screen**: Date selector, Employee dropdown, Scan count input, Save button
* **Salary Screen**: Total scans, Formula breakdown, Salary output
* **Reports Screen**: Filters, Export buttons

---

# 11. Database Schema
* **Users**: id, name, email, password_hash, role
* **Employees**: id, employee_id, name, role, status
* **ScanEntries**: id, employee_id, date, scan_count, notes
* **SalaryRecords**: id, month, total_scans, salary_per_employee, total_payout

---

## 12. Technology Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Python Django (with Django REST Framework)
- Database: SQLite (Development) / PostgreSQL (Production)
- Authentication: JWT (JSON Web Tokens)
- Hosting:
  - Frontend: Netlify
  - Backend: Render or Railway
  - Database: PostgreSQL

# 13. Salary Calculation Logic
```javascript
function calculateSalary(totalScans) {
  return ((totalScans / 2250) * 800) / 2;
}
```

---

# 14. Example Calculation
Input:
* Total Scans: 20,060

Calculation:
* 20,060 / 2,250 = 8.9156
* 8.9156 × 800 = 7,132.48
* 7,132.48 / 2 = 3,566.24

Output:
* Salary per Employee = **₹3,566.24** (if two employees share the total output)

---

# 15. MVP Scope
The first version should include:
* Login
* Employee Management
* Daily Scan Entry
* Salary Calculator
* Dashboard
* Monthly Reports

---

# 16. Future Enhancements
* Android App
* Biometric Attendance Integration
* WhatsApp Salary Reports
* Cloud Backup
* AI Productivity Insights

---

# 17. Success Metrics
* Reduce salary calculation time by 90%
* Eliminate manual calculation errors
* Generate payroll reports in under 1 minute
* Increase productivity visibility

---

# 18. Recommended Development Timeline
* UI/UX Design: 1 week
* Frontend Development: 2 weeks
* Backend Development: 2 weeks
* Testing: 1 week
* Deployment: 2 days

**Total Estimated Time: 6-7 weeks**

---

# 19. Suggested Project Structure
```text
scanwage-pro/
├── frontend/
├── backend/
├── database/
├── docs/
└── reports/
```

---

# 20. Final Recommendation
Build **ScanWage Pro** as a web application first, with a responsive design that works well on desktop and mobile. This allows managers and HR teams to begin using the system immediately, with an Android application added later if needed.

---

# 21. Quick Formula Reference
Salary per Employee = (((Total Scans) / 2250) * 800) / 2

---

# 22. Optional Features You May Want
* Daily target tracker
* Remaining scans calculator
* Incentive calculator
* Attendance integration
* Multi-team support
