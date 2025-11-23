# TinyLink Backend

A modern URL shortening service built with **Node.js**, **Express**, and **MongoDB**, providing secure short links, user authentication, analytics, and click tracking.

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Installation](#installation)  
- [Environment Variables](#environment-variables)  
- [API Routes](#api-routes)  
- [Usage](#usage)  
- [Folder Structure](#folder-structure)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Features

- User registration and login with **JWT authentication**  
- Create, update, and delete short URLs  
- Custom short codes with uniqueness validation  
- Public redirect with click tracking  
- Detailed analytics per user:
  - Total links  
  - Total clicks  
  - Most popular link  
  - Monthly click data for graphs  
- Full **REST API** structure for frontend integration  
- Secure routes with authentication middleware  

---

## Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Mongoose)  
- **Authentication:** JWT, bcrypt  
- **Middleware:** CORS, Express JSON parser  

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/tinylink-backend.git
cd tinylink-backend
```
2. Install dependencies:

```bash
npm install
```

3. Setup environment variables (see next section).

```bash
npm run dev
```
Server will run at http://localhost:5000.

## Environment Variables
  Create a .env file in the root folder:

  ```bash
  PORT=5000
  MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/tinylink
  JWT_SECRET=your_jwt_secret
  DB_HOST=localhost
  DB_USER=root
  DB_NAME=tinylink
  ```

## API Routes

  # Authentication
  | Method | Endpoint         | Description            | Protected |
  | ------ | ---------------- | ---------------------- | --------- |
  | POST   | `/auth/register` | Register new user      | No        |
  | POST   | `/auth/login`    | Login user and get JWT | No        |


  # Short Links
  | Method | Endpoint              | Description                   | Protected |
  | ------ | --------------------- | ----------------------------- | --------- |
  | POST   | `/shortlink`          | Create a new short URL        | Yes       |
  | GET    | `/shortlink/my-links` | Get all user short links      | Yes       |
  | GET    | `/shortlink/:id`      | Get a single link by ID       | Yes       |
  | PUT    | `/shortlink/:id`      | Update a short link           | Yes       |
  | DELETE | `/shortlink/:id`      | Delete a short link           | Yes       |
  | GET    | `/shortlink/r/:code`  | Redirect to long URL (public) | No        |


## Usage
 # 1.Creating a Short Link:
  ``` {
    "longUrl": "https://www.example.com",
    "shortCode": "mycode",
    "title": "Example Link"87
  } 
  ```

2. Redirect:
  Access http://localhost:5000/shortlink/r/mycode to redirect and track clicks.
3. Analytics:
  Use /shortlink/my-links to get stats including total clicks, latest activity, and most popular link.


## Folder Structure

tinylink-backend/
│
├─ controllers/
│   ├─ authController.js
│   └─ shortLinkController.js
│
├─ middleware/
│   └─ authMiddleware.js
│
├─ models/
│   ├─ ShortLinkModel.js
│   └─ UserModel.js
│
├─ routers/
│   ├─ authRoutes.js
│   └─ shortLinkRoute.js
│
├─ .env
├─ package.json
└─ server.js


