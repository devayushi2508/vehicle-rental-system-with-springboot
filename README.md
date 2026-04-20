# Vehicle Rental Monorepo

## Contributors
- Ayushi Rani
- shiyabrinta
- pushkar
- utsav

Project is now split into:

- `backend` -> Spring Boot API
- `frontend` -> React (Vite) web app

## Quick Start

Backend:

```powershell
Set-Location backend
.\mvnw.cmd spring-boot:run
```

Frontend:

```powershell
Set-Location frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and calls backend at `http://localhost:8080`.
# Vehicle Rental System (Spring Boot)

Simple REST API for managing vehicles and rentals.

## Tech Stack

- Java 17
- Spring Boot
- Spring Data JPA
- MySQL (local runtime)
- H2 (tests)
- Maven

## Prerequisites

- JDK 17+
- Maven 3.9+ (or use `mvnw`/`mvnw.cmd`)
- MySQL 8+ for local runtime

## Configuration

Application uses environment variables for DB credentials.

- `DB_URL` (default: `jdbc:mysql://localhost:3306/rentalsysdb`)
- `DB_USERNAME` (default: `root`)
- `DB_PASSWORD` (default: empty)

Example (PowerShell):

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/rentalsysdb"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_password"
```

## Database Setup (Local MySQL)

Run SQL scripts manually in MySQL Workbench or CLI:

1. `sql/schema.sql`
2. `sql/data.sql`

## Run the App

Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
./mvnw spring-boot:run
```

Server starts on `http://localhost:8080`.

## Run Tests

```powershell
.\mvnw.cmd test
```

Tests use in-memory H2 database via `application-test.properties`.

## API Endpoints

### Health

- `GET /`

Response:

```text
Vehicle Rental System Running
```

### Vehicles

- `GET /vehicles`

### Customers

- `GET /customers`

### Rentals

- `GET /rentals`
- `POST /rentals`
- `POST /rentals/{rentalId}/return`

Create rental request body:

```json
{
	"vehicleId": 1,
	"customerId": 1,
	"days": 3
}
```

Create rental behavior:

- Validates IDs and `days >= 1`
- Calculates `totalCost = price_per_day * days`
- Marks vehicle unavailable

Return rental behavior:

- Marks rental as returned
- Marks vehicle available again

## Error Handling

Global error handler returns JSON errors for:

- Validation errors (`400`)
- Business rule violations (`400`)
- Not found errors (`404`)
- Unexpected errors (`500`)

Example error response:

```json
{
	"timestamp": "2026-04-17T12:00:00",
	"status": 400,
	"error": "days must be at least 1"
}
```