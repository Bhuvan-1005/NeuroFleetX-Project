# NeuroFleetX

NeuroFleetX is a full-stack fleet management system that provides driver & fleet manager workflows, vehicle tracking, telemetry storage, notifications, and administrative tools. This repository contains the frontend (React) and backend (Spring Boot + MongoDB) services.

---

## Single-source documentation policy

All project documentation must live in this file: `readme.md` at the repository root. Do not add or update any other `.md` files. Future documentation updates should be made only here.

---

## Table of contents

- Features
- Architecture
- Getting started (local)
- Backend (Spring Boot) - run & config
- Frontend (React) - run & config
- Database (MongoDB) & initialization
- API endpoints (summary)
- Authentication & security
- Key components and files
- Troubleshooting
- Contribution / development notes
- License

---

## Features

- User roles: Fleet Manager, Driver, Admin
- Driver signup & authentication (JWT)
- Automatic driver registration in fleet manager portal upon signup
- Vehicle management: add, edit, assign vehicles
- Real-time GPS tracking: browser geolocation + periodic telemetry push
- Map visualization using Leaflet / React-Leaflet
- Trip controls: Start Trip, Take Break, Resume Trip, End Trip
- Notifications & preferences
- Telemetry storage and retrieval (MongoDB)
- Fleet dashboard with driver list, vehicle dropdown, and refresh
- Responsive UI (Tailwind CSS / MUI) and small UX polish

---

## Architecture

- Frontend: React 18, Axios, Tailwind CSS, React-Leaflet, Context API
- Backend: Spring Boot 3.x, Java, REST controllers, services, repositories
- Database: MongoDB for users, drivers, vehicles, telemetry
- Auth: JWT-based authentication handled in backend
- Dev tooling: Maven (backend), npm/yarn (frontend)

---

## Getting started (local)

Prerequisites:

- Java JDK (11+ recommended) for backend
- Maven
- Node.js (16+), npm or yarn for frontend
- MongoDB (local or Atlas)

Quick start (high level):

1. Configure Backend: update `Backend-Java/src/main/resources/application.properties` with your MongoDB connection string and JWT secret.
2. Start MongoDB (or use Atlas). If provided, run `mongodb-init.js` in `Backend-Java` to seed sample data.
3. Build & run backend:
   - cd Backend-Java
   - ./mvnw spring-boot:run (Windows: `mvnw.cmd spring-boot:run`)
4. Run frontend:
   - cd Frontend
   - npm install
   - npm start
5. Open the app in browser (frontend typically on http://localhost:3000). Ensure backend is reachable from the frontend (CORS and ports configured).

For more detailed step-by-step, see the Backend and Frontend sections below.

---

## Backend (Spring Boot)

Location: `Backend-Java`

Main tasks:

- Configure `application.properties` for MongoDB URI and server port
- Run with Maven wrapper for consistent builds: `mvnw spring-boot:run` (Linux/mac) or `mvnw.cmd spring-boot:run` (Windows)

Notable files:

- `src/main/java/com/neurofleetx/NeurofleetxApplication.java` — application entry
- `controller/` — REST controllers (AuthController, DriverController, VehicleController, TelemetryController, NotificationController)
- `service/` — business logic
- `repository/` — MongoDB repositories

Database init:

- `mongodb-init.js` contains sample inserts to seed the database (optional). Run with the mongo shell or replicate the inserts in your MongoDB UI.

Building a jar:

- `mvnw package` then run `java -jar target/*.jar`

---

## Frontend (React)

Location: `Frontend`

Main tasks:

- Install dependencies: `npm install`
- Start dev server: `npm start`

Key components:

- `src/components/LocationTracker.js` — GPS polling & telemetry send
- `src/components/DriverSignup.js` — driver signup flow, vehicle assignment
- `src/pages/DriverDashboard.js` — trip controls, vehicle selector
- `src/context/AuthContext.js` and `src/context/DataContext.js` — global state

Environment config:

- Use `.env` in the frontend root if needed to set `REACT_APP_API_URL` and other env variables.

---

## MongoDB (data)

Primary collections:

- `users` — authentication & roles
- `drivers` — driver profiles, assigned vehicle
- `vehicles` — vehicle metadata and status
- `telemetry` — time-series GPS/telemetry data

Seed and indexes:

- Provide initial vehicles and drivers via `mongodb-init.js` or manual inserts
- Consider indexes on timestamp for telemetry and on vehicleId for efficient lookups

---

## API endpoints (summary)

Note: Adjust endpoints as per current controllers in `Backend-Java/controller`.

- POST /api/auth/signup — register (creates User + Driver if signup is driver)
- POST /api/auth/login — obtain JWT
- GET /api/vehicles — list vehicles
- POST /api/telemetry — submit telemetry (driver client)
- GET /api/drivers — list drivers (admin/fleet)
- PUT /api/drivers/{id}/assign-vehicle — assign vehicle to driver
- Other endpoints: notifications, telemetry queries, vehicle CRUD

---

## Authentication & security

- JWT tokens returned on login and used in Authorization header (`Bearer <token>`)
- Backend validates roles; protect admin/fleet endpoints accordingly
- CORS config present in `CorsConfig.java` (adjust allowed origins in dev/production)

---

## Key developer notes and conventions

- Keep UI state minimal in components; use `DataContext` for shared lists (vehicles, drivers)
- Driver signup flow automatically creates a driver entity so fleet manager sees new drivers
- Trip control flow in the driver UI updates trip status and toggles telemetry sending
- Use Axios interceptors (in frontend) to attach JWT to requests

---

## Troubleshooting

- ERR_CONNECTION_REFUSED from frontend → ensure backend is running and CORS/port are correct
- Vehicles not appearing → confirm `GET /api/vehicles` returns data and frontend `REACT_APP_API_URL` is correct
- Auth errors → verify JWT secret and token expiry settings in backend

---

## Contribution and workflow

- For code changes, create feature branches from `master`, push PRs to `master` in GitHub
- Documentation policy: update only `readme.md` for any docs changes

---

## Commit & push policy used here

This operation removed previous markdown files and added this single `readme.md`. All future documentation edits must be made only in this file.

---

## License

Specify a license here (e.g., MIT). If you want, add `LICENSE` file as needed.

---

If you'd like, I can also:

- Add a short README section for deployment (Docker/Heroku/Azure)
- Generate Postman collection or OpenAPI spec from controllers
- Convert `readme.md` to `README.md` (uppercase) if you prefer the conventional uppercase filename
