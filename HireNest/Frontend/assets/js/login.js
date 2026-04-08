// =======================================
// HireNest - Login Page Script (Django Auth)
// =======================================

const API_BASE = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("loginForm");
  const box = document.querySelector(".login-box");
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const errorBox = document.getElementById("loginError");

  // Check if already logged in
  checkAuth();

  async function checkAuth() {
    try {
      const response = await fetch(`${API_BASE}/auth/me/`, {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          window.location.href = "jobseeker-dashboard.html";
        }
      }
    } catch (error) {
      // Not authenticated, continue to login
    }
  }

  // -------------------------------
  // Handle Login Submit
  // -------------------------------
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Reset error
    errorBox.textContent = "";
    errorBox.style.display = "none";

    // Basic validation
    if (username === "" || password === "") {
      errorBox.textContent = "Please enter username/email and password";
      errorBox.style.display = "block";
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        localStorage.setItem("user", JSON.stringify(data.user));

        // Add class to trigger layout change
        box.classList.add("success");

        // Redirect based on role
        setTimeout(() => {
          window.location.href = "jobseeker-dashboard.html";
        }, 1500);
      } else {
        errorBox.textContent = data.error || "Login failed";
        errorBox.style.display = "block";
      }
    } catch (error) {
      console.error("Login error:", error);
      errorBox.textContent = "Unable to connect to server. Please ensure backend is running.";
      errorBox.style.display = "block";
    }
  });

  // -------------------------------
  // Password Show / Hide Toggle
  // -------------------------------
  document.querySelectorAll(".toggle-password").forEach(function (eye) {
    eye.addEventListener("click", function () {
      const input = document.getElementById(eye.dataset.target);
      input.type = input.type === "password" ? "text" : "password";
      eye.textContent = input.type === "password" ? "👁️" : "🙈";
    });
  });

});
