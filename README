# Character Match Web App

HashMicro Character Match adalah aplikasi web untuk membandingkan dua input string dan menghitung tingkat kesamaan (match percentage).
Aplikasi ini dibuat sebagai bagian dari **HashMicro Web App Test** dan dilengkapi dengan fitur keamanan, autentikasi, serta pengelolaan riwayat perbandingan.

---

## ✨ Fitur Utama

* **Autentikasi pengguna**

  * Register & Login dengan hashing password (bcrypt)
  * JWT + Cookie untuk session management
  * Logout dengan sesi aman
* **Perbandingan karakter**

  * Hitung persentase kesamaan antar dua string
  * Mode **Case-Sensitive** atau **Case-Insensitive**
* **Riwayat perbandingan**

  * Simpan, tampilkan, edit, dan hapus riwayat
  * Pagination
* **Keamanan**

  * Sanitasi input menggunakan **DOMPurify** untuk mencegah XSS
  * Helmet untuk hardening HTTP headers
  * Rate limiting pada endpoint sensitif
  * Validasi input di server
* **Logging**

  * Winston + Daily Rotate File untuk log terstruktur
* **Database**

  * Mendukung **MySQL** & **SQLite** (untuk development)
* **View**

  * Template engine EJS dengan styling berbasis Tailwind CSS

---

## 🛠️ Teknologi yang Digunakan

| Layer             | Teknologi                                              |
| ----------------- | ------------------------------------------------------ |
| Backend Framework | [Express.js](https://expressjs.com/) v5                |
| Frontend Template | [EJS](https://ejs.co/) + Tailwind CSS                  |
| Database ORM      | [Sequelize](https://sequelize.org/)                    |
| Auth              | [JWT](https://jwt.io/) + Cookie Parser + Bcrypt        |
| Security          | Helmet, CORS, DOMPurify, Express Validator, Rate Limit |
| Logging           | Winston + Daily Rotate File                            |
| Language          | TypeScript                                             |
| Dev Tooling       | ts-node-dev, TypeScript Compiler                       |

---

## 📂 Struktur Proyek

```
character-match/
├── src/
│   ├── configs/       # Konfigurasi (DB, CORS, limiter, logger, dll.)
│   ├── controllers/   # Logic untuk tiap route
│   ├── middlewares/   # Middleware custom (auth, error handling, dll.)
│   ├── models/        # Definisi model Sequelize
│   ├── routes/        # Routing API
│   ├── utils/         # Helper & utility
│   ├── views/         # Template EJS untuk frontend
│   └── server.ts      # Entry point TypeScript
├── dist/              # Hasil build TypeScript
├── public/            # Asset statis
├── package.json
└── README.md
```

---

## ⚙️ Instalasi & Menjalankan

### 1️⃣ Clone Repository

```bash
git clone https://github.com/username/character-match.git
cd character-match
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Konfigurasi Environment

Buat file `.env` di root folder dengan isi seperti:

```env
# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# Database
DB_DIALECT=mysql   # atau sqlite
DB_HOST=localhost
DB_PORT=3306
DB_NAME=character_match
DB_USER=root
DB_PASS=your_password

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4️⃣ Jalankan dalam Development

```bash
npm run dev
```

### 5️⃣ Build & Run Production

```bash
npm run build
npm start
```

---

## 🔌 API Endpoint

### **Auth**

| Method | Endpoint                 | Deskripsi          | Body (JSON)              |
| ------ | ------------------------ | ------------------ | ------------------------ |
| POST   | `/api/v1/users/register` | Register user baru | `{ username, password }` |
| POST   | `/api/v1/users/login`    | Login user         | `{ username, password }` |
| POST   | `/api/v1/users/logout`   | Logout user        | -                        |

### **History**

| Method | Endpoint                  | Deskripsi                  | Body / Query                        |
| ------ | ------------------------- | -------------------------- | ----------------------------------- |
| GET    | `/api/v1/histories`       | Ambil riwayat (pagination) | `page`, `limit`                     |
| POST   | `/api/v1/histories/check` | Cek match & simpan         | `{ input1, input2, caseSensitive }` |
| PUT    | `/api/v1/histories/:id`   | Edit riwayat               | `{ input1, input2, caseSensitive }` |
| DELETE | `/api/v1/histories/:id`   | Hapus riwayat              | -                                   |

---

## 🔒 Keamanan

* **Helmet**: Lindungi HTTP headers
* **CORS**: Restrict origin di production
* **Rate Limiting**: Batasi request ke endpoint login/register
* **Input Sanitization**: DOMPurify + validasi server-side
* **Password Hashing**: bcrypt

---

## 📜 Lisensi

[ISC License](./LICENSE)
