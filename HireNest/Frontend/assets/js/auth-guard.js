// ==================================================
// HireNest - Authentication Guard
// Protects routes that require authentication
// ==================================================

const API_BASE = "http://127.0.0.1:8000/api";

// Check if user is authenticated
async function checkAuthentication() {
  try {
    const response = await fetch(`${API_BASE}/auth/me/`, {
      credentials: "include"
    });

    if (response.ok) {
      const data = await response.json();
      return data.authenticated;
    }
    return false;
  } catch (error) {
    console.error("Auth check error:", error);
    return false;
  }
}

// Get current user data
async function getCurrentUser() {
  try {
    const response = await fetch(`${API_BASE}/auth/me/`, {
      credentials: "include"
    });

    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
    return null;
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}

// Logout function
async function logout() {
  try {
    await fetch(`${API_BASE}/auth/logout/`, {
      method: "POST",
      credentials: "include"
    });
    localStorage.removeItem("user");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout error:", error);
  }
}

// Protect route - redirect to login if not authenticated
async function requireAuth(redirectUrl = "login.html") {
  const isAuthenticated = await checkAuthentication();

  if (!isAuthenticated) {
    window.location.href = redirectUrl;
    return false;
  }

  return true;
}

// Update navbar based on auth status
async function updateNavbar() {
  const user = await getCurrentUser();
  const navRight = document.querySelector(".nav-right");

  if (navRight && user) {
    navRight.innerHTML = `
      <a class="btn btn-ghost" href="profile.html">${user.full_name || user.username}</a>
      <button class="btn btn-primary" onclick="logout()" style="margin-left:10px;">Logout</button>
    `;
  } else if (navRight && !user) {
    navRight.innerHTML = `
      <a class="btn btn-ghost" href="login.html">Login</a>
      <a class="btn btn-primary" href="register.html">Create Account</a>
    `;
  }
}

// Make logout available globally
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.requireAuth = requireAuth;
window.updateNavbar = updateNavbar;
