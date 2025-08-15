# Character Match Web App

## 📌 Ringkasan Proyek
Aplikasi ini adalah **HashMicro Character Match Web App Test** yang membandingkan dua input string untuk menghitung **persentase kemiripan karakter**.  
Mendukung autentikasi pengguna, manajemen riwayat, keamanan berlapis, serta dokumentasi API lengkap.

## ✅ Checklist Soal & Implementasi

| Kriteria Soal | Status | Implementasi |
| ------------- | ------ | ------------ |
| **MVC Pattern** | ✅ | `src/controllers/`, `src/models/`, `src/routes/` |
| **OOP / Inheritance** | ✅ | `src/models/` (Model Sequelize mewarisi `Sequelize.Model`) dan custom class untuk konfigurasi/logging |
| **Nested Loop / If** | ✅ | `src/controllers/history.controller.ts` → logika perhitungan persentase karakter & filter |
| **Math Operations** | ✅ | Perhitungan persentase kemiripan karakter di route `/api/v1/histories/check` - `calculateMatchStats` |
| **CRUD** | ✅ | - Create: POST `/api/v1/histories/check`<br>- Read: GET `/api/v1/histories`<br>- Update: PUT `/api/v1/histories/:id`<br>- Delete: DELETE `/api/v1/histories/:id` |
| **Fitur Persentase Karakter** | ✅ | `src/controllers/history.controller.ts` pada fungsi `calculateMatchStats` |
| **Keamanan** | ✅ | Helmet, CORS, DOMPurify, Rate Limit, bcrypt hashing |

---

## ⚠️ Catatan Inconsistency/Ambiguity pada Soal
Pada contoh soal disebutkan kasus:

```

Input1: ABBCD
Input2: Galant Duck

```

Namun, output yang diberikan hanya menampilkan karakter **A** dan **D**.  
Secara logika algoritma perbandingan karakter (case-insensitive), karakter **C** seharusnya juga terdeteksi ada di kedua string. Atau pun jika perbandingan merupakan case-sensitive seharunys hanya karakter **D** yang terdeteksi.  

**Kemungkinan penyebab:**
- Soal memiliki contoh yang tidak konsisten (typo / ambiguity).

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
│   ├── models/        # Definisi model Sequelize
│   ├── routes/        # Routing API
│   └── server.ts      # Entry point TypeScript
├── views/             # Template EJS untuk frontend
├── dist/              # Hasil build TypeScript
├── public/            # Asset statis
├── package.json
└── README.md

````

---

## ⚙️ Instalasi & Menjalankan

### 1️⃣ Clone Repository
```bash
git clone https://github.com/Lavaruz/character-match-hashmicro.git
cd character-match-hashmicro
````

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
ACCESS_TOKEN_SECRET=your_jwt_secret_key
REFRESH_TOKEN_SECRET=your_refresh_secret_key
AES_KEYS=your_aes_secret_key

# Database
DB=mysql   # atau sqlite
DB_HOST=localhost
DB_NAME=character_match
DB_USERNAME=root
DB_PASSWORD=your_password

# CORS
CORS_ORIGIN= "*"
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

| Method | Endpoint                 | Deskripsi          | Body (JSON)                          |
| ------ | ------------------------ | ------------------ | ------------------------------------ |
| POST   | `/api/v1/users/register` | Register user baru | `{ username, email, password }`      |
| POST   | `/api/v1/users/login`    | Login user         | `{ identifier, password, remember }` |
| POST   | `/api/v1/users/logout`   | Logout user        | -                                    |

### **History**

| Method | Endpoint                  | Deskripsi                  | Body / Query                        |
| ------ | ------------------------- | -------------------------- | ----------------------------------- |
| GET    | `/api/v1/histories`       | Ambil riwayat (pagination) | `page`, `limit`, `input1`, `input2` |
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
