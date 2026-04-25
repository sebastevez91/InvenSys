# 📦 InvenSys — Sistema de Gestión de Inventario

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![SQL Server](https://img.shields.io/badge/SQL_Server-Azure-CC2927?logo=microsoftsqlserver&logoColor=white)
![Deploy](https://img.shields.io/badge/Deploy-Render_+_Vercel-brightgreen)

Sistema web completo de gestión de inventario desarrollado como proyecto de portfolio.

🔗 **[Ver demo en vivo](https://inven-sys.vercel.app)**  
📋 **[Documentación API (Swagger)](https://invensys-zhlj.onrender.com/api-docs)**

---

## ✨ Features

- 🔐 Autenticación con JWT y roles (admin / operador)
- 📦 Gestión de productos, categorías y proveedores
- 🛒 Registro de compras y ventas con detalle
- 📊 Dashboard con gráficos en tiempo real (Recharts)
- ⚠️ Alertas de stock bajo automáticas
- 📋 Documentación interactiva con Swagger UI
- ☁️ Deploy completo en la nube

---

## 🔐 Acceso demo

| Usuario | Contraseña |
|---------|------------|
| admin   | password   |

## 🛠️ Tech Stack

**Backend**
- Node.js + Express
- SQL Server (Azure) + mssql
- JWT para autenticación
- Swagger / OpenAPI 3.0

**Frontend**
- React 18 + Vite
- React Router
- Axios
- Recharts
- Tailwind CSS

**Infraestructura**
- Base de datos: Microsoft Azure SQL
- Backend: Render
- Frontend: Vercel

---

## 🏗️ Arquitectura

```
┌─────────────────┐     HTTPS      ┌─────────────────┐     TCP 1433    ┌─────────────────┐
│                 │ ─────────────► │                 │ ───────────────► │                 │
│  React + Vite   │                │  Node + Express │                  │  Azure SQL      │
│  (Vercel)       │ ◄───────────── │  (Render)       │ ◄─────────────── │  Server         │
│                 │      JSON      │                 │       Data       │                 │
└─────────────────┘                └─────────────────┘                  └─────────────────┘
```

---

## 🚀 Instalación local

### Prerequisitos
- Node.js 18+
- SQL Server local o acceso a Azure SQL

### Backend

```bash
cd inventario-backend
npm install
cp .env.example .env   # completar variables
npm run dev
```

### Frontend

```bash
cd inventario-frontend
npm install
cp .env.example .env   # completar variables
npm run dev
```

---

## ⚙️ Variables de entorno

### Backend — `.env`

```env
PORT=3000
NODE_ENV=development
DB_HOST=tu_servidor.database.windows.net
DB_PORT=1433
DB_NAME=InventarioDB
DB_USER=tu_usuario
DB_PASSWORD=tu_password
JWT_SECRET=tu_secreto
JWT_EXPIRES_IN=8h
```

### Frontend — `.env`

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 📋 API Docs

La documentación completa de la API está disponible en Swagger UI:

🔗 [https://invensys-zhlj.onrender.com/api-docs](https://invensys-zhlj.onrender.com/api-docs)

Endpoints disponibles:
- `POST /api/auth/login`
- `GET/POST/PUT/DELETE /api/productos`
- `GET/POST/PUT/DELETE /api/categorias`
- `GET/POST/PUT/DELETE /api/proveedores`
- `GET/POST /api/compras`
- `GET/POST /api/ventas`
- `GET /api/stock`
- `GET /api/dashboard`

---

## 👤 Autor

**Sebastian Tevez**  
Analista de Sistemas  
🔗 [LinkedIn](linkedin.com/in/sebastian-tevez-7b702322b)  
🐙 [GitHub](https://github.com/sebastevez91)

---

*Proyecto desarrollado como portfolio profesional — 2024*