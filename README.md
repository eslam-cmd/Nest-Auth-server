## ⚙️ 2. ملف الـ README الخاص بالـ Backend (NestJS)

قم بإنشاء ملف باسم `README.md` داخل المجلد الرئيسي لتطبيق **NestJS**:

````markdown
# DevEngine Server (NestJS API)

This is the backend API for **DevEngine**, built with NestJS. It handles robust user registration, credential validation, and secure session state tracking through HttpOnly JWT cookies.

## 🔒 Key Features

- **Strict Payload Validation:** Enforces clean incoming requests utilizing global `ValidationPipe` and `class-validator` (e.g., strong password constraints and email formats).
- **Cross-Site Cookie Authentication:** Delivers secure JSON Web Tokens (JWT) inside `HttpOnly` and `SameSite: None` (with `Secure: true`) cookies, allowing seamless cross-site authentication between ports `3000` and `3001` locally.
- **Robust Session Isolation:** Protects developer profiles by enforcing backend authorization guards before exposing user credentials.
- **Consistent Error Diagnostics:** Normalizes system failures into highly-readable, multi-lingual compatible JSON error payloads (such as preventing duplicate email registration).

---

## 🛠️ Tech Stack

- **Framework:** NestJS
- **Authentication:** Passport.js + JWT (JSON Web Tokens)
- **Validation:** `class-validator` & `class-transformer`
- **Platform:** Express (Cookie-parser integration)

---

## 📂 Core Endpoints

| Method | Endpoint         | Description                             | Payload       | Protection            |
| :----- | :--------------- | :-------------------------------------- | :------------ | :-------------------- |
| `POST` | `/auth/register` | Registers a new developer profile       | `RegisterDto` | Public                |
| `POST` | `/auth/login`    | Authenticates user & sets secure cookie | `LoginDto`    | Public                |
| `GET`  | `/auth/profile`  | Returns current session's identity      | -             | Protected (JWT Guard) |
| `POST` | `/auth/logout`   | Clears local browser session cookie     | -             | Protected (JWT Guard) |

---

## ⚙️ Quick Start

### 1. Install Dependencies

Run the following command in the root of your NestJS directory:

```bash

npm install
```
````
