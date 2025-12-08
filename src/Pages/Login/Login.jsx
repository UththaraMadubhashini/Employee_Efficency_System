import React, { useState } from "react";
import "./Login.css";
import Logo from "../../assets/Logo.png";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch("http://127.0.0.1:5001/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password: password.trim() }),
    });

    const data = await res.json();
    console.log("Login response:", data);

    if (!res.ok) throw new Error(data.error || "Login failed");

    // Store all necessary data in localStorage
    localStorage.setItem("role", data.role);
    localStorage.setItem("emp_id", data.emp_id);  
    localStorage.setItem("name", data.name);   
    localStorage.setItem("email", data.email);   

    // Navigate based on role
    if (data.role.toLowerCase() === "admin") {
      navigate("/admin");
    } else {
      navigate("/employee");
    }
  } catch (err) {
    console.error(err);
    setError(err.message || "Invalid email or password");
  }

  setLoading(false);
};

  return (
    <div className="login-container">
      <div className="login-card intro-card">
        <div className="login-top-wave" />
        <div className="login-content">
          <div className="login-icon-container">
            <img src={Logo} alt="Logo" className="login-icon" />
          </div>

          <form onSubmit={handleLogin}>
            <label className="login-label" htmlFor="email">Email</label>
            <input
              className="login-input"
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="login-label" htmlFor="password">Password</label>
            <input
              className="login-input"
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

            <button
              className="login-btn-outline"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}