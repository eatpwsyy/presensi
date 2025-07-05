# Sistem Presensi Sekolah

Sistem manajemen presensi sekolah yang dibangun dengan Golang (backend) dan Next.js 15 (frontend). Sistem ini memungkinkan siswa untuk melakukan check-in/check-out kehadiran dan admin untuk mengelola data siswa serta laporan presensi.

## 🚀 New Features & Updates

### 🐳 Docker Support
- **Multi-stage Docker builds** untuk optimasi ukuran image
- **Docker Compose** untuk development dan production
- **Hot reload** dalam development environment
- **Standalone builds** untuk production deployment

### 🎨 Modern UI & Dark Mode
- **Redesigned interface** dengan modern design system
- **Dark mode support** dengan toggle dan persistence
- **Mobile-first responsive design** 
- **Enhanced components** dengan animations dan better UX
- **Modern typography** dan improved color schemes

### 📱 Mobile-First Design
- **Touch-friendly interfaces** dengan proper sizing
- **Responsive layouts** yang optimal di semua device
- **Mobile navigation** yang improved
- **Optimized performance** untuk mobile devices

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
- **Styling**: Tailwind CSS v4 dengan CSS custom properties
- **State Management**: React Context
- **Form Handling**: react-hook-form
- **HTTP Client**: axios
- **Icons**: lucide-react
- **Date Utilities**: date-fns
- **Theme Management**: Custom theme provider

### DevOps & Deployment:
- **Docker**: Multi-stage builds
- **Docker Compose**: Development dan production environments
- **Standalone builds**: Optimized untuk container deployment

## Cara Menjalankan Aplikasi

### Prerequisites
- Docker dan Docker Compose (recommended)
- Atau: Go 1.21+, Node.js 18+, npm/yarn

### 🐳 Menggunakan Docker (Recommended)

#### Development Environment
```bash
# Clone repository
git clone <repository-url>
cd presensi

# Start with Docker Compose
docker-compose -f docker-compose.dev.yml up

# Atau untuk production
docker-compose up
```

Services akan tersedia di:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080

#### Manual Docker Build
```bash
# Build backend
cd backend
docker build -t presensi-backend .

# Build frontend
cd ../frontend
docker build -t presensi-frontend .

# Run containers
docker run -p 8080:8080 presensi-backend
docker run -p 3000:3000 presensi-frontend
```

### 💻 Manual Setup (Development)

#### 1. Backend Setup
```bash
# Masuk ke direktori backend
cd backend

# Install dependencies
go mod tidy

# Jalankan server
go run main.go
```

Backend akan berjalan di `http://localhost:8080`

#### 2. Frontend Setup
```bash
# Masuk ke direktori frontend
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## 🎨 Theme & Design Features

### Dark Mode
- **Automatic detection** dari system preference
- **Manual toggle** dengan persistence
- **Smooth transitions** antar theme
- **Consistent theming** di seluruh aplikasi

### Modern UI Components
- **Enhanced buttons** dengan hover effects dan animations
- **Card components** dengan glassmorphism effects
- **Responsive typography** dengan mobile-first approach
- **Touch-friendly sizing** untuk mobile devices

### Mobile-First Design
- **Breakpoint system**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Responsive grid layouts**
- **Mobile navigation patterns**
- **Optimized touch targets** (minimum 44px)

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

## 🔧 Environment Variables

### Backend
```env
JWT_SECRET=your-secret-key
GIN_MODE=release  # untuk production
DATABASE_PATH=/path/to/database.db
```

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:8080  # Backend URL
NODE_ENV=production  # untuk production
```

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

## 📊 Performance & Optimization

### Frontend
- **Static generation** untuk landing pages
- **Code splitting** automatic dengan Next.js
- **Image optimization** built-in
- **CSS optimization** dengan Tailwind purging

### Backend
- **Optimized queries** dengan GORM
- **Connection pooling** untuk database
- **Middleware optimizations**
- **Small binary size** dengan multi-stage builds

## 🚀 Deployment

### Production dengan Docker
```bash
# Build dan deploy
docker-compose up -d

# Monitor logs
docker-compose logs -f
```

### Environment-specific configs
- `docker-compose.yml` - Production
- `docker-compose.dev.yml` - Development

## 🧪 Development

### Hot Reload
Development environment mendukung hot reload:
- **Frontend**: Next.js dengan Turbopack
- **Backend**: Manual restart (bisa tambahkan air untuk hot reload)

### Building
```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && go build -o main .
```

## Pengembangan Selanjutnya

- [x] ~~Notifikasi real-time~~ ✅ Implemented
- [x] ~~Export laporan ke PDF/Excel~~ ⚠️ Basic structure ready
- [x] ~~Sistem absensi berbasis QR Code~~ ✅ Implemented
- [x] ~~Dashboard analytics yang lebih detail~~ ✅ Implemented
- [x] ~~Sistem notifikasi ke orangtua~~ ✅ Basic structure ready
- [x] ~~Mobile app menggunakan React Native~~ ✅ Implemented
- [x] ~~Integration dengan sistem sekolah lainnya~~ ✅ API ready
- [x] ~~Docker support~~ ✅ Implemented
- [x] ~~Dark mode theme~~ ✅ Implemented
- [x] ~~Mobile-first design~~ ✅ Implemented

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