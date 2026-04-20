import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8080";
const SESSION_KEY = "vehicle-rental-session";

const LOGIN_PRESETS = {
  user: { email: "user@rentall.com", password: "user123" },
  admin: { email: "admin@rentall.com", password: "admin123" },
};

const NAV_ITEMS = [
  { key: "home", label: "Home" },
  { key: "vehicles", label: "Vehicles" },
  { key: "history", label: "Booking History" },
  { key: "admin", label: "Admin" },
];

const VEHICLE_ART = [
  "linear-gradient(135deg, #6ee7f9, #2563eb)",
  "linear-gradient(135deg, #34d399, #0f766e)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #a78bfa, #7c3aed)",
  "linear-gradient(135deg, #fb7185, #c026d3)",
];

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function readSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const body = await response.json();
      message = body.error || body.message || message;
    } catch (_error) {
      // Keep fallback message.
    }

    throw new Error(message);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return null;
}

function Spinner() {
  return <div className="spinner" aria-label="Loading" />;
}

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          className={`toast toast-${toast.type}`}
          onClick={() => onDismiss(toast.id)}
        >
          <strong>{toast.type === "success" ? "Success" : toast.type === "error" ? "Error" : "Info"}</strong>
          <span>{toast.message}</span>
        </button>
      ))}
    </div>
  );
}

function Badge({ children, tone }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function VehicleCard({ vehicle, activeRental, canBook, onBook, onReturn, index }) {
  const isAvailable = Boolean(vehicle.available);
  const vehicleArt = VEHICLE_ART[index % VEHICLE_ART.length];

  return (
    <article className="vehicle-card">
      <div className="vehicle-media" style={{ background: vehicle.imageUrl ? `url(${vehicle.imageUrl}) center/cover no-repeat` : vehicleArt }}>
        <div className="vehicle-badge">{vehicle.name ? vehicle.name.slice(0, 2).toUpperCase() : "VR"}</div>
      </div>
      <div className="vehicle-body">
        <div className="vehicle-head">
          <h3>{vehicle.name}</h3>
          <Badge tone={isAvailable ? "ok" : "danger"}>{isAvailable ? "Available" : "Rented"}</Badge>
        </div>
        <p className="muted">Price per day</p>
        <div className="price-row">
          <strong>{currency(vehicle.price_per_day)}</strong>
          <span>{vehicle.id ? `#${vehicle.id}` : ""}</span>
        </div>
        <div className="card-actions">
          {isAvailable ? (
            <button type="button" className="btn btn-primary" onClick={onBook} disabled={!canBook}>
              {canBook ? "Book Now" : "Login to Book"}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => activeRental && onReturn(activeRental.rentalId)}
              disabled={!activeRental}
            >
              Return
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const [session, setSession] = useState(() => readSession());
  const [view, setView] = useState("home");
  const [authMode, setAuthMode] = useState("login");
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [bookingVehicle, setBookingVehicle] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loginForm, setLoginForm] = useState(LOGIN_PRESETS.user);
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [bookingForm, setBookingForm] = useState({ name: "", phone: "", days: "1" });
  const [adminVehicleForm, setAdminVehicleForm] = useState({
    name: "",
    pricePerDay: "",
    available: true,
    imageUrl: "",
    imageName: "",
  });

  useEffect(() => {
    if (session) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      setBookingForm((current) => ({
        ...current,
        name: session.name || current.name,
        phone: session.phone || current.phone,
      }));
    }
  }, [session]);

  useEffect(() => {
    refreshData(false);
  }, []);

  function pushToast(type, message) {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }

  async function refreshData(showToast = true) {
    setLoading(true);

    try {
      const [vehicleData, customerData, rentalData] = await Promise.all([
        apiRequest("/vehicles"),
        apiRequest("/customers"),
        apiRequest("/rentals"),
      ]);

      setVehicles(vehicleData);
      setCustomers(customerData);
      setRentals(rentalData);

      if (showToast) {
        pushToast("success", "Data refreshed successfully.");
      }
    } catch (error) {
      pushToast("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const availableVehicles = vehicles.filter((vehicle) => vehicle.available).length;
    const activeRentals = rentals.filter((rental) => !rental.returned).length;

    return {
      totalVehicles: vehicles.length,
      availableVehicles,
      activeRentals,
      totalCustomers: customers.length,
    };
  }, [vehicles, rentals, customers]);

  const activeRentalsByVehicleId = useMemo(() => {
    const map = new Map();
    rentals.forEach((rental) => {
      if (!rental.returned) {
        map.set(rental.vehicleId, rental);
      }
    });
    return map;
  }, [rentals]);

  const visibleVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      if (activeFilter === "available" && !vehicle.available) {
        return false;
      }
      return true;
    });
  }, [vehicles, activeFilter]);

  const historyRows = useMemo(() => {
    return rentals
      .slice()
      .sort((a, b) => (b.rentalId || 0) - (a.rentalId || 0))
      .map((rental) => {
        const customer = customers.find((item) => item.id === rental.customerId);
        const vehicle = vehicles.find((item) => item.id === rental.vehicleId);

        return {
          ...rental,
          customerName: customer?.name || `Customer #${rental.customerId}`,
          vehicleName: vehicle?.name || `Vehicle #${rental.vehicleId}`,
        };
      });
  }, [rentals, customers, vehicles]);

  const currentHistoryRows = useMemo(() => {
    if (!session || session.role === "ADMIN") {
      return historyRows;
    }

    return historyRows.filter((row) => row.customerId === session.customerId);
  }, [historyRows, session]);

  const dashboardStats = useMemo(() => {
    const totalRevenue = rentals.reduce((sum, rental) => sum + Number(rental.totalCost || 0), 0);
    const averageBookingDays = rentals.length
      ? (rentals.reduce((sum, rental) => sum + Number(rental.days || 0), 0) / rentals.length).toFixed(1)
      : "0.0";
    const utilizationRate = stats.totalVehicles
      ? Math.round((stats.activeRentals / stats.totalVehicles) * 100)
      : 0;

    const now = new Date();
    const monthRevenue = rentals.reduce((sum, rental) => {
      if (!rental.createdAt) {
        return sum;
      }

      const createdAt = new Date(rental.createdAt);
      if (Number.isNaN(createdAt.getTime())) {
        return sum;
      }

      if (createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()) {
        return sum + Number(rental.totalCost || 0);
      }

      return sum;
    }, 0);

    return {
      totalRevenue,
      monthRevenue,
      averageBookingDays,
      utilizationRate,
    };
  }, [rentals, stats]);

  const activeTripRows = useMemo(() => {
    const oneDayMs = 24 * 60 * 60 * 1000;

    return historyRows
      .filter((row) => !row.returned)
      .map((row) => {
        let dueDate = null;
        if (row.createdAt) {
          const createdAt = new Date(row.createdAt);
          if (!Number.isNaN(createdAt.getTime())) {
            dueDate = new Date(createdAt);
            dueDate.setDate(dueDate.getDate() + Number(row.days || 0));
          }
        }

        const remainingMs = dueDate ? dueDate.getTime() - Date.now() : null;

        let statusLabel = "Scheduled";
        let statusTone = "ok";
        if (remainingMs === null) {
          statusLabel = "No due date";
          statusTone = "info";
        } else if (remainingMs < 0) {
          statusLabel = "Overdue";
          statusTone = "danger";
        } else if (remainingMs < oneDayMs) {
          statusLabel = "Due in 24h";
          statusTone = "warn";
        }

        return {
          ...row,
          dueDate,
          statusLabel,
          statusTone,
        };
      })
      .sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return a.dueDate.getTime() - b.dueDate.getTime();
        }
        if (a.dueDate) {
          return -1;
        }
        if (b.dueDate) {
          return 1;
        }
        return 0;
      });
  }, [historyRows]);

  const overdueCount = activeTripRows.filter((trip) => trip.statusTone === "danger").length;
  const dueSoonCount = activeTripRows.filter((trip) => trip.statusTone === "warn").length;

  async function handleLoginSubmit(event) {
    event.preventDefault();

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      });

      setSession(data);
      setView(data.role === "ADMIN" ? "admin" : "vehicles");
      pushToast("success", `Welcome back, ${data.name}.`);
    } catch (error) {
      pushToast("error", error.message);
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();

    try {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(registerForm),
      });

      setSession(data);
      setView("vehicles");
      setAuthMode("login");
      setLoginForm({ email: registerForm.email, password: registerForm.password });
      setRegisterForm({ name: "", email: "", phone: "", password: "" });
      pushToast("success", `Account created for ${data.name}.`);
    } catch (error) {
      pushToast("error", error.message);
    }
  }

  async function handleCreateBooking(event) {
    event.preventDefault();

    if (!session || session.role !== "CUSTOMER") {
      pushToast("error", "Please log in with a customer account first.");
      return;
    }

    try {
      await apiRequest("/rentals", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: bookingVehicle.id,
          customerId: session.customerId,
          days: Number(bookingForm.days),
        }),
      });

      setBookingVehicle(null);
      setView("history");
      pushToast("success", "Booking confirmed successfully.");
      await refreshData(false);
    } catch (error) {
      pushToast("error", error.message);
    }
  }

  async function handleReturnRental(rentalId) {
    try {
      await apiRequest(`/rentals/${rentalId}/return`, {
        method: "POST",
      });

      pushToast("success", "Vehicle returned successfully.");
      await refreshData(false);
    } catch (error) {
      pushToast("error", error.message);
    }
  }

  async function handleAddVehicle(event) {
    event.preventDefault();

    try {
      await apiRequest("/vehicles", {
        method: "POST",
        body: JSON.stringify({
          name: adminVehicleForm.name,
          pricePerDay: Number(adminVehicleForm.pricePerDay),
          available: Boolean(adminVehicleForm.available),
          imageUrl: adminVehicleForm.imageUrl,
        }),
      });

      setAdminVehicleForm({ name: "", pricePerDay: "", available: true, imageUrl: "", imageName: "" });
      pushToast("success", "Vehicle added successfully.");
      await refreshData(false);
    } catch (error) {
      pushToast("error", error.message);
    }
  }

  function handleAdminImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      pushToast("error", "Please upload a valid image file.");
      return;
    }

    const maxFileSize = 2 * 1024 * 1024;
    if (file.size > maxFileSize) {
      pushToast("error", "Image size should be 2MB or less.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = String(reader.result || "");
      setAdminVehicleForm((current) => ({
        ...current,
        imageUrl: imageData,
        imageName: file.name,
      }));
      pushToast("success", "Image uploaded.");
    };
    reader.onerror = () => {
      pushToast("error", "Could not read image file.");
    };
    reader.readAsDataURL(file);
  }

  function openBooking(vehicle) {
    if (!session || session.role !== "CUSTOMER") {
      setView("home");
      pushToast("error", "Login as a customer to book a vehicle.");
      return;
    }

    setBookingVehicle(vehicle);
    setBookingForm({
      name: session.name || "",
      phone: session.phone || "",
      days: "1",
    });
  }

  function logout() {
    setSession(null);
    setView("home");
    pushToast("success", "Logged out successfully.");
  }

  const currentUserLabel = session ? `${session.name} · ${session.role}` : "Guest";
  const bookingPrice = bookingVehicle ? Number(bookingVehicle.price_per_day || 0) * Number(bookingForm.days || 0) : 0;

  return (
    <div className="app-shell">
      <div className="bg-orb orb-one" />
      <div className="bg-orb orb-two" />

      <header className="topbar">
        <button type="button" className="brand" onClick={() => setView("home")}> 
          <span className="brand-mark">VR</span>
          <span>
            <strong>Vehicle Rental</strong>
            <small>Rent your ride today</small>
          </span>
        </button>

        <nav className="nav-links" aria-label="Primary">
          {NAV_ITEMS.filter((item) => item.key !== "admin" || session?.role === "ADMIN").map((item) => (
            <button
              key={item.key}
              type="button"
              className={`nav-link ${view === item.key ? "active" : ""}`}
              onClick={() => setView(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="topbar-actions">
          <span className="user-pill">{currentUserLabel}</span>
          {session ? (
            <button type="button" className="btn btn-ghost" onClick={logout}>
              Logout
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setView("home")}> 
              Login
            </button>
          )}
        </div>
      </header>

      <main className="page-shell">
        {view === "home" && (
          <section className={`hero-grid reveal ${session ? "hero-grid-auth" : ""}`}>
            <article className="hero-card">
              <div className="hero-tag">Rent Your Ride Today</div>
              <h1>
                {session
                  ? `Welcome back, ${session.name}. Fleet operations are live.`
                  : "Modern rental experience with booking, history, and admin control."}
              </h1>
              <p>
                {session
                  ? "Monitor availability, active trips, returns, and demand from this control center."
                  : "Browse vehicles, book instantly, track returns, and manage the fleet from one polished dashboard."}
              </p>

              <div className="hero-actions">
                <button type="button" className="btn btn-primary" onClick={() => setView("vehicles")}>
                  Explore Vehicles
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setView("history")}>
                  Booking History
                </button>
                {session?.role === "ADMIN" && (
                  <button type="button" className="btn btn-ghost" onClick={() => setView("admin")}>
                    Open Admin Panel
                  </button>
                )}
              </div>

              {session ? (
                <div className="quick-kpis">
                  <div className="quick-kpi">
                    <span>Fleet utilization</span>
                    <strong>{dashboardStats.utilizationRate}%</strong>
                  </div>
                  <div className="quick-kpi">
                    <span>Monthly revenue</span>
                    <strong>{currency(dashboardStats.monthRevenue)}</strong>
                  </div>
                  <div className="quick-kpi">
                    <span>Avg booking days</span>
                    <strong>{dashboardStats.averageBookingDays}</strong>
                  </div>
                </div>
              ) : (
                <div className="feature-grid">
                  {[
                    ["Fast Booking", "Reserve in a few clicks with live pricing."],
                    ["Best Price", "Transparent daily rates with no hidden charges."],
                    ["Easy Returns", "Return vehicles directly from the dashboard."],
                    ["Admin Ready", "Add vehicles and manage availability from one place."],
                  ].map(([title, text]) => (
                    <div className="feature-card" key={title}>
                      <strong>{title}</strong>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              )}
            </article>

            {!session && (
              <aside className="login-card">
                <div className="panel-title">
                  <div>
                    <h2>{authMode === "login" ? "Login" : "Create account"}</h2>
                    <p>{authMode === "login" ? "Use email/password to enter as customer or admin." : "Register as a customer account."}</p>
                  </div>
                  <div className="auth-toggle">
                    <button type="button" className={`chip ${authMode === "login" ? "active" : ""}`} onClick={() => setAuthMode("login")}>
                      Sign in
                    </button>
                    <button type="button" className={`chip ${authMode === "register" ? "active" : ""}`} onClick={() => setAuthMode("register")}>
                      Sign up
                    </button>
                  </div>
                </div>

                {authMode === "login" ? (
                  <form className="form-stack" onSubmit={handleLoginSubmit}>
                    <label>
                      Email
                      <input
                        type="email"
                        value={loginForm.email}
                        onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                        placeholder="user@rentall.com"
                        required
                      />
                    </label>
                    <label>
                      Password
                      <input
                        type="password"
                        value={loginForm.password}
                        onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                        placeholder="••••••••"
                        required
                      />
                    </label>

                    <button type="submit" className="btn btn-primary btn-full">
                      Login
                    </button>
                  </form>
                ) : (
                  <form className="form-stack" onSubmit={handleRegisterSubmit}>
                    <label>
                      Name
                      <input
                        type="text"
                        value={registerForm.name}
                        onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))}
                        placeholder="Your name"
                        required
                      />
                    </label>
                    <label>
                      Email
                      <input
                        type="email"
                        value={registerForm.email}
                        onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                        placeholder="you@example.com"
                        required
                      />
                    </label>
                    <label>
                      Phone
                      <input
                        type="tel"
                        value={registerForm.phone}
                        onChange={(event) => setRegisterForm((current) => ({ ...current, phone: event.target.value }))}
                        placeholder="9999999999"
                        required
                      />
                    </label>
                    <label>
                      Password
                      <input
                        type="password"
                        value={registerForm.password}
                        onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                        placeholder="Create a password"
                        required
                      />
                    </label>

                    <button type="submit" className="btn btn-primary btn-full">
                      Create Account
                    </button>
                  </form>
                )}

                <div className="hint-box">
                  <span>Demo logins</span>
                  <small>Admin: admin@rentall.com / admin123</small>
                  <small>User: user@rentall.com / user123</small>
                </div>
              </aside>
            )}

            {session && (
              <aside className="operations-card">
                <div className="panel-title">
                  <div>
                    <h2>Operations pulse</h2>
                    <p>Today&apos;s ground status</p>
                  </div>
                </div>
                <div className="ops-grid-list">
                  <div className="ops-line">
                    <span>Vehicles ready</span>
                    <strong>{stats.availableVehicles}</strong>
                  </div>
                  <div className="ops-line">
                    <span>Active trips</span>
                    <strong>{stats.activeRentals}</strong>
                  </div>
                  <div className="ops-line danger">
                    <span>Overdue returns</span>
                    <strong>{overdueCount}</strong>
                  </div>
                  <div className="ops-line warn">
                    <span>Due in next 24h</span>
                    <strong>{dueSoonCount}</strong>
                  </div>
                </div>
              </aside>
            )}
          </section>
        )}

        {view === "vehicles" && (
          <section className="content-block reveal">
            <div className="section-head">
              <div>
                <p className="section-kicker">Vehicles</p>
                <h2>Available fleet</h2>
              </div>
              <div className="filter-group">
                <button type="button" className={`chip ${activeFilter === "all" ? "active" : ""}`} onClick={() => setActiveFilter("all")}>
                  All
                </button>
                <button type="button" className={`chip ${activeFilter === "available" ? "active" : ""}`} onClick={() => setActiveFilter("available")}>
                  Available
                </button>
              </div>
            </div>

            <div className="stats-row">
              <div className="mini-stat">
                <span>Total</span>
                <strong>{stats.totalVehicles}</strong>
              </div>
              <div className="mini-stat">
                <span>Available</span>
                <strong>{stats.availableVehicles}</strong>
              </div>
              <div className="mini-stat">
                <span>Rented</span>
                <strong>{stats.activeRentals}</strong>
              </div>
            </div>

            <div className="cards-grid">
              {visibleVehicles.map((vehicle, index) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  index={index}
                  activeRental={activeRentalsByVehicleId.get(vehicle.id)}
                  canBook={Boolean(session && session.role === "CUSTOMER")}
                  onBook={() => openBooking(vehicle)}
                  onReturn={handleReturnRental}
                />
              ))}
            </div>
          </section>
        )}

        {view === "history" && (
          <section className="content-block reveal">
            <div className="section-head">
              <div>
                <p className="section-kicker">Booking History</p>
                <h2>{session?.role === "CUSTOMER" ? "Your rentals" : "All rentals"}</h2>
              </div>
              <button type="button" className="btn btn-ghost" onClick={() => refreshData(true)}>
                Refresh
              </button>
            </div>

            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Days</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentHistoryRows.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-row">
                        No bookings yet.
                      </td>
                    </tr>
                  ) : (
                    currentHistoryRows.map((rental) => (
                      <tr key={rental.rentalId}>
                        <td>{rental.customerName}</td>
                        <td>{rental.vehicleName}</td>
                        <td>{rental.days}</td>
                        <td>{currency(rental.totalCost)}</td>
                        <td>{formatDate(rental.createdAt)}</td>
                        <td>
                          <Badge tone={rental.returned ? "ok" : "danger"}>{rental.returned ? "Returned" : "Active"}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {view === "admin" && session?.role === "ADMIN" && (
          <section className="admin-grid reveal">
            <article className="content-block">
              <div className="section-head">
                <div>
                  <p className="section-kicker">Admin</p>
                  <h2>Add vehicle</h2>
                </div>
              </div>

              <form className="form-stack" onSubmit={handleAddVehicle}>
                <label>
                  Vehicle name
                  <input
                    type="text"
                    required
                    value={adminVehicleForm.name}
                    onChange={(event) =>
                      setAdminVehicleForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Thar"
                  />
                </label>
                <label>
                  Price per day
                  <input
                    type="number"
                    min="1"
                    required
                    value={adminVehicleForm.pricePerDay}
                    onChange={(event) =>
                      setAdminVehicleForm((current) => ({ ...current, pricePerDay: event.target.value }))
                    }
                    placeholder="4500"
                  />
                </label>
                <label>
                  Upload vehicle image
                  <input type="file" accept="image/*" onChange={handleAdminImageUpload} />
                </label>
                {adminVehicleForm.imageName && (
                  <div className="upload-meta">
                    <span>{adminVehicleForm.imageName}</span>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() =>
                        setAdminVehicleForm((current) => ({ ...current, imageUrl: "", imageName: "" }))
                      }
                    >
                      Remove image
                    </button>
                  </div>
                )}
                {adminVehicleForm.imageUrl && (
                  <div className="admin-image-preview">
                    <img src={adminVehicleForm.imageUrl} alt="Vehicle preview" />
                  </div>
                )}
                <label>
                  Image URL (optional)
                  <input
                    type="url"
                    value={adminVehicleForm.imageUrl}
                    onChange={(event) =>
                      setAdminVehicleForm((current) => ({
                        ...current,
                        imageUrl: event.target.value,
                        imageName: event.target.value ? "From URL" : "",
                      }))
                    }
                    placeholder="https://..."
                  />
                </label>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={adminVehicleForm.available}
                    onChange={(event) =>
                      setAdminVehicleForm((current) => ({ ...current, available: event.target.checked }))
                    }
                  />
                  Available on add
                </label>

                <button type="submit" className="btn btn-primary btn-full">
                  Add Vehicle
                </button>
              </form>
            </article>

            <article className="content-block">
              <div className="section-head">
                <div>
                  <p className="section-kicker">Fleet Control</p>
                  <h2>Vehicle list</h2>
                </div>
              </div>

              <div className="table-card compact">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Price / Day</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td>{vehicle.name}</td>
                        <td>{currency(vehicle.price_per_day)}</td>
                        <td>
                          <Badge tone={vehicle.available ? "ok" : "danger"}>
                            {vehicle.available ? "Available" : "Rented"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        )}

        {view === "admin" && session?.role !== "ADMIN" && (
          <section className="content-block reveal">
            <div className="empty-state">
              <h2>Admin access required</h2>
              <p>Login with the admin account to manage vehicles.</p>
            </div>
          </section>
        )}

        {view === "home" && (
          <section className="content-block reveal delay-1">
            <div className="section-head">
              <div>
                <p className="section-kicker">Live Overview</p>
                <h2>{session ? "Operations command center" : "System status"}</h2>
              </div>
              <button type="button" className="btn btn-ghost" onClick={() => refreshData(true)}>
                Sync backend
              </button>
            </div>

            {session ? (
              <>
                <div className="kpi-grid">
                  <article className="kpi-card">
                    <span>Total revenue</span>
                    <strong>{currency(dashboardStats.totalRevenue)}</strong>
                  </article>
                  <article className="kpi-card">
                    <span>Vehicles in fleet</span>
                    <strong>{stats.totalVehicles}</strong>
                  </article>
                  <article className="kpi-card">
                    <span>Customer base</span>
                    <strong>{stats.totalCustomers}</strong>
                  </article>
                  <article className="kpi-card">
                    <span>Utilization rate</span>
                    <strong>{dashboardStats.utilizationRate}%</strong>
                  </article>
                </div>

                <div className="ops-panels">
                  <article className="table-card">
                    <div className="panel-inset-head">
                      <h3>Active trips monitor</h3>
                      <span>{activeTripRows.length} running</span>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Vehicle</th>
                          <th>Due by</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeTripRows.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="empty-row">
                              No active trips right now.
                            </td>
                          </tr>
                        ) : (
                          activeTripRows.slice(0, 6).map((trip) => (
                            <tr key={`active-${trip.rentalId}`}>
                              <td>{trip.customerName}</td>
                              <td>{trip.vehicleName}</td>
                              <td>{trip.dueDate ? formatDate(trip.dueDate.toISOString()) : "—"}</td>
                              <td>
                                <Badge tone={trip.statusTone}>{trip.statusLabel}</Badge>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </article>

                  <article className="content-block ops-alerts">
                    <div className="panel-inset-head">
                      <h3>Real-world checks</h3>
                    </div>
                    <div className="alert-list">
                      <div className="alert-item">
                        <span className="dot ok" />
                        <div>
                          <strong>Vehicle readiness</strong>
                          <p>{stats.availableVehicles} vehicles are available for immediate dispatch.</p>
                        </div>
                      </div>
                      <div className="alert-item">
                        <span className="dot warn" />
                        <div>
                          <strong>Return desk watch</strong>
                          <p>{dueSoonCount} rentals are due within the next 24 hours.</p>
                        </div>
                      </div>
                      <div className="alert-item">
                        <span className="dot danger" />
                        <div>
                          <strong>Escalation queue</strong>
                          <p>{overdueCount} rentals need immediate follow-up from support staff.</p>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </>
            ) : (
              <div className="stats-row">
                <div className="mini-stat">
                  <span>Customers</span>
                  <strong>{stats.totalCustomers}</strong>
                </div>
                <div className="mini-stat">
                  <span>Vehicles</span>
                  <strong>{stats.totalVehicles}</strong>
                </div>
                <div className="mini-stat">
                  <span>Rentals</span>
                  <strong>{rentals.length}</strong>
                </div>
              </div>
            )}
          </section>
        )}

        <footer className="footer">
          <span>Vehicle Rental System</span>
          <span>Professional frontend + login + admin dashboard</span>
        </footer>
      </main>

      {bookingVehicle && (
        <div className="modal-backdrop" role="presentation" onClick={() => setBookingVehicle(null)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="section-kicker">Booking Form</p>
                <h2>{bookingVehicle.name}</h2>
              </div>
              <button type="button" className="icon-btn" onClick={() => setBookingVehicle(null)}>
                ×
              </button>
            </div>

            <form className="form-stack" onSubmit={handleCreateBooking}>
              <label>
                Name
                <input
                  type="text"
                  value={bookingForm.name}
                  onChange={(event) =>
                    setBookingForm((current) => ({ ...current, name: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Phone
                <input
                  type="tel"
                  value={bookingForm.phone}
                  onChange={(event) =>
                    setBookingForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Days
                <input
                  type="number"
                  min="1"
                  value={bookingForm.days}
                  onChange={(event) =>
                    setBookingForm((current) => ({ ...current, days: event.target.value }))
                  }
                  required
                />
              </label>

              <div className="price-strip">
                <span>Live price</span>
                <strong>{currency(bookingPrice)}</strong>
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay" aria-live="polite">
          <div className="loading-card">
            <Spinner />
            <span>Syncing data...</span>
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
    </div>
  );
}
