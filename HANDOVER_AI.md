# Dompetku-App: Project Handover & Context for AI

## 1. Project Overview
**Dompetku-App** is a personal finance and wealth management web application. It goes beyond basic expense tracking by including Debt/Installment management and a fully functional Investment Portfolio tracker (Mark-to-Market system).
- **Target Audience:** Personal use (specifically tailored for users who manage daily expenses, debts, and active trading/investments).
- **Current Deployment:** Vercel (Web).
- **Future Goal:** Mobile-First Web App / Native Mobile App (via Capacitor/React Native).

## 2. Tech Stack
- **Frontend:** React.js (v19)
- **Styling:** Tailwind CSS
- **Icons:** `lucide-react`
- **Database / Backend:** Firebase (Firestore)
- **Deployment:** Vercel
- **Package Manager:** pnpm

## 3. Core Features (Currently Implemented)
1. **Dashboard (Beranda):**
   - Calculates Total Net Worth (Total Kekayaan Bersih).
   - Separates Total Kas (Liquid Cash) and Total Aset (Investments).
   - Monthly summary (Pemasukan & Pengeluaran).
2. **Transaction Management:**
   - Income (Pemasukan) & Expense (Pengeluaran).
   - Categorization, Wallet selection (Dompet BCA, Tunai, etc.), and Date handling.
3. **Debt & Installment (Utang & Cicilan):**
   - Track debts and monthly installment payments.
4. **Wealth Management (Investasi):**
   - Create custom portfolios (e.g., Trading Crypto, Saham).
   - **Top Up:** Move cash to portfolio.
   - **Tarik Dana:** Move money back to cash.
   - **Update Harga (Mark-to-Market):** Manually update the current value of the portfolio to track Floating Profit/Loss (ROI).
5. **Reporting (Laporan):**
   - Monthly and Yearly filtering.
   - Categorized breakdowns and charts.
6. **Data Management (Pengaturan):**
   - Export to CSV.
   - Import/Restore from CSV.
   - Reset Data & Generate Dummy Data.

## 4. Current Architecture & "Technical Debt" (CRITICAL FOR AI)
**Status:** The application currently operates as a **Monolith** within a single `App.js` file (~1,500 lines of code).
- **State Management:** Uses dozens of `useState` and `useMemo` hooks inside the main component.
- **Firebase Logic:** CRUD operations directly embedded inside UI components.
- **UI Rendering:** Uses large render functions (`renderHomeView`, `renderReportView`, `renderInvestasiView`) instead of separate React components.

## 5. Roadmap & Immediate Next Steps (Action Plan)
The user explicitly wants to **refactor and optimize** the codebase before migrating to a Mobile App architecture or adding new features (like Desktop-specific UI). 

**Phase 1: Refactoring (Urgent)**
The AI must guide the user to break down the monolithic `App.js` into a scalable directory structure:
1. **Extract UI Components:** Move `renderHomeView`, `renderInvestasiView`, Modals, and Navigation into separate files (e.g., `src/components/...`).
2. **Extract Firebase Logic:** Create a service layer (e.g., `src/services/firebase.js` or custom hooks like `useTransactions.js`).
3. **State Management Optimization:** Consolidate states (consider Context API, Zustand, or simple custom hooks) to prevent memory leaks and prop drilling.

**Phase 2: Mobile Optimization**
- Ensure the UI feels like a Native App on mobile browsers (Mobile-Centered Web design).
- Prepare the architecture so it can be easily wrapped by Capacitor or migrated to React Native/Expo in the future.

## 6. Rules for the AI Assistant
1. **DO NOT add massive new features** right now. Focus on the Refactoring Roadmap (Phase 1).
2. **Avoid breaking the current logic.** The current math for Net Worth (Kas + Aset) and the Investment Profit/Loss logic is working perfectly. Preserve this logic during refactoring.
3. When providing code, **provide step-by-step modularization** rather than one giant refactored file, to avoid Vercel build errors.
4. **Language:** Communicate with the user in casual, professional Indonesian (e.g., use "Bro", "Aku", "Kamu").

---
**Note to AI:** When the user initiates the chat, ask them to provide the current `App.js` file, and begin planning the execution of **Phase 1: Refactoring**.