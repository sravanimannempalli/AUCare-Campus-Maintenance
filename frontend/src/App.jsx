
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "http://localhost:8080/api/complaints";
const AUTH_API = "http://localhost:8080/api/auth";
const STATUSES = ["Pending", "In Progress", "Resolved"];

const EMPTY_FORM = {
  title: "",
  category: "Electrical",
  location: "",
  description: "",
  priority: "Medium",
};

function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const isAdmin = user?.role === "ADMIN";

  async function loadComplaints() {
    try {
      const response = await fetch(API, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? "Your session has expired. Please log in again."
            : "Could not load complaints."
        );
      }

      setComplaints(await response.json());
    } catch (error) {
      setMessage(
        error.message ||
          "Cannot connect to the backend. Make sure Spring Boot is running."
      );
    }
  }

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch(`${AUTH_API}/me`, {
          credentials: "include",
        });

        if (response.ok) {
          const currentUser = await response.json();
          setUser(currentUser);
        }
      } catch {
        // The user may not be logged in yet.
      } finally {
        setCheckingSession(false);
      }
    }

    checkSession();
  }, []);

  useEffect(() => {
    if (user) {
      loadComplaints();
    } else {
      setComplaints([]);
    }
  }, [user]);

  async function handleAuth(event) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthMessage("");

    const isRegister = authMode === "register";
    const endpoint = isRegister ? "register" : "login";

    try {
      const response = await fetch(`${AUTH_API}/${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isRegister
            ? authForm
            : {
                email: authForm.email,
                password: authForm.password,
              }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      if (isRegister) {
        setAuthMode("login");
        setAuthForm({
          name: "",
          email: authForm.email,
          password: "",
        });
        setAuthMessage(
          "Registration successful! Please log in with your new account."
        );
      } else {
        // Fetch the session user from the backend.
        const meResponse = await fetch(`${AUTH_API}/me`, {
          credentials: "include",
        });

        if (!meResponse.ok) {
          throw new Error(
            "Login succeeded, but the session could not be verified. Please try again."
          );
        }

        const currentUser = await meResponse.json();
        setUser(currentUser);
        setMessage("");
      }
    } catch (error) {
      setAuthMessage(
        error.message || "Cannot connect to the backend."
      );
    } finally {
      setAuthLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch(`${AUTH_API}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      setComplaints([]);
      setForm({ ...EMPTY_FORM });
      setMessage("");
      setAuthMessage("");
      setAuthMode("login");
    }
  }

  async function submitComplaint(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(API, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? "Please log in again to submit a complaint."
            : "Submission failed."
        );
      }

      setMessage("Complaint submitted successfully!");
      setForm({ ...EMPTY_FORM });
      await loadComplaints();
    } catch (error) {
      setMessage(
        error.message || "Submission failed. Check the backend and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    setMessage("");

    try {
      const response = await fetch(`${API}/${id}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 403
            ? "Only an Admin can update complaint status."
            : "Status update failed."
        );
      }

      setMessage(`Complaint #${id} updated to ${status}.`);
      await loadComplaints();
    } catch (error) {
      setMessage(error.message || "Status update failed.");
    }
  }

  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();

    return complaints.filter((c) => {
      const matchesSearch =
        !query ||
        String(c.id).includes(query) ||
        [c.title, c.location, c.description, c.category].some(
          (value) => (value || "").toLowerCase().includes(query)
        );

      return (
        matchesSearch &&
        (statusFilter === "All" || c.status === statusFilter) &&
        (categoryFilter === "All" || c.category === categoryFilter) &&
        (priorityFilter === "All" || c.priority === priorityFilter)
      );
    });
  }, [complaints, search, statusFilter, categoryFilter, priorityFilter]);

  const pending = complaints.filter((c) => c.status === "Pending").length;
  const progress = complaints.filter(
    (c) => c.status === "In Progress"
  ).length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;

  if (checkingSession) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand auth-brand"><span>✦</span> AUCare</div>
          <p>Checking your session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand auth-brand"><span>✦</span> AUCare</div>
          <p className="eyebrow">SMART CAMPUS SERVICES</p>

          <h1>
            {authMode === "login"
              ? "Welcome back"
              : "Create your account"}
          </h1>

          <p className="auth-description">
            {authMode === "login"
              ? "Sign in to report issues and track campus maintenance."
              : "Register as a student to get started with AUCare."}
          </p>

          <form onSubmit={handleAuth} className="auth-form">
            {authMode === "register" && (
              <label>
                Full name
                <input
                  required
                  maxLength={100}
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={authForm.name}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, name: e.target.value })
                  }
                />
              </label>
            )}

            <label>
              Email address
              <input
                required
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={authForm.email}
                onChange={(e) =>
                  setAuthForm({ ...authForm, email: e.target.value })
                }
              />
            </label>

            <label>
              Password
              <input
                required
                type="password"
                minLength={8}
                autoComplete={
                  authMode === "login" ? "current-password" : "new-password"
                }
                placeholder="At least 8 characters"
                value={authForm.password}
                onChange={(e) =>
                  setAuthForm({ ...authForm, password: e.target.value })
                }
              />
            </label>

            {authMessage && (
              <p className="message" role="status">
                {authMessage}
              </p>
            )}

            <button className="submit-btn" disabled={authLoading}>
              {authLoading
                ? "Please wait..."
                : authMode === "login"
                  ? "Sign In →"
                  : "Create Account →"}
            </button>
          </form>

          <p className="auth-switch">
            {authMode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              className="text-btn"
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
                setAuthMessage("");
              }}
            >
              {authMode === "login" ? "Register" : "Sign in"}
            </button>
          </p>

          <p className="auth-note">
            New registrations are assigned the Student role.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><span>✦</span> AUCare</div>
        <p className="nav-label">WORKSPACE</p>
        <a className="nav-item active" href="#dashboard">▦ &nbsp; Dashboard</a>
        {!isAdmin && (
          <a className="nav-item" href="#submit">＋ &nbsp; Submit Complaint</a>
        )}
        <a className="nav-item" href="#complaints">
          ☷ &nbsp; {isAdmin ? "Manage Complaints" : "My Complaints"}
        </a>

        <div className="sidebar-bottom">
          <div className="avatar">{isAdmin ? "AD" : "ST"}</div>
          <div className="user-details">
            <strong>{user.name}</strong>
            <small>{isAdmin ? "Admin Portal" : "Student Portal"}</small>
          </div>
          <button className="logout-btn" onClick={logout} title="Log out">
            ↪
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">CAMPUS SERVICES</span>
            <h1>Maintenance Dashboard</h1>
          </div>
          <div className="signed-in">
            <span>{isAdmin ? "Administrator" : "Student"}</span>
            <strong>{user.name}</strong>
          </div>
        </header>

        <section className="welcome" id="dashboard">
          <div>
            <span className="eyebrow light">YOUR CAMPUS, WELL MAINTAINED</span>
            <h2>
              {isAdmin
                ? <>Keeping campus<br />running smoothly.</>
                : <>A better campus starts<br />with you.</>}
            </h2>
            <p>
              {isAdmin
                ? "Review maintenance issues and keep complaints moving."
                : "Report maintenance issues and track their progress in one place."}
            </p>
            {!isAdmin && (
              <a className="primary-btn" href="#submit">
                ＋ Submit a complaint
              </a>
            )}
          </div>
          <div className="welcome-icon">⌂</div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <span>Total Complaints</span><strong>{complaints.length}</strong>
            <small>All reported issues</small><b className="stat-icon blue">▤</b>
          </div>
          <div className="stat-card">
            <span>Pending</span><strong>{pending}</strong>
            <small>Awaiting attention</small><b className="stat-icon orange">◷</b>
          </div>
          <div className="stat-card">
            <span>In Progress</span><strong>{progress}</strong>
            <small>Being worked on</small><b className="stat-icon purple">⚙</b>
          </div>
          <div className="stat-card">
            <span>Resolved</span><strong>{resolved}</strong>
            <small>Successfully completed</small><b className="stat-icon green">✓</b>
          </div>
        </section>

        <section className="content-grid">
          {!isAdmin && (
            <div className="panel" id="submit">
              <div className="panel-heading">
                <div><h3>Submit a Complaint</h3><p>Tell us what needs attention.</p></div>
                <span className="heading-icon">＋</span>
              </div>

              <form onSubmit={submitComplaint}>
                <label>Issue title
                  <input required maxLength={120} placeholder="e.g. Projector not working"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </label>

                <div className="form-row">
                  <label>Category
                    <select value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {["Electrical", "Plumbing", "Equipment", "Cleanliness", "Furniture", "Internet", "Other"]
                        .map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label>Priority
                    <select value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                      {["Low", "Medium", "High", "Urgent"]
                        .map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                </div>

                <label>Location
                  <input required maxLength={150} placeholder="Building, room or lab"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </label>

                <label>Description
                  <textarea required maxLength={2000} rows="3"
                    placeholder="Describe the issue in detail..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </label>

                <button className="submit-btn" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Complaint →"}
                </button>
              </form>
            </div>
          )}

          <div className="panel complaints-panel" id="complaints">
            <div className="panel-heading">
              <div>
                <h3>{isAdmin ? "Manage Complaints" : "Recent Complaints"}</h3>
                <p>
                  {isAdmin
                    ? "Review and update issue status."
                    : "Track reported maintenance issues."}
                </p>
              </div>
              <span className="count">{filteredComplaints.length} shown</span>
            </div>

            <label className="search-label">Search complaints
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, location, description or ID..." />
            </label>

            <div className="filter-row">
              <select aria-label="Filter by status" value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}>
                <option>All</option>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>

              <select aria-label="Filter by category" value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}>
                <option>All</option>
                {["Electrical", "Plumbing", "Equipment", "Cleanliness", "Furniture", "Internet", "Other"]
                  .map((item) => <option key={item}>{item}</option>)}
              </select>

              <select aria-label="Filter by priority" value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}>
                <option>All</option>
                {["Low", "Medium", "High", "Urgent"].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>

            {message && <p className="message" role="status">{message}</p>}

            {filteredComplaints.length === 0 ? (
              <div className="empty">
                <span>☷</span><strong>No matching complaints</strong>
                <p>Try another search or clear your filters.</p>
              </div>
            ) : (
              <div className="complaint-list">
                {[...filteredComplaints].reverse().map((c) => (
                  <article className="complaint" key={c.id}>
                    <div className="complaint-top">
                      <strong>{c.title}</strong>
                      <span className={`status ${c.status.toLowerCase().replaceAll(" ", "-")}`}>
                        {c.status}
                      </span>
                    </div>
                    <p>{c.category} · {c.location}</p>
                    <p className="description">{c.description}</p>
                    <div className="complaint-bottom">
                      <span>ID: #{c.id}</span>
                      <span className={`priority ${(c.priority || "medium").toLowerCase()}`}>
                        {c.priority} priority
                      </span>
                    </div>

                    {isAdmin && (
                      <label className="status-editor">Update status
                        <select value={c.status}
                          onChange={(e) => updateStatus(c.id, e.target.value)}>
                          {STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </label>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer>AUCare · Smart Campus Maintenance System</footer>
      </main>
    </div>
  );
}

export default App;
