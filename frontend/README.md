# Frontend (React + Vite)

This folder contains the React frontend dashboard for the vehicle rental backend.

## Features

- View vehicles, customers, rentals
- Create rental
- Return rental
- View quick stats (total vehicles, available vehicles, active rentals)

## Run backend first

From repository root:

```powershell
Set-Location backend
.\mvnw.cmd spring-boot:run
```

Backend URL used by frontend: `http://localhost:8080`

## Run frontend

From repository root:

```powershell
Set-Location frontend
npm install
npm run dev
```

Open `http://localhost:5173`

## Build frontend

```powershell
Set-Location frontend
npm run build
```

## Notes

- API base URL is in `src/App.jsx` as `API_BASE`.
- Vite dev port is configured to `5173` in `vite.config.js`.
