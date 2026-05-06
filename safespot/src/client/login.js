import { useState } from "react";
import { loginUser, signupUser, saveToken } from "../api/auth";

function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    displayName: "",
    age: "",
    gender: "",
  });

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // ---------------------------
  // LOGIN
  // ---------------------------
  async function handleLogin() {
    setLoading(true);
    setError("");

    try {
      const data = await loginUser({
        username: form.username,
        password: form.password,
      });

      if (data.token) {
        saveToken(data.token);
        onLogin();
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Login error");
    }

    setLoading(false);
  }

  // ---------------------------
  // SIGNUP
  // ---------------------------
  async function handleSignup() {
    setLoading(true);
    setError("");

    try {
      const data = await signupUser({
        username: form.username,
        email: form.email,
        password: form.password,
        displayName: form.displayName,
        age: Number(form.age),
        gender: form.gender,
        // ✅ auto avatar generation (no input field)
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.username}`,
      });

      if (data.token) {
        saveToken(data.token);
        onLogin();
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Signup error");
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>{isSignup ? "Signup" : "Login"}</h2>

      {/* ERROR DISPLAY */}
      {error && (
        <div style={{ color: "red", marginBottom: 10 }}>
          {error}
        </div>
      )}

      {/* USERNAME */}
      <input
        placeholder="Username"
        onChange={(e) => updateField("username", e.target.value)}
        disabled={loading}
      />
      <br />

      {/* EMAIL */}
      {isSignup && (
        <>
          <input
            placeholder="Email"
            onChange={(e) => updateField("email", e.target.value)}
            disabled={loading}
          />
          <br />
        </>
      )}

      {/* DISPLAY NAME */}
      {isSignup && (
        <>
          <input
            placeholder="Display Name"
            onChange={(e) => updateField("displayName", e.target.value)}
            disabled={loading}
          />
          <br />
        </>
      )}

      {/* AGE */}
      {isSignup && (
        <>
          <input
            type="number"
            placeholder="Age"
            onChange={(e) => updateField("age", e.target.value)}
            disabled={loading}
          />
          <br />
        </>
      )}

      {/* GENDER (fixed) */}
      {isSignup && (
        <>
          <select
            onChange={(e) => updateField("gender", e.target.value)}
            disabled={loading}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <br />
        </>
      )}

      {/* PASSWORD */}
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => updateField("password", e.target.value)}
        disabled={loading}
      />
      <br />

      {/* BUTTON */}
      <button
        onClick={isSignup ? handleSignup : handleLogin}
        disabled={loading}
      >
        {loading
          ? "Processing..."
          : isSignup
          ? "Create Account"
          : "Login"}
      </button>

      <br /><br />

      {/* TOGGLE */}
      <button
        onClick={() => {
          setIsSignup(!isSignup);
          setError("");
        }}
        disabled={loading}
      >
        {isSignup
          ? "Already have an account? Login"
          : "Create account"}
      </button>
    </div>
  );
}

export default Login;