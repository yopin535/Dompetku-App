# AI Activity Log — Dompetku-App

> File ini WAJIB dibaca AI apa pun sebelum menyentuh repo ini.
> Update file ini setiap selesai sesi kerja (tambah entri baru di tabel Riwayat, update Status Fase & Next Tasks).
> Bahasa: Indonesia santai-profesional. Owner: Yopi.

## 1. Keadaan Repo (per 13 Sep 2026)

- Branch aktif: `develop`. Refactor refactor sedang berjalan di working tree, siap commit per fase.
- **Belum ada satu pun commit refactoring.** Semua pekerjaan masih berupa perubahan working-tree yang belum di-commit di branch `develop`.
- `npm run build` terakhir: **Compiled successfully**.
- Dev server: `npm start` → http://localhost:3000 (pakai `.env.development`).
- Stack: React 19 + react-scripts 5 + Firebase 12.9 + lucide-react + Tailwind v3 PostCSS (38KB bundle, CDN sudah dihapus).

## 2. Yang Sudah Dikerjakan AI Sebelumnya

1. **Branching**: membuat `production` (snapshot program jalan) dan `develop` (area kerja) dari `main`, push ketiganya ke GitHub.
2. **Pemisahan env Firebase**: membuat `.env.development` (project `dompetku-dev-14774`) dan `.env.production` (project `dompetku-app-a98c9`). `src/config/firebase.js` baca `process.env.REACT_APP_*` dengan fallback ke config production. `.gitignore` sudah mengecualikan `.env*` (kecuali `.env.example`).
3. **Auth fix**: error `auth/configuration-not-found` = Anonymous provider belum aktif di Firebase Console project dev. Solusi: aktifkan Anonymous di Console → user konfirmasi login/demo sudah bisa jalan.
4. **Service layer**: `src/services/firebaseService.js` (CRUD transactions/wallets/categories/portfolios + reset + subscribe) dan `src/services/dummyService.js` (generate dummy data, sudah verified jalan).
5. **Utils**: `src/utils/formatters.js` (`formatCurrency`, `getCurrentDate`, `CURRENCIES`, kategori default).
6. **State layer (dibuat, BELUM dipakai)**: `src/context/AppContext.js` (`AppProvider` + `useApp`, ~50 state) dan hooks `useTransactions`, `useInvestments`, `useWallets`, `useCategories`.
7. **Komponen (dibuat, SEBAGIAN dipakai)**: common (Button/Input/Modal/Card/Notification), layout (Header, WalletCard), specific (TransactionRow), 9 file modals, pages (HomePage, InvestasiPage, ReportPage).
8. **Integrasi parsial ke `src/App.js`**: import config/formatters, 1× `WalletCard`, 1× `<HomePage />`, 3 modal (`DummyModal`, `ResetModal`, `WalletModal`).
9. **Warning browser**: Tailwind CDN (abaikan di dev), `manifest.json` (sudah dibuat minimal di `public/manifest.json`), key-prop warning (semua `map()` sudah punya key).

## 3. Status Fase (jujur, bukan klaim selesai)

- [100%] Phase 1 Architecture & SoC — SELESAI. Struktur folder + env + service layer + utils jadi; `App.js` 2539 → 1224 baris, 0 Firebase inline, 0 `useState`.
- [100%] Phase 2 State & Hooks — SELESAI. `AppProvider` terpasang, 0 `useState`, `useTransactions` dipakai penuh, dan **seluruh Firestore inline dihapus** (listener + 21 call CRUD via `firebaseService`). Import Firebase mentah dibersihkan. `App.js` 1468 → 1275 baris.
- [~75%] Phase 3 Modularisasi — terpasang di `App.js`: `WalletCard`, `WalletStrip`, `Header`, `TransactionRow`, `TransactionForm`, `TransactionList`, `HomePage`, 9 modal prop-driven, `ReportPage`, `InvestasiPage`, `SettingsPage`. `App.js` turun 2539 → 1224 baris; render inline habis, 0 `useState`, 0 Firebase inline.
- [~95%] Phase 4 Security & Env hardening — SELESAI di repo: `.env.example` + `firestore.rules` per-UID, secret dihapus (throw bila env hilang), Tailwind CDN → PostCSS (38KB), `ErrorBoundary` di root, `SkeletonHome` saat loading awal. Sisa manual: deploy rules ke Firebase Console.

## 4. ⚠️ KRITIS — Baca Sebelum Coding

1. Provider sudah terpasang (`App` → `AppProvider` + `AppContent`). Komponen lama yang masih pakai `useApp()` langsung (`Header.jsx`, `TransactionRow.jsx`, `HomePage.jsx`, modals lama, `WalletCard.jsx`) sudah diganti versi prop-driven — jangan kembalikan ke versi `useApp()` tanpa provider.
2. **JANGAN commit file sensitif.** `.env.development` / `.env.production` berisi API key asli dan sudah di-`gitignore`. Jangan `git add -f`, jangan print isinya ke log/chat.
3. **Sampah working-tree** (jangan commit): `build/`, `npm.log` sudah dihapus dan di-`gitignore`. `pnpm-workspace.yaml` dibutuhkan pnpm (allowBuilds) — biarkan untracked, jangan hapus. `pnpm-lock.yaml` berubah besar karena dep Tailwind baru — wajar, ikut commit.
4. Test wajib tiap perubahan: `npm run build` harus `Compiled successfully`; cek http://localhost:3000 + Console browser (F12).

## 5. Next Tasks (urut prioritas)

1. **P4 — Commit & push**: commit per fase di `develop` (lihat riwayat), verifikasi `git status` bersih dari secret, baru push.
2. **Manual Console**: deploy `firestore.rules`; pastikan Anonymous + Google provider aktif di project dev & prod.
3. **Follow-up opsional**: `useWallets`/`useInvestments`/`useCategories` sudah dipakai di handler; `Notification.jsx`/`Modal.jsx`/`Button.jsx`/`Input.jsx`/`Card.jsx` belum dipakai — pakai atau hapus biar tak jadi dead code.

## 6. Riwayat Sesi

| Tanggal (UTC) | Pelaku | Ringkasan |
|---|---|---|
| 2026-09-13 | AI (multi-sesi, campur) | Buat branch `production`+`develop`; setup `.env.development`/`.env.production`; buat config/services/utils/context/hooks/components/pages; fix auth Anonymous; fix + verifikasi dummy data; integrasi parsial App.js (WalletCard, HomePage, 3 modal). Semua belum di-commit. |
| 2026-09-13 | opencode (sesi ini) | Audit working-tree vs git; menulis `AI_ACTIVITY_LOG.md` ini. Tidak mengubah kode app. |
| 2026-09-13 | opencode (lanjutan) | P0 aman: cabut `<HomePage />` tanpa provider, kabelkan `WalletModal`/`ResetModal`/`DummyModal` via props, buang import modal tak terpakai. `npm run build`: Compiled successfully. |
| 2026-09-13 | opencode (lanjutan) | Pasang 6 modal prop-driven tersisa (`Category`, `Installment`, `Portfolio`, `InvestAction`, `ItemCategory`, `Debt`). Total 9/9 modal terintegrasi. `npm run build`: Compiled successfully. |
| 2026-09-13 | opencode (lanjutan) | Pasang `Header` + `TransactionRow` prop-driven, hapus `renderHeader` inline dan loop kartu transaksi inline. `npm run build`: Compiled successfully. |
| 2026-09-13 | opencode (lanjutan) | Ekstrak `WalletStrip`, `TransactionForm`, `TransactionList`, `ReportPage`, `InvestasiPage`, `SettingsPage`, delegasikan `renderHomeView`. `App.js` 2539 → ~1600 baris. `npm run build`: Compiled successfully. |
| 2026-09-13 | opencode (lanjutan) | Ekstrak shell `AppBanner`, `LoadingOverlay`, `Toast`, `FilterSheet`, `ImagePreview`, `BottomNav`; render `App.js` tinggal komposisi komponen. `npm run build`: Compiled successfully. |
| 2026-09-13 | opencode (lanjutan) | P1 pilot: pasang `AppProvider` (`App` → `AppContent` + wrapper), migrasi slice `view`/`setView` ke context. Build + dev server HTTP 200 OK. |
| 2026-09-13 | opencode (lanjutan) | Migrasi slice `loading`/`notification`/`syncStatus` ke context. Build + dev server HTTP 200 OK, tanpa error compile. |
| 2026-09-13 | opencode (lanjutan) | Migrasi penuh state `AppContent` → context (data, settings, modal, form, report). `useState` 0 sisa. Build + dev server HTTP 200 OK. |
| 2026-09-13 | opencode (lanjutan) | Ganti seluruh kalkulasi inline dengan `useTransactions` (categories, balances, totals, debts, filter/grouping, expand, month nav). `App.js` → ~1300 baris. Build + dev server HTTP 200 OK. |
| 2026-09-13 | opencode (lanjutan) | Migrasi Firestore → `firebaseService` (subscribe + 21 CRUD, reset batch). Hapus import Firebase mentah. Phase 2 SELESAI. `App.js` → 1275 baris. Build + dev HTTP 200 OK. |
| 2026-09-13 | opencode (lanjutan) | Phase 4: buat `.env.example` + `firestore.rules` per-UID, hapus hardcoded secret (throw bila env hilang). `.env.*` verified tak ter-track. Build OK. |
| 2026-09-13 | opencode (lanjutan) | Tailwind CDN → PostCSS (tailwind@3 + autoprefixer, `index.css`, hapus CDN script, hapus `styles.css`). CSS bundle 38KB. Build + dev HTTP 200 OK. |
| 2026-09-13 | opencode (lanjutan) | Phase 4 final repo: `ErrorBoundary` di root + `SkeletonHome` saat loading awal. Build + dev HTTP 200 OK. |
| 2026-09-13 | opencode (lanjutan) | Cleanup refactor: hapus duplikasi `getCurrentDate`/`currencies`/kategori, pakai `useWallets`/`useCategories`/`useInvestments` di handler, hapus 5 import tak terpakai. `App.js` → 1229 baris. Build OK. |
| 2026-09-13 | opencode (lanjutan) | Inline `renderHomeView` terakhir, rapikan `.gitignore` (build/npm.log), hapus sampah tree. `App.js` → 1224 baris. Build OK. Siap commit per fase. |

## 7. Aturan Untuk AI Berikutnya

1. Baca file ini + `HANDOVER_AI.md` dulu sebelum kerja.
2. Kerja di branch `develop`. Jangan commit ke `main`/`production` tanpa perintah Yopi. Jangan push tanpa diminta.
3. Jangan pernah commit `.env*` berisi secret. Boleh buat/update `.env.example` (tanpa nilai asli).
4. Setiap sesi: update tabel Riwayat + Status Fase + Next Tasks di file ini.
5. Satu perubahan besar = satu langkah + minta konfirmasi Yopi (aturan engagement tetap berlaku).
