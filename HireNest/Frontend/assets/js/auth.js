// ==================================================
// HireNest - Register Page (Django Auth)
// ==================================================

const API_BASE = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("registerForm");
  const errorBox = document.getElementById("formError");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get input values
    const fullName = document.getElementById("fullName").value.trim();
    const role = document.getElementById("role").value;
    const email = document.getElementById("email").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Clear previous error
    errorBox.textContent = "";
    errorBox.style.display = "none";

    // ================================
    // VALIDATIONS
    // ================================

    // Full name
    if (fullName === "") {
      showError("Full name is required");
      return;
    }

    // Role
    if (role === "") {
      showError("Please select a role");
      return;
    }

    // Email validation
    if (!validateEmail(email)) {
      showError("Please enter a valid email address");
      return;
    }

    // Mobile number validation (Indian 10-digit)
    if (!/^[6-9][0-9]{9}$/.test(mobile)) {
      showError("Mobile number must be exactly 10 digits");
      return;
    }

    // Strong password validation
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      showError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      );
      return;
    }

    // Confirm password
    if (password !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }

    // ================================
    // REGISTER with Django Backend
    // ================================
    try {
      const response = await fetch(`${API_BASE}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          username: email,  // Use email as username
          full_name: fullName,
          email: email,
          role: role,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Account created successfully! Welcome to HireNest.");
        form.reset();
        window.location.href = "jobseeker-dashboard.html";
      } else {
        showError(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      showError("Unable to connect to server. Please ensure backend is running.");
    }
  });


  // ================================
  // Helper Functions
  // ================================

  function showError(message) {
    errorBox.textContent = message;
    errorBox.style.display = "block";
  }

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

});

// Show / Hide password on eye click
document.querySelectorAll(".toggle-password").forEach(eye => {
  eye.addEventListener("click", () => {
    const input = document.getElementById(eye.dataset.target);

    if (input.type === "password") {
      input.type = "text";
      eye.textContent = "🙈";
    } else {
      input.type = "password";
      eye.textContent = "👁️";
    }

  });
});
