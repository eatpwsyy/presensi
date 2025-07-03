# Sistem Presensi Sekolah

Sistem manajemen presensi sekolah yang dibangun dengan Golang (backend) dan Next.js 15 (frontend). Sistem ini memungkinkan siswa untuk melakukan check-in/check-out kehadiran dan admin untuk mengelola data siswa serta laporan presensi.

## Fitur Utama

### Untuk Siswa:
- 📝 Registrasi akun baru
- 🔐 Login/logout
- ✅ Check-in dan check-out presensi
- 📊 Melihat riwayat kehadiran
- 👤 Manajemen profil

### Untuk Admin:
- 🔐 Login admin
- 👥 Manajemen data siswa (CRUD)
- 📋 Manajemen presensi siswa
- 📈 Laporan statistik kehadiran
- 🔍 Filter data berdasarkan kelas, tingkat, tanggal
- 📊 Dashboard dengan overview sistem

## Teknologi yang Digunakan

### Backend (Golang):
- **Framework**: Gin (Web Framework)
- **Database**: SQLite dengan GORM ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **CORS**: gin-contrib/cors

### Frontend (Next.js 15):
- **Framework**: Next.js 15 dengan App Router
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **Form Handling**: react-hook-form
- **HTTP Client**: axios
- **Icons**: lucide-react
- **Date Utilities**: date-fns

## Struktur Proyek

```
/
├── backend/                 # Golang backend
│   ├── main.go             # Main server file
│   ├── go.mod              # Go dependencies
│   ├── handlers/           # API handlers
│   │   ├── auth.go         # Authentication handlers
│   │   ├── attendance.go   # Attendance management
│   │   └── students.go     # Student management
│   ├── models/             # Database models
│   │   ├── student.go      # Student model
│   │   └── attendance.go   # Attendance model
│   ├── middleware/         # Middleware functions
│   │   └── auth.go         # JWT authentication
│   └── database/           # Database connection
│       └── database.go     # Database initialization
└── frontend/               # Next.js frontend
    ├── app/                # App router pages
    │   ├── login/          # Login page
    │   ├── register/       # Registration page
    │   ├── student/        # Student dashboard
    │   └── admin/          # Admin dashboard
    ├── components/         # Reusable components
    │   └── ui/             # UI components
    ├── contexts/           # React contexts
    │   └── AuthContext.tsx # Authentication context
    ├── lib/                # Utility libraries
    │   └── api.ts          # API client
    ├── types/              # TypeScript types
    │   └── index.ts        # Type definitions
    └── utils/              # Utility functions
        └── format.ts       # Formatting utilities
```

## Cara Menjalankan Aplikasi

### Prerequisites
- Go 1.21 atau lebih baru
- Node.js 18 atau lebih baru
- npm atau yarn

### 1. Menjalankan Backend

```bash
# Masuk ke direktori backend
cd backend

# Install dependencies
go mod tidy

# Jalankan server
go run main.go
```

Backend akan berjalan di `http://localhost:8080`

### 2. Menjalankan Frontend

```bash
# Masuk ke direktori frontend
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/student/login` - Login siswa
- `POST /api/auth/student/register` - Registrasi siswa
- `POST /api/auth/admin/login` - Login admin

### Student Endpoints
- `GET /api/student/profile` - Get profil siswa
- `POST /api/student/checkin` - Check-in presensi
- `POST /api/student/checkout` - Check-out presensi
- `GET /api/student/attendance` - Get riwayat presensi

### Admin Endpoints
- `GET /api/admin/profile` - Get profil admin
- `GET /api/admin/students` - Get daftar siswa
- `POST /api/admin/students` - Tambah siswa baru
- `PUT /api/admin/students/:id` - Update data siswa
- `DELETE /api/admin/students/:id` - Hapus siswa
- `GET /api/admin/attendance` - Get semua data presensi
- `POST /api/admin/attendance` - Tambah presensi manual
- `PUT /api/admin/attendance/:id` - Update presensi
- `GET /api/admin/attendance/stats` - Get statistik presensi

## Akun Default

### Admin Default:
- **Email**: `admin@school.com`
- **Password**: `admin123`

### Contoh Data Siswa:
Siswa dapat mendaftar melalui halaman registrasi atau dibuat oleh admin.

## Database Schema

### Students Table:
- `id` (Primary Key)
- `student_id` (Unique)
- `name`
- `email` (Unique)
- `password` (Hashed)
- `class`
- `grade`
- `phone_number`
- `address`
- `is_active`
- `created_at`
- `updated_at`

### Attendance Table:
- `id` (Primary Key)
- `student_id` (Foreign Key)
- `date`
- `check_in_time`
- `check_out_time`
- `status` (present, absent, late, excused)
- `notes`
- `subject`
- `created_at`
- `updated_at`

### Admins Table:
- `id` (Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password` (Hashed)
- `name`
- `role`
- `is_active`
- `created_at`
- `updated_at`

## Fitur Keamanan

- 🔐 Password hashing menggunakan bcrypt
- 🎫 JWT untuk session management
- 🛡️ CORS protection
- ✅ Input validation dan sanitization
- 🔒 Route protection berdasarkan role

## Pengembangan Selanjutnya

- [ ] Notifikasi real-time
- [ ] Export laporan ke PDF/Excel
- [ ] Sistem absensi berbasis QR Code
- [ ] Dashboard analytics yang lebih detail
- [ ] Sistem notifikasi ke orangtua
- [ ] Mobile app menggunakan React Native
- [ ] Integration dengan sistem sekolah lainnya

## Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## Kontak

Jika ada pertanyaan atau saran, silakan buat issue di repository ini.

---

**Happy Coding! 🚀**