<h3 align="center"> Arifian.AI v1.1 Admin Page</h3>

Sebuah halaman admin berupa aplikasi web modern untuk mengelola dan mengorganisir knowledge base aplikasi RAG untuk Arifian.AI (akses disini : https://arifian.netlify.app/chat-ai) dengan fitur chat AI yang terintegrasi.

## 🚀 Fitur Utama

- Autentikasi & Proteksi Halaman
  - Login dengan JWT, simpan token di `localStorage`
  - Middleware proteksi via komponen `ProtectedRoute`
  - Logout dan verifikasi token otomatis
- Manajemen Knowledge
  - Lihat daftar knowledge dengan pagination, sorting, dan aksi massal
  - Tambah knowledge manual
  - Lihat, edit, dan hapus knowledge (detail melalui modal)
- Chat AI (RAG)
  - Chat dengan AI yang merujuk ke knowledge base
  - Render Markdown, tabel, dan formula matematika (KaTeX)
  - Lihat sumber referensi yang digunakan AI (Source Modal)
- File Management & Upload
  - Upload file (PDF, TXT, CSV, Excel) untuk diproses menjadi knowledge
  - Kelola file yang sudah diunggah: lihat detail, download, dan hapus
  - Tautan file (mis. Cloudinary) tersedia untuk pratinjau/unduh
- System Prompt Manager
  - Buat, lihat, edit system prompt
  - Set aktif/default, reset ke default
- User Management
  - Lihat daftar pengguna, buat, edit, aktif/nonaktif, hapus
- UI & Notifikasi
  - Komponen UI modern (Radix UI + Tailwind CSS)

## 🛠️ Tech Stack

### Core Technologies
- **React 19** - Library JavaScript untuk membangun UI
- **TypeScript** - Superset JavaScript dengan type safety
- **Vite** - Build tool yang cepat dan modern
- **Tailwind CSS 4** - Framework CSS utility-first
- **React Router v7** - Library routing untuk React
- **Redux Toolkit + React Redux** - State management dengan Redux Toolkit
- **React Markdown, Remark GFM, Remark Math, Rehype KaTeX, React KaTeX** - Rendering markdown content dengan support GFM, math formula, dan KaTeX

## 📁 Struktur Proyek

```
src/
├── components/
│   ├── ui/                     # Komponen UI dasar (Button, Card, Tabs, dll)
│   ├── ProtectedRoute.tsx      # Proteksi akses halaman berdasarkan auth
│   ├── Chat.tsx                # Chat AI (RAG) + render Markdown & KaTeX
│   ├── SourceModal.tsx         # Lihat sumber referensi jawaban AI
│   ├── KnowledgeList.tsx       # Daftar knowledge + aksi massal
│   ├── KnowledgeModal.tsx      # Detail, edit, dan statistik knowledge
│   ├── AddKnowledge.tsx        # Form tambah knowledge manual
│   ├── FileUpload.tsx          # Upload file (PDF, TXT, CSV, Excel)
│   ├── FileManager.tsx         # Kelola file yang diunggah
│   ├── SystemPromptManager.tsx # Kelola system prompts
│   └── UserManager.tsx         # Kelola pengguna
├── pages/
│   ├── Home.tsx                # Halaman landing sederhana
│   ├── Login.tsx               # Form login
│   └── Dashboard.tsx           # Tab navigasi utama fitur
├── store/
│   └── authSlice.ts            # State & aksi autentikasi (login, verify, CRUD user)
├── lib/
│   └── utils.ts                # Util cn dan apiRequest (fetch + Authorization)
├── types/                      # Definisi tipe (auth, knowledge)
├── App.tsx                     # Konfigurasi routing utama
└── main.tsx                    # Entry point + BrowserRouter
```

## 🚀 Quick Start

### Prerequisites
- Node.js (versi 18 atau lebih baru)
- npm atau yarn

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url> ./
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Buka http://localhost:5173 di browser Anda

### Build untuk Production

```bash
# Build aplikasi
npm run build

# Preview build hasil
npm run preview
```

## 📋 Available Scripts

- `npm run dev` - Menjalankan development server
- `npm run build` - Build aplikasi untuk production
- `npm run lint` - Menjalankan ESLint untuk code quality
- `npm run preview` - Preview hasil build

## 🔧 Konfigurasi

### Environment Variables
```
VITE_BACKEND_BASE_URL=http://localhost:7860 atau url backend production
```

### API Integration
Frontend berkomunikasi dengan backend RAG API yang berjalan di:
- Development: `http://localhost:7860` ([FastAPI Backend](https://github.com/arifian853/arifian.ai))
- Production: Sesuaikan dengan deployment backend production (misalnya, Heroku, Netlify, dll.)