# Vehicle Rental Backend (MongoDB)

Simple REST API for managing vehicles, customers, and rentals with MongoDB.

## Tech Stack

- Java 17
- Spring Boot
- Spring Data MongoDB
- MongoDB (local runtime)
- Embedded MongoDB for tests
- Maven

## Prerequisites

- JDK 17+
- Maven 3.9+ (or use `mvnw`/`mvnw.cmd`)
- MongoDB 6+ for local runtime

## Configuration

Application uses an environment variable for MongoDB connection.

- `MONGODB_URI` (default: `mongodb://localhost:27017/rentalsysdb`)

Example (PowerShell):

```powershell
$env:MONGODB_URI="mongodb://localhost:27017/rentalsysdb"
```

## Seed Data

When the backend starts, it inserts sample vehicles and customers if collections are empty.

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

Tests use embedded MongoDB.

## API Endpoints

### Health

- `GET /`

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

Global error handler returns JSON errors for validation, business rule, not found, and unexpected failures.