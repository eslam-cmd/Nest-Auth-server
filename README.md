# DevEngine Auth — Backend API

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![JWT](https://img.shields.io/badge/JWT-black?logo=jsonwebtokens)](https://jwt.io)

Authentication API built with **NestJS** and **TypeScript**, implementing a secure dual-token strategy (Access + Refresh) with HTTP-Only cookies and PostgreSQL persistence.

> 🔗 Frontend repository: [Nest-Auth-client](https://github.com/eslam-cmd/Nest-Auth-client)

---

## ✨ Features

- **Dual-Token JWT Auth** — Access token (short-lived) + Refresh token (long-lived)
- **Database Token Storage** — Refresh tokens persisted in PostgreSQL for session control
- **HTTP-Only Cookies** — Tokens delivered via secure cookies (XSS protection)
- **bcrypt Password Hashing** — Industry-standard password encryption
- **RBAC** — Role-based access control (Admin / Student)
- **Input Validation** — Strict DTO validation with `class-validator`
- **CORS Configured** — Ready for Next.js frontend communication
- **OAuth Ready** — Architecture prepared for Google/GitHub/LinkedIn social login

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | NestJS |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | TypeORM |
| Auth | JWT, bcrypt |
| Validation | class-validator, class-transformer |

---



### Token Strategy
| Token | Storage | Lifetime | Purpose |
|-------|---------|----------|---------|
| Access Token | HTTP-Only Cookie | 15 minutes | API authorization |
| Refresh Token | HTTP-Only Cookie + PostgreSQL | 7 days | Session renewal |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14

### Installation

```bash
# Clone repository
git clone https://github.com/eslam-cmd/Nest-Auth-backend.git
cd Nest-Auth-backend

# Install dependencies
npm install

# Setup environment
cp .env
```

### Environment Variables

```env
# Server
DATABASE_URL="+++=require"
JWT_SECRET=++++++

```



### Run

```bash
# Development
npm run start:dev

# Production build
npm run build
```

Server runs at `http://localhost:3001`

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Create new account | Public |
| POST | `/auth/login` | Login, set cookies | Public |
| POST | `/auth/refresh` | Rotate access token | Refresh Cookie |
| POST | `/auth/logout` | Clear session cookies | Authenticated |
| GET | `/auth/me` | Get current user profile | Authenticated |



---


## 🔐 Security Details

### Password Hashing
```typescript
// bcrypt with 12 rounds
const hashedPassword = await bcrypt.hash(password, 12);
```

### CORS Setup
```typescript
// Configured for Next.js frontend
app.enableCors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
});
```

---

## 🗺️ Roadmap

- [ ] **Rate Limiting** — Brute-force protection
- [ ] **Jest Tests** — Unit + integration test coverage
- [ ] **OAuth Integration** — Google, GitHub, LinkedIn social login
- [ ] **Email Verification** — Verify email before account activation
- [ ] **Password Reset** — Secure token-based password reset flow
- [ ] **Session Management** — Multi-device session tracking and revocation

---

## 📬 Contact

Built by **Islam Hadaya**

- Portfolio: [my-profile-personal-nextjs.vercel.app](https://my-profile-personal-nextjs.vercel.app)
- LinkedIn: [Islam Hadaya](https://www.linkedin.com/in/Islam-hadaya)
- Email: [hdayaaslam34@gmail.com](mailto:hdayaaslam34@gmail.com)

---

