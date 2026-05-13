# RoomSync Booking System

Sistem manajemen pemesanan ruangan dan fasilitas berbasis web dengan fitur notifikasi real-time, integrasi Google Calendar, dan kontrol akses berbasis peran (role-based access control).

---

## Daftar Isi

- [Tech Stack](#tech-stack)
- [Fitur](#fitur)
- [Arsitektur](#arsitektur)
- [Prasyarat](#prasyarat)
- [Instalasi & Setup](#instalasi--setup)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Seeder](#seeder)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Git Workflow](#git-workflow)
- [Environment Variables](#environment-variables)
- [Keamanan](#keamanan)
- [Struktur Proyek](#struktur-proyek)

---

## Tech Stack

### Backend
| Teknologi | Versi | Kegunaan |
|---|---|---|
| Node.js | 22 | Runtime |
| Express | 5.x | Web framework |
| Drizzle ORM | — | Database ORM |
| MySQL | 8 | Database |
| JWT (jsonwebtoken) | — | Authentication |
| bcryptjs | — | Password hashing |
| Joi | — | Validasi input |
| Google APIs | — | Integrasi Google Calendar |
| Multer | — | Upload file |
| Helmet | — | Keamanan HTTP headers |
| express-rate-limit | 8.x | Rate limiting |
| Swagger | — | API documentation |
| Morgan | — | HTTP request logging |

### Frontend
| Teknologi | Versi | Kegunaan |
|---|---|---|
| React | 19 | UI library |
| TypeScript | 6.x | Type safety |
| Vite | 6.x | Bundler |
| HeroUI | v3 | Component library |
| Tailwind CSS | v4 | Utility CSS |
| React Router | v6 | Routing |
| Axios | — | HTTP client |
| Framer Motion | — | Animasi |
| Lucide React | — | Icons |
| next-themes | — | Dark/light mode |

---

## Fitur

### Manajemen Pengguna
- Registrasi dan login dengan validasi
- JWT access token (in-memory) + refresh token (httpOnly cookie)
- Role-based access control: ADMIN dan USER
- Profil pengguna (update nama, password)

### Manajemen Fasilitas
- CRUD fasilitas (admin)
- Upload gambar dengan validasi magic bytes
- Kapasitas, deskripsi, dan harga deposit per fasilitas

### Pemesanan (Booking)
- Buat pemesanan dengan rentang waktu
- Booking berulang (recurring) harian/mingguan
- Cek ketersediaan real-time dengan row lock (`FOR UPDATE`)
- Approve/reject booking (admin)
- Riwayat booking per user

### Pembayaran
- Deposit payment tracking
- Refund untuk booking yang dibatalkan
- Ringkasan pembayaran admin

### Kalender
- Tampilan jadwal per fasilitas
- Integrasi Google Calendar (OAuth 2.0)
- Generate link Google Calendar event
- Token Google refresh dienkripsi (AES-256-GCM)

### Notifikasi Real-time
- Server-Sent Events (SSE) untuk notifikasi langsung
- Event: booking created, approved, rejected, cancelled
- Auto-reconnect dengan delay 3 detik
- History notifikasi tersimpan di database

### UI/UX
- Dark mode / light mode
- Responsive design (mobile-first)
- Loading skeleton & error state
- Aksesibilitas (ARIA labels, roles)
- Lazy loading halaman

---

## Arsitektur

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend (React 19)                    │
│  localhost:5173 (dev) / port 80 (production via nginx)       │
│                                                              │
│  Axios ──auto-attach Bearer token──┐                         │
│  SSE   ──EventSource──────────────┐│                         │
└───────────────────────────────────││─────────────────────────┘
                                    ││
                              HTTP  ││  Server-Sent Events
                                    ││
┌───────────────────────────────────││─────────────────────────┐
│                        Backend (Express 5)                    │
│  localhost:5000                                                │
│                                                              │
│  Middleware: Helmet → CORS → Morgan → Rate Limit → Routes    │
│                                                              │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │  Auth   │  │Facilities│  │ Bookings │  │  Payments   │  │
│  │  Module │  │  Module  │  │  Module  │  │   Module    │  │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘  │
│       │            │             │                │          │
│  ┌────┴────────────┴─────────────┴────────────────┴──────┐  │
│  │                  Drizzle ORM                           │  │
│  │         MySQL Connection Pool (min:2, max:10)          │  │
│  └──────────────────────────┬─────────────────────────────┘  │
│                             │                                │
└─────────────────────────────│────────────────────────────────┘
                              │
                        ┌─────┴──────┐
                        │   MySQL 8  │
                        │ drizzle_db │
                        └────────────┘
```

---

## Prasyarat

- **Node.js** 22+
- **MySQL** 8+
- **npm**

---

## Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/Todzxx/sistem-booking.git
cd sistem-booking
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Buat file .env dari template
copy .env.example .env
# atau: cp .env.example .env
```

Edit `.env` sesuai environment kamu:
```env
PORT=5000
DB_URL="mysql://root:password@localhost:3306/drizzle_db"
JWT_SECRET="your_32_character_minimum_secret_key_here"
JWT_EXPIRES_IN="1d"
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
ENCRYPTION_KEY="your_32_byte_hex_encryption_key_here"
```

### 3. Setup Database

```bash
# Generate migration dari schema
npm run db:generate

# Jalankan migration ke MySQL
npm run db:migrate

# (Alternatif) Push langsung schema ke DB
npm run db:push

# Seed data awal (admin, user, fasilitas)
npm run db:seed
```

File seed ada di `backend/src/db/`:
- `seed.js` — 5 fasilitas
- `seed-users.js` — 2 user (admin + regular)

### 4. Setup Frontend

```bash
cd frontend
npm install

# Buat .env dari template
copy .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Menjalankan Aplikasi

### Development (Backend + Frontend)

Terminal 1 — Backend:
```bash
cd backend
npm run dev
# → http://localhost:5000
# → Health check: http://localhost:5000/health
# → Swagger UI: http://localhost:5000/api-docs
```

Terminal 2 — Frontend:
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

### Production Build

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

Atau gunakan Docker:
```bash
cd frontend
docker build -t roomsync-frontend .
docker run -p 80:80 roomsync-frontend
```

---

## Seeder

Jalankan setelah migrasi database:

```bash
cd backend
npm run db:seed
```

### Akun Default

| Email | Password | Role |
|---|---|---|
| `admin@roomsync.com` | `admin123` | ADMIN |
| `user@roomsync.com` | `user123` | USER |

### Fasilitas Default

| Nama | Kapasitas | Deposit |
|---|---|---|
| Grand Auditorium | 200 | Rp 500.000 |
| Executive Meeting Room | 12 | Rp 200.000 |
| Creative Design Studio | 15 | Rp 100.000 |
| Professional Podcast Room | 4 | Rp 50.000 |
| Collaboration Zone B | 25 | Gratis |

---

## API Documentation

### Base URL
```
Development: http://localhost:5000/api/v1
```

### Interactive Docs (Swagger)
```
http://localhost:5000/api-docs
```

### Ringkasan Endpoint

#### Auth (`/api/v1/auth`)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/register` | Public | Registrasi user baru |
| POST | `/login` | Public | Login, mengembalikan access token + refresh token cookie |
| POST | `/refresh` | Cookie | Rotasi refresh token |
| POST | `/logout` | Bearer | Logout, revoke token |
| GET | `/profile` | Bearer | Ambil profil user saat ini |
| PUT | `/profile` | Bearer | Update profil (name, password) |
| GET | `/users` | Bearer + Admin | Daftar semua user |
| PUT | `/users/:id/role` | Bearer + Admin | Update role user |

#### Fasilitas (`/api/v1/facilities`)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/` | Bearer | Daftar semua fasilitas |
| GET | `/:id` | Bearer | Detail fasilitas |
| POST | `/` | Bearer + Admin | Buat fasilitas baru |
| PUT | `/:id` | Bearer + Admin | Update fasilitas |
| DELETE | `/:id` | Bearer + Admin | Hapus fasilitas |

#### Booking (`/api/v1/bookings`)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/availability` | Bearer | Cek ketersediaan ruangan |
| POST | `/` | Bearer | Buat booking baru |
| GET | `/my-bookings` | Bearer | Booking milik user saat ini |
| GET | `/` | Bearer + Admin | Semua booking |
| PUT | `/:id/status` | Bearer + Admin | Approve/reject booking |
| DELETE | `/:id` | Bearer | Batalkan booking |

#### Pembayaran (`/api/v1/payments`)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/:bookingId/pay` | Bearer | Bayar deposit booking |
| POST | `/:bookingId/refund` | Bearer + Admin | Refund deposit |
| GET | `/summary` | Bearer + Admin | Ringkasan pembayaran |

#### Notifikasi (`/api/v1/notifications`)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/` | Bearer | Daftar notifikasi user |
| PUT | `/:id/read` | Bearer | Tandai notifikasi sudah dibaca |
| GET | `/stream` | Bearer | SSE real-time notifications |

#### Kalender (`/api/v1/calendar`)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/events/:facilityId` | Bearer | Ambil events Google Calendar |
| GET | `/auth` | Bearer | Mulai OAuth flow Google |
| GET | `/oauth/callback` | Public | OAuth callback URL |
| POST | `/events` | Bearer | Buat event Google Calendar |
| DELETE | `/events/:eventId` | Bearer | Hapus event dari Google Calendar |
| GET | `/link/:bookingId` | Bearer | Generate link Google Calendar |

### Format Response

Semua response mengikuti format standar:

**Sukses:**
```json
{
  "status": "success",
  "data": { ... }
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Deskripsi error"
}
```

---

## Testing

### Backend Tests

```bash
cd backend
npm test
```

39 test cases di 8 test suite:
- Auth (register, login, refresh, logout, profile)
- Facilities (CRUD, image upload)
- Bookings (create, concurrency, availability, approve/reject, cancel)
- Payments (deposit, refund, summary)
- Notifications (SSE stream)
- Calendar (Google Calendar integration)
- Revocation (token revocation)
- Middleware (auth middleware, role middleware)

### CI/CD

GitHub Actions di `.github/workflows/ci.yml`:
- **Backend**: Ubuntu + MySQL 8 service + Node 22 → `npm ci` + `npm test`
- **Frontend**: Ubuntu + Node 22 → `npm ci` + lint + TypeScript check + build

---

## Git Workflow

```
main ──●────────────────────●── (production)
         \                  /
develop  ─●──●──●──●──●──●── (integration)
           \  \  \  \  \
feat/*      ●  ●  ●  ●  ●   (feature branches)
fix/*       ●  ●  ●  ●  ●   (fix branches)
```

### Branch Strategy
- **`main`** — Production, hanya dari merge `develop`
- **`develop`** — Integrasi, base untuk semua feature branch
- **`feat/*`** — Fitur baru
- **`fix/*`** — Perbaikan bug

### Commit Convention
```
feat: deskripsi fitur baru
fix: deskripsi perbaikan bug
chore: tugas maintenance
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Deskripsi |
|---|---|---|---|
| `PORT` | Tidak | `5000` | Port server |
| `DB_URL` | Ya | — | MySQL connection string |
| `JWT_SECRET` | Ya | — | Secret key JWT (min 32 char) |
| `JWT_EXPIRES_IN` | Tidak | `1d` | Expiry access token |
| `NODE_ENV` | Tidak | `development` | Environment |
| `CORS_ORIGIN` | Tidak | `http://localhost:5173,http://localhost:3000` | Allowed origins |
| `ENCRYPTION_KEY` | Ya | — | Kunci AES-256 (32 byte hex) |
| `DB_POOL_MIN` | Tidak | `2` | Minimum koneksi DB pool |
| `DB_POOL_MAX` | Tidak | `10` | Maximum koneksi DB pool |
| `GOOGLE_CLIENT_ID` | Opsional | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Opsional | — | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Opsional | — | Google OAuth callback |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Deskripsi |
|---|---|---|---|
| `VITE_API_URL` | Ya | — | Base URL backend API |

---

## Keamanan

### Autentikasi
- **Password**: di-hash dengan bcryptjs (salt rounds: 10)
- **Access Token**: JWT, expiry 1 hari, disimpan di memory React (bukan localStorage)
- **Refresh Token**: httpOnly cookie, path terbatas `/api/v1/auth`, SameSite Lax (dev) / Strict (production), Secure hanya di production
- **Rotasi Token**: Setiap refresh, access token + refresh token baru; refresh token lama di-revoke
- **Revocation**: Token di-revoke dengan menyimpan `jti` di tabel `revoked_tokens`, fail-closed (jika DB error, semua token dianggap revoked)

### Proteksi API
- **Helmet**: Security HTTP headers
- **CORS**: Whitelist origin dari environment variable
- **Rate Limiting**: Global 100 req/15 menit, auth 5 req/15 menit (skip di development)
- **Input Validation**: Joi schemas untuk semua endpoint
- **Error Handling**: Operational errors vs programming errors (`AppError` class)

### Upload File
- **Multer**: Batasi ke image MIME types, max 5MB
- **Magic Bytes**: Validasi 12 byte pertama file untuk memastikan format asli (JPEG, PNG, GIF, BMP, TIFF, WebP), mencegah file renamed

### Enkripsi
- **AES-256-GCM**: Untuk data sensitif (Google refresh token)
- **Kunci enkripsi**: 32 byte hex dari `ENCRYPTION_KEY`

---

## Database Schema

5 tables dengan relasi:

### `users`
| Column | Type | Keterangan |
|---|---|---|
| id | CHAR(36) PK | UUID |
| name | VARCHAR(255) | Nama lengkap |
| email | VARCHAR(255) UNIQUE | Email login |
| password | VARCHAR(255) | Hash bcrypt |
| role | ENUM('ADMIN','USER') | Role |
| is_active | BOOLEAN | Status aktif |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

### `facilities`
| Column | Type | Keterangan |
|---|---|---|
| id | CHAR(36) PK | UUID |
| name | VARCHAR(255) | Nama fasilitas |
| description | TEXT | Deskripsi |
| capacity | INT | Kapasitas orang |
| deposit_amount | DECIMAL(15,2) | Deposit |
| image | VARCHAR(500) | Path gambar |
| is_active | BOOLEAN | Status aktif |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

### `bookings`
| Column | Type | Keterangan |
|---|---|---|
| id | CHAR(36) PK | UUID |
| user_id | CHAR(36) FK → users | Peminjam |
| facility_id | CHAR(36) FK → facilities | Fasilitas |
| start_time | DATETIME | Mulai |
| end_time | DATETIME | Selesai |
| status | ENUM | pending, approved, rejected, cancelled, completed |
| notes | TEXT | Catatan peminjaman |
| is_recurring | BOOLEAN | Booking berulang |
| recurrence_group | CHAR(36) | Group UUID untuk recurring |
| payment_status | ENUM | unpaid, paid, refunded |
| deposit_amount | DECIMAL(15,2) | Deposit |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

### `notifications`
| Column | Type | Keterangan |
|---|---|---|
| id | CHAR(36) PK | UUID |
| user_id | CHAR(36) FK → users | Penerima |
| booking_id | CHAR(36) FK → bookings | Terkait booking |
| type | VARCHAR(50) | Tipe notifikasi |
| message | TEXT | Pesan |
| is_read | BOOLEAN | Status baca |
| created_at | TIMESTAMP | Auto |

### `revoked_tokens`
| Column | Type | Keterangan |
|---|---|---|
| jti | VARCHAR(255) PK | JWT ID |
| expires_at | DATETIME | Expiry token |

---

## Struktur Proyek Lengkap

```
sistem-booking/
├── backend/
│   ├── src/
│   │   ├── index.js                    # Entry point server
│   │   ├── app.js                      # Konfigurasi Express
│   │   ├── config/
│   │   │   ├── db.js                   # Koneksi MySQL + Drizzle
│   │   │   └── swagger.js             # OpenAPI spec
│   │   ├── constants/
│   │   │   └── index.js               # ROLES, BOOKING_STATUS, PAYMENT_STATUS
│   │   ├── db/
│   │   │   ├── schema.js              # Definisi tabel Drizzle
│   │   │   ├── seed.js                # Seeder fasilitas
│   │   │   └── seed-users.js          # Seeder user
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js     # Verifikasi JWT
│   │   │   ├── role.middleware.js     # Otorisasi role
│   │   │   ├── upload.middleware.js   # Upload file (Multer)
│   │   │   └── imageMagicBytes.js     # Validasi magic bytes
│   │   ├── modules/
│   │   │   ├── users/
│   │   │   │   ├── user.controller.js
│   │   │   │   ├── user.service.js
│   │   │   │   └── user.routes.js
│   │   │   ├── facilities/
│   │   │   │   ├── facility.controller.js
│   │   │   │   ├── facility.service.js
│   │   │   │   └── facility.routes.js
│   │   │   ├── bookings/
│   │   │   │   ├── booking.controller.js
│   │   │   │   ├── booking.service.js
│   │   │   │   └── booking.routes.js
│   │   │   ├── payments/
│   │   │   │   ├── payment.controller.js
│   │   │   │   ├── payment.service.js
│   │   │   │   └── payment.routes.js
│   │   │   ├── notifications/
│   │   │   │   └── notification.routes.js
│   │   │   └── calendar/
│   │   │       ├── calendar.controller.js
│   │   │       └── calendar.routes.js
│   │   ├── services/
│   │   │   ├── notificationService.js
│   │   │   └── googleCalendar.service.js
│   │   ├── utils/
│   │   │   ├── AppError.js
│   │   │   ├── responseHandler.js
│   │   │   ├── token.js
│   │   │   ├── revocationStore.js
│   │   │   ├── encryption.js
│   │   │   └── dbHelper.js
│   │   └── validations/
│   │       ├── user.validation.js
│   │       ├── facility.validation.js
│   │       └── booking.validation.js
│   ├── tests/                         # Jest test files
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx                   # Entry point React
│   │   ├── App.tsx                    # Routing & layout
│   │   ├── provider.tsx               # Theme + Auth provider
│   │   ├── config/
│   │   │   ├── api.ts                 # Axios instance
│   │   │   └── locale.ts             # Lokalisasi Indonesia
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx        # State auth global
│   │   ├── hooks/
│   │   │   └── useNotifications.ts   # SSE notifications
│   │   ├── types/
│   │   │   └── index.ts              # Shared TypeScript types
│   │   ├── utils/
│   │   │   ├── apiData.ts            # API response parser
│   │   │   └── dateUtils.ts          # Format tanggal
│   │   ├── styles/
│   │   │   └── globals.css           # Tailwind base styles
│   │   ├── components/
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── PublicRoute.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── navbar.tsx
│   │   │   └── theme-switcher.tsx
│   │   └── pages/
│   │       ├── auth/
│   │       │   ├── login.tsx
│   │       │   └── register.tsx
│   │       ├── user/
│   │       │   ├── dashboard.tsx
│   │       │   ├── facilities/
│   │       │   │   ├── index.ts
│   │       │   │   ├── FacilitiesPage.tsx
│   │       │   │   ├── FacilityCard.tsx
│   │       │   │   ├── BookingModal.tsx
│   │       │   │   ├── types.ts
│   │       │   │   ├── helpers.ts
│   │       │   │   ├── use-facilities.ts
│   │       │   │   └── use-facility-bookings.ts
│   │       │   ├── bookings.tsx
│   │       │   ├── calendar.tsx
│   │       │   ├── notifications.tsx
│   │       │   ├── profile.tsx
│   │       │   └── help.tsx
│   │       └── admin/
│   │           ├── dashboard.tsx
│   │           └── users.tsx
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── uploads/                           # Gambar fasilitas
└── README.md
```

---

## Lisensi

Hak cipta © 2026 RoomSync Booking System.
