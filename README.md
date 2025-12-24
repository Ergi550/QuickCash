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
- Docker 

## 📂 Project Structure

```
quickcash/
├── server/                          
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/ (4)
│   │   ├── services/ (4)
│   │   ├── models/ (4)
│   │   ├── routes/ (4)
│   │   ├── middleware/ (2)
│   │   ├── utils/ (2)
│   │   ├── data/ (3 JSON files)
│   │   └── app.ts
│   └── [docs]
│
├── client/                          
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── guards/ (2)      ✅
│   │   │   │   ├── interceptors/ (1) ✅
│   │   │   │   ├── models/ (4)      ✅
│   │   │   │   └── services/ (5)    ✅
│   │   │   │
│   │   │   ├── features/
│   │   │   │   ├── auth/ (2)        ✅
│   │   │   │   ├── customer/ (5)    ✅
│   │   │   │   ├── staff/ (4)       ✅
│   │   │   │   └── manager/ (6)     ✅ NEW!
│   │   │   │
│   │   │   └── shared/
│   │   │       └── components/ (2)  ✅ NEW!
│   │   │
│   │   └── [config files]
│   └── [docs]
│
└── [documentation] (9 files)        ✅
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
npm run seed  # Populate database Pasi te vendoset ne projekt
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



## 📖 Documentation

- [API Documentation](docs/api/)
- [User Manual](docs/user-manual/)
- [Technical Documentation](docs/technical/)

## 👥 Team

- Ergi Duka
- Aurel Ukperaj
- Klaus Ferhati
- Isli Korkuti


**QuickCash POS** - Moderne, Efikase, Inovative 🚀
