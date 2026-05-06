const API = "http://localhost:5000/auth";

// LOGIN
export async function loginUser(credentials) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Login failed");

  return data;
}

// SIGNUP
export async function signupUser(data) {
  const res = await fetch(`${API}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) throw new Error(result.error || "Signup failed");

  return result;
}

// ✅ ADD THIS BACK (your missing export)
export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
}