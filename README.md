# Vehicle Rental System 

Full-stack vehicle rental project with:

- `backend`: Spring Boot REST API (MongoDB)
- `frontend`: React + Vite dashboard

## What Is Included

- Customer and admin login/register flow
- Vehicle listing and vehicle creation
- Rental booking and return flow
- Booking history and dashboard stats
- Seeded demo users, customers, and vehicles
- Integration tests for service flows

## Tech Stack

### Backend

- Java 17
- Spring Boot 4
- Spring Web MVC
- Spring Data MongoDB
- Spring Validation
- BCrypt password hashing (`spring-security-crypto`)
- Maven Wrapper (`mvnw`, `mvnw.cmd`)

### Frontend

- React 18
- Vite 5

## Project Structure

```text
vehicle-rental-system-with-springboot/
|- backend/
|  |- src/main/java/com/vehiclerental/
|  |  |- controller/   (REST endpoints)
|  |  |- service/      (business logic)
|  |  |- model/        (Mongo documents)
|  |  |- repository/   (Mongo repositories)
|  |  |- dto/          (request/response DTOs)
|  |- src/main/resources/application.properties
|  |- src/test/java/com/vehiclerental/
|- frontend/
|  |- src/App.jsx
|  |- src/styles.css
|  |- vite.config.js
```

## Prerequisites

- JDK 17+
- Node.js 18+ and npm
- MongoDB (local or cloud connection string)

## Configuration

Backend uses `MONGODB_URI`.

- `MONGODB_URI` default is defined in `backend/src/main/resources/application.properties`
- Server port: `8080`

PowerShell example:

```powershell
$env:MONGODB_URI="mongodb://localhost:27017/rentalsysdb"
```

## Run The Project

### 1) Start Backend

```powershell
Set-Location backend
.\mvnw.cmd spring-boot:run
```

Backend starts on `http://localhost:8080`.

### 2) Start Frontend

Open a second terminal:

```powershell
Set-Location frontend
npm install
npm run dev
```

Frontend starts on `http://localhost:5173` and calls backend at `http://localhost:8080`.

## Seed Data And Demo Accounts

On backend startup, if collections are empty, sample data is added.

### Seeded Vehicles

- `1` -> Swift (`2000` per day)
- `2` -> Thar (`4500` per day)
- `3` -> Creta (`3500` per day)

### Seeded Customers

- `1` -> Ayush
- `2` -> Rahul

### Seeded Users

- Admin: `admin@rentall.com` / `admin123`
- Customer: `user@rentall.com` / `user123`
- Customer: `rahul@rentall.com` / `rahul123`

## API Summary

Base URL: `http://localhost:8080`

### Health

- `GET /`

Response:

```text
Vehicle Rental System Running
```

### Auth

- `POST /auth/register`
- `POST /auth/login`

Register request:

```json
{
	"name": "New User",
	"email": "new@rentall.com",
	"phone": "9999999999",
	"password": "secret123"
}
```

Login request:

```json
{
	"email": "user@rentall.com",
	"password": "user123"
}
```

Auth response shape:

```json
{
	"name": "Ayush",
	"email": "user@rentall.com",
	"phone": "8888888888",
	"role": "CUSTOMER",
	"customerId": 1
}
```

### Vehicles

- `GET /vehicles`
- `POST /vehicles`

Create vehicle request:

```json
{
	"name": "City",
	"pricePerDay": 3200,
	"available": true,
	"imageUrl": "https://example.com/car.jpg"
}
```

### Customers

- `GET /customers`

### Rentals

- `GET /rentals`
- `POST /rentals`
- `POST /rentals/{rentalId}/return`

Create rental request:

```json
{
	"vehicleId": 1,
	"customerId": 1,
	"days": 3
}
```

Rental behavior:

- `days` must be at least `1`
- total cost = `price_per_day * days`
- booking marks vehicle unavailable
- return marks rental returned and vehicle available again

## Error Response Format

Errors are returned as:

```json
{
	"timestamp": "2026-04-20T10:00:00",
	"status": 400,
	"error": "days must be at least 1"
}
```

Handled status codes:

- `400` validation and business errors
- `404` not found
- `500` unexpected server error

## Run Tests

From `backend`:

```powershell
.\mvnw.cmd test
```

Tests use an embedded MongoDB setup (`MongoTestSupport`) and test profile properties.

## Notes

- Frontend API base URL is currently set in `frontend/src/App.jsx`
- Vite dev server port is configured in `frontend/vite.config.js`
- Role-based behavior is handled in frontend logic (admin/customer views)
