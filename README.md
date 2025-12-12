# 🚀 QuickCash POS System

QuickCash është një sistem modern POS (Point of Sale) i projektuar për menaxhimin e bizneseve lokale.

## 📋 Features

- ✅ Self-service payment (Cash & Card)
- ✅ Real-time inventory management
- ✅ Financial reporting (Daily/Monthly/Yearly)
- ✅ Customer membership & loyalty program
- ✅ Staff management
- ✅ Social media integration
- ✅ AI-powered customer flow prediction

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- PostgreSQL (Sequelize ORM)
- JWT Authentication
- Stripe for payments

### Frontend
- Angular 17+
- TypeScript
- Angular Material
- RxJS

### DevOps
- Git & GitHub
- Docker (optional)

## 📂 Project Structure

```
QuickCash-POS/
├── backend/              # Node.js API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   └── config/
│   └── database/
│       ├── migrations/
│       └── seeds/
├── frontend/
│   ├── customer-app/     # Customer self-service app
│   ├── staff-app/        # Staff POS interface
│   └── manager-dashboard/ # Manager analytics
├── docs/
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Angular CLI 17+

### Installation

1. **Clone repository:**
```bash
git clone https://github.com/Ergi550/QuickCash.git
cd QuickCash
```

2. **Setup Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env me konfigurimet e tua
npm run seed  # Populate database
npm run dev   # Start server
```

3. **Setup Frontend:**
```bash
cd frontend/staff-app
npm install
ng serve
# Access at http://localhost:4200



## 🔐 Default Login Credentials

- **Admin:** admin@quickcash.al / password123
- **Manager:** manager@quickcash.al / password123
- **Staff:** staff1@quickcash.al / password123

⚠️ **NDRYSHONI këto passwords në production!**

## 📖 Documentation

- [API Documentation](docs/api/)
- [User Manual](docs/user-manual/)
- [Technical Documentation](docs/technical/)

## 👥 Team

- Ergi Duka
- Aurel Ukperaj
- Klaus Ferhati
- Isli Korkuti



---

**QuickCash POS** - Moderne, Efikase, Inovative 🚀
