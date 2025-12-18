
# Airport Management System

## Cấu trúc dự án

```
airport/
├── backend/          # Node.js + Express API
│   ├── config/       # Config
│   ├── controllers/  # API controllers
|   |-- routers/      # Router API
|   |-- models/       # Database API
│   └── index.js      # Server entry point
└── frontend/         # React + Vite
    └── src/          # React components
```

## Chạy dự án

### Backend (Node.js)

```bash
cd backend
npm install
npm run dev
```

Server chạy tại: http://localhost:3000

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

App chạy tại: http://localhost:5173

## API Endpoints

- `GET /` - Health check
- `GET /san-bay` - Lấy danh sách sân bay
- `POST /san-bay` - Thêm sân bay mới
- `POST /auth/dang-ky/gui-otp` - Đăng ký tài khoản
- `POST /auth/dang-ky/xac-thuc` - Xác thực tài khoản đã đăng kí
# Airport


