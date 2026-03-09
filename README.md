# EvAIlo LMS

Hệ thống quản lý học tập (Learning Management System) full-stack với giao diện hiện đại, được xây dựng bằng **Next.js 16** (frontend) và **FastAPI** (backend), kết nối với cơ sở dữ liệu **MariaDB 11** thông qua Docker.

---

## Mục lục

1. [Tổng quan dự án](#tổng-quan-dự-án)
2. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
3. [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)
   - [1. Clone & chuẩn bị](#1-clone--chuẩn-bị)
   - [2. Khởi động database (Docker)](#2-khởi-động-database-docker)
   - [3. Cài đặt & chạy backend](#3-cài-đặt--chạy-backend)
   - [4. Cài đặt & chạy frontend](#4-cài-đặt--chạy-frontend)
4. [Tài khoản demo](#tài-khoản-demo)
5. [Chức năng từng feature](#chức-năng-từng-feature)
6. [API Endpoints](#api-endpoints)
7. [Kiến trúc codebase](#kiến-trúc-codebase)
8. [Biến môi trường](#biến-môi-trường)
9. [Chạy test backend](#chạy-test-backend)

---

## Tổng quan dự án

EvAIlo LMS mô phỏng một hệ thống học tập đại học với các tính năng:

- Đăng nhập / Đăng ký tài khoản (JWT)
- Xem danh sách khoá học và tiến độ học tập
- Quản lý module theo từng khoá học (Home, Modules, Assignments, Grades, People)
- Nộp bài tập và theo dõi điểm số
- Bảng phân tích học tập với biểu đồ so sánh với lớp
- Diễn đàn thảo luận theo thread

```
Frontend  :3000  →  Backend API  :8000  →  MariaDB  :3306
```

---

## Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---|---|
| Node.js | 20+ |
| pnpm | 9+ |
| Python | 3.11+ |
| Docker Desktop | 24+ |
| Git | bất kỳ |

> Cài pnpm nếu chưa có: `npm install -g pnpm`

---

## Hướng dẫn cài đặt

### 1. Clone & chuẩn bị

```bash
git clone <repo-url> evailoProject
cd evailoProject
```

Cấu trúc thư mục sau khi clone:

```
evailoProject/
├── frontend/   ← Next.js app
└── backend/    ← FastAPI app
```

---

### 2. Khởi động database (Docker)

MariaDB 11 chạy trong Docker container. Chạy lệnh sau **một lần**:

```bash
docker run -d \
  --name evailodb \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=evailodb \
  -e MYSQL_USER=evailouser \
  -e MYSQL_PASSWORD=changeme \
  -p 3306:3306 \
  mariadb:11
```

> **Windows PowerShell** – dùng backtick thay cho backslash:
> ```powershell
> docker run -d `
>   --name evailodb `
>   -e MYSQL_ROOT_PASSWORD=root `
>   -e MYSQL_DATABASE=evailodb `
>   -e MYSQL_USER=evailouser `
>   -e MYSQL_PASSWORD=changeme `
>   -p 3306:3306 `
>   mariadb:11
> ```

Kiểm tra container đã chạy:

```bash
docker ps
```

Bạn sẽ thấy `evailodb` với status `Up`.

---

### 3. Cài đặt & chạy backend

```bash
cd backend

# Tạo virtual environment (khuyến nghị)
python -m venv .venv
.venv\Scripts\activate        # Windows
# hoặc: source .venv/bin/activate  (macOS/Linux)

# Cài dependencies
pip install -r requirements.txt

# Seed dữ liệu mẫu (chỉ cần chạy 1 lần)
python -m data.seed

# Khởi động server
python -m uvicorn main:app --port 8000 --reload
```

Xác nhận backend hoạt động:

```bash
# Mở terminal mới
curl http://localhost:8000/api/health
# → {"status":"ok"}
```

Tài liệu API tự động (Swagger UI): http://localhost:8000/docs

---

### 4. Cài đặt & chạy frontend

```bash
# Mở terminal mới, từ thư mục gốc project
cd frontend

# Cài dependencies
pnpm install

# Chạy development server
pnpm dev
```

Mở trình duyệt: **http://localhost:3000**

Ứng dụng sẽ tự chuyển hướng đến trang đăng nhập.

---

## Tài khoản demo

Sau khi seed dữ liệu, có thể đăng nhập bằng các tài khoản sau:

| Role | Email | Mật khẩu |
|---|---|---|
| Student | `student@evai.lo` | `password123` |
| Instructor | `dr.willis@evai.lo` | `instructor123` |
| Student | `alex.chen@evai.lo` | `password123` |
| Student | `priya.nair@evai.lo` | `password123` |

> Hoặc tự tạo tài khoản mới qua form **Register** trên trang đăng nhập.

---

## Chức năng từng feature

### 1. Xác thực (Authentication)

**Trang:** `/login`

- **Đăng nhập:** Nhập email + mật khẩu, nhận JWT token lưu vào `localStorage`
- **Đăng ký:** Điền tên, email, mật khẩu → tự động đăng nhập sau khi tạo tài khoản
- **Auth guard:** Mọi trang ngoài `/login` đều bị chặn nếu không có token hợp lệ → redirect về `/login`
- **Đăng xuất:** Nút logout trên thanh header → xóa token, redirect về `/login`

---

### 2. Dashboard (Tổng quan)

**Sidebar icon:** Biểu tượng ngôi nhà (Home)

Hiển thị sau khi đăng nhập:

- **Danh sách khoá học** – 3 khoá học được enroll (IFB220, IAB230, Capstone). Click vào khoá học để vào trang Modules
- **To-do list** – Tự động liệt kê các bài tập có trạng thái `missing` (còn thiếu), kèm deadline
- **Recent Feedback** – 3 bài gần nhất đã được chấm điểm, hiển thị điểm số và tên bài
- Dữ liệu được lấy trực tiếp từ API (assignments theo user đăng nhập)

---

### 3. Modules View (Xem khoá học)

**Kích hoạt:** Click vào bất kỳ khoá học nào ở Dashboard

5 tab điều hướng bên trái:

#### 3a. Home
- Mô tả khoá học
- 3 thống kê nhanh: tổng số bài tập, điểm trung bình hiện tại, số bài còn thiếu
- Danh sách bài tập `missing` với deadline (hoặc thông báo "All caught up")
- Thông tin giảng viên kèm link email

#### 3b. Modules
- Danh sách module theo tuần (accordion expand/collapse)
- Mỗi module gồm nhiều items: PDF, Notebook, Bài đọc, Assignment
- Click vào item là Assignment → mở trang nộp bài
- Nút **Published / Unpublished** để toggle trạng thái hiển thị

#### 3c. Assignments
- Bộ lọc: All / Graded / Submitted / Missing
- Bảng đầy đủ: Tên bài | Deadline | Điểm | Trạng thái
- Click vào hàng bất kỳ → mở form nộp bài

#### 3d. Grades
- 3 thống kê: điểm trung bình (%), số bài đã chấm, số bài thiếu
- Bảng breakdown toàn bộ bài tập với điểm số và trạng thái

#### 3e. People
- Thông tin giảng viên với link mailto
- Số sinh viên đang enrolled trong khoá học

---

### 4. Assignment View (Nộp bài)

**Kích hoạt:** Click vào bài tập bất kỳ trong Modules hoặc Assignments tab

- Hiển thị form nộp bài
- Submit gửi `POST /api/assignments/{id}/submit` → cập nhật trạng thái thành `submitted`
- Bài đã chấm xong (graded) không thể nộp lại

---

### 5. Analytics (Phân tích học tập)

**Sidebar icon:** Biểu tượng biểu đồ

- **Bar chart:** So sánh điểm của bạn vs. điểm trung bình lớp cho từng bài assignment (dùng Recharts)
- **Line chart:** Đường cong tiến độ điểm theo thời gian
- **4 thống kê tóm tắt:** Tổng bài, điểm trung bình, số bài submitted, số bài missing
- Tự động hiển thị cho khoá học đang được chọn (truyền qua prop `courseId`)

---

### 6. Discussions (Diễn đàn)

**Sidebar icon:** Biểu tượng bong bóng chat

- **Danh sách thread** bên trái – hiển thị tiêu đề, tác giả, timestamp tương đối (e.g. "2h ago"), số lượt reply
- **Thread detail** bên phải – hiển thị toàn bộ reply theo thứ tự thời gian với avatar, tên, nội dung
- **Ô nhập reply** – gõ nội dung và nhấn Send → reply mới xuất hiện ngay lập tức (optimistic update)
- Tất cả đã được lưu vào database và persist qua các lần reload

---

### 7. Workspace

**Sidebar icon:** Biểu tượng layout

- Trang trống placeholder – có thể mở rộng sau

---

## API Endpoints

Backend chạy tại `http://localhost:8000`. Tất cả endpoint (trừ auth) đều yêu cầu header:

```
Authorization: Bearer <token>
```

### Auth

| Method | Path | Mô tả |
|---|---|---|
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới |
| `POST` | `/api/auth/login` | Đăng nhập, trả JWT token |
| `POST` | `/api/auth/logout` | Đăng xuất |
| `GET` | `/api/auth/me` | Lấy thông tin user hiện tại |

**Request body login:**
```json
{ "email": "student@evai.lo", "password": "password123" }
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": { "id": "...", "name": "Dang Linh Phan", "email": "...", "role": "student" }
}
```

---

### Courses

| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/api/courses` | Danh sách tất cả khoá học |
| `GET` | `/api/courses/{course_id}` | Chi tiết 1 khoá học |

---

### Modules

| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/api/modules?courseId={id}` | Modules theo khoá học |

**Ví dụ:** `GET /api/modules?courseId=ifb220`

---

### Assignments

| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/api/assignments` | Tất cả bài tập của user |
| `GET` | `/api/assignments?course_id={id}` | Bài tập theo khoá học |
| `GET` | `/api/assignments/{id}` | Chi tiết 1 bài tập |
| `POST` | `/api/assignments/{id}/submit` | Nộp bài tập |

---

### Analytics

| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/api/analytics?course_id={id}` | Dữ liệu phân tích điểm cho 1 khoá học |

**Response mẫu:**
```json
{
  "bar_data": [{ "name": "Lab 1", "you": 88, "avg": 81 }],
  "line_data": [{ "week": "Wk 1", "score": 88 }],
  "assignments": [...]
}
```

---

### Discussions

| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/api/discussions` | Danh sách tất cả thread |
| `GET` | `/api/discussions/{thread_id}/replies` | Replies của 1 thread |
| `POST` | `/api/discussions/{thread_id}/replies` | Đăng reply mới |

**Request body post reply:**
```json
{ "body": "Nội dung reply của bạn" }
```

---

### Health Check

```
GET /api/health  →  {"status": "ok"}
```

---

## Kiến trúc codebase

```
evailoProject/
│
├── frontend/                          # Next.js 16 App Router
│   ├── app/
│   │   ├── page.tsx                   # Shell chính: auth guard + router view
│   │   ├── login/page.tsx             # Trang đăng nhập / đăng ký
│   │   ├── layout.tsx                 # Root layout + ThemeProvider
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── lms/                       # Components chính của ứng dụng
│   │   │   ├── left-sidebar.tsx       # Sidebar điều hướng trái
│   │   │   ├── top-header.tsx         # Header trên cùng + nút logout
│   │   │   ├── dashboard-view.tsx     # View: Tổng quan (khoá học + todo + feedback)
│   │   │   ├── modules-view.tsx       # View: 5 tab khoá học (Home/Modules/Assignments/Grades/People)
│   │   │   ├── assignment-view.tsx    # View: Form nộp bài
│   │   │   ├── analytics-view.tsx     # View: Biểu đồ phân tích điểm
│   │   │   ├── discussions-view.tsx   # View: Diễn đàn threads + replies
│   │   │   ├── workspace-view.tsx     # View: Workspace (placeholder)
│   │   │   ├── course-card.tsx        # Component card khoá học
│   │   │   └── right-sidebar.tsx      # Sidebar phải (thông báo)
│   │   │
│   │   └── ui/                        # shadcn/ui components (Button, Card, Dialog, ...)
│   │
│   ├── lib/
│   │   ├── api-client.ts              # Base fetch wrapper: gắn Bearer token, xử lý lỗi
│   │   ├── utils.ts                   # cn() helper (clsx + tailwind-merge)
│   │   └── api/                       # Các hàm gọi API cụ thể
│   │       ├── auth.ts                # apiLogin, apiRegister, fetchMe, apiLogout
│   │       ├── courses.ts             # fetchCourses, fetchCourse
│   │       ├── modules.ts             # fetchModules
│   │       ├── assignments.ts         # fetchAssignments, submitAssignment
│   │       ├── analytics.ts           # fetchAnalytics
│   │       └── discussions.ts         # fetchThreads, fetchReplies, postReply, createThread
│   │
│   ├── types/lms.ts                   # TypeScript types: View, Course, Module, ...
│   ├── hooks/                         # Custom hooks (use-mobile, use-toast)
│   ├── next.config.mjs                # Next.js config
│   ├── tsconfig.json
│   └── package.json
│
└── backend/                           # FastAPI application
    ├── main.py                        # Entry point: CORS + router registration + lifespan
    ├── .env                           # Biến môi trường (DB, JWT secret)
    ├── requirements.txt
    │
    ├── core/
    │   ├── config.py                  # Settings (pydantic-settings, đọc từ .env)
    │   ├── security.py                # bcrypt hashing, JWT encode/decode
    │   └── deps.py                    # FastAPI dependency: get_current_user
    │
    ├── db/
    │   ├── base.py                    # SQLAlchemy DeclarativeBase
    │   └── session.py                 # Async engine + AsyncSessionLocal + get_db()
    │
    ├── models/
    │   ├── orm.py                     # SQLAlchemy ORM models:
    │   │                              #   User, Assignment, DiscussionThread, DiscussionReply
    │   ├── user.py                    # Pydantic schemas: UserRegister, UserLogin, UserOut, TokenResponse
    │   └── lms.py                     # Pydantic schemas: Course, Module, Assignment, AnalyticsData, ...
    │
    ├── routers/
    │   ├── auth.py                    # POST /register, /login, /logout · GET /me
    │   ├── courses.py                 # GET /courses, /courses/{id}  (mock data)
    │   ├── modules.py                 # GET /modules?courseId=  (mock data)
    │   ├── assignments.py             # GET/POST /assignments  (MariaDB)
    │   ├── analytics.py               # GET /analytics  (MariaDB, aggregation)
    │   └── discussions.py             # GET/POST /discussions, /replies  (MariaDB)
    │
    ├── data/
    │   ├── mock.py                    # Dữ liệu tĩnh: COURSES, MODULES
    │   └── seed.py                    # Script seed DB: 4 users, 13 assignments, 4 threads, 3 replies
    │
    └── test_api.py                    # Test suite 15 cases (không dùng pytest)
```

### Luồng dữ liệu

```
Browser
  │
  ├─► GET /  →  app/page.tsx
  │     │  fetchMe() kiểm tra token
  │     └─► Nếu không có token → redirect /login
  │
  ├─► Chọn view từ sidebar
  │     │
  │     ├─► dashboard-view  →  fetchCourses() + fetchAssignments()
  │     ├─► modules-view    →  fetchModules() | fetchAssignments() | fetchAnalytics()
  │     ├─► analytics-view  →  fetchAnalytics(courseId)
  │     └─► discussions-view→  fetchThreads() → fetchReplies(threadId)
  │
  └─► lib/api-client.ts  →  apiFetch(path)
        │  Gắn Authorization: Bearer <token>
        └─► http://localhost:8000/api/...
              │
              └─► FastAPI router
                    │  Depends(get_current_user) → giải mã JWT → lấy User từ DB
                    └─► SQLAlchemy async query → MariaDB
```

### Database Schema

```
users
  id            VARCHAR(36) PK
  name          VARCHAR(255)
  email         VARCHAR(255) UNIQUE INDEX
  hashed_password VARCHAR(255)
  role          ENUM('student','instructor')
  avatar        VARCHAR(500) nullable
  created_at    DATETIME

assignments
  id            VARCHAR(36) PK
  user_id       VARCHAR(36) FK → users.id
  course_id     VARCHAR(50)   (ifb220 | iab230 | capstone)
  name          VARCHAR(255)
  score         INT nullable
  max_score     INT
  status        ENUM('graded','submitted','missing')
  due_date      DATE nullable
  submitted_at  DATETIME nullable

discussion_threads
  id            VARCHAR(36) PK
  course_id     VARCHAR(50)
  title         VARCHAR(500)
  author_id     VARCHAR(36) FK → users.id
  created_at    DATETIME

discussion_replies
  id            VARCHAR(36) PK
  thread_id     VARCHAR(36) FK → discussion_threads.id
  author_id     VARCHAR(36) FK → users.id
  body          TEXT
  created_at    DATETIME
```

---

## Biến môi trường

**`backend/.env`** (đã có sẵn trong repo):

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=evailodb
DB_USER=evailouser
DB_PASSWORD=changeme
SECRET_KEY=evAIlo-super-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

> Trong production, đổi `SECRET_KEY` thành một chuỗi random dài và bảo mật.

**`frontend/`** – không cần file `.env`. API URL mặc định là `http://localhost:8000`.  
Để override, tạo `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://your-backend-url
```

---

## Chạy test backend

Đảm bảo backend và database đang chạy, sau đó:

```bash
cd backend
python test_api.py
```

Output mẫu:

```
=== EvAIlo LMS API Test Suite ===
  [PASS] Health check
  [PASS] Register new user
  [PASS] Login student
  [PASS] GET /api/auth/me
  [PASS] GET /api/courses
  [PASS] GET specific course
  [PASS] GET /api/modules (ifb220)
  [PASS] GET /api/assignments (all)
  [PASS] GET /api/assignments (filtered by course)
  [PASS] GET /api/analytics
  [PASS] GET /api/discussions
  [PASS] GET replies for thread
  [PASS] POST reply to thread
  [PASS] GET /api/assignments/{id}
  [PASS] Submit an assignment
=== 15 passed  0 failed ===
```

---

## Stack công nghệ

| Layer | Công nghệ |
|---|---|
| Frontend framework | Next.js 16.1 (App Router, Turbopack) |
| UI library | React 19 |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS 4 |
| Component library | shadcn/ui + Radix UI |
| Charts | Recharts 2.15 |
| Package manager | pnpm |
| Backend framework | FastAPI 0.115 |
| ORM | SQLAlchemy 2.0 async |
| Database driver | aiomysql |
| Database | MariaDB 11 (Docker) |
| Authentication | JWT (python-jose) + bcrypt (passlib) |
| Migration | Alembic |
| Runtime | Python 3.11+ |
