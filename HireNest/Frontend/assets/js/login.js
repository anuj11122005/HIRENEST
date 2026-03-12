// =======================================
// HireNest - Login Page Script
// =======================================

document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("loginForm");
  const box = document.querySelector(".login-box");
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const errorBox = document.getElementById("loginError");

  // -------------------------------
  // Handle Login Submit
  // -------------------------------
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Reset error
    errorBox.style.display = "none";

    // Basic validation
    if (email === "" || password === "") {
      errorBox.textContent = "Please enter email and password";
      errorBox.style.display = "block";
      return;
    }

    // ✅ LOGIN SUCCESS
    // Add class to trigger layout change
    box.classList.add("success");

    // Optional redirect after animation
    setTimeout(() => {
    window.location.href = "/HireNest/index.html";// temporary redirect to homepage after login
      // window.location.href = "jobseeker-dashboard.html";
    }, 1500);
  });

  // -------------------------------
  // Password Show / Hide Toggle
  // -------------------------------
  document.querySelectorAll(".toggle-password").forEach(function (eye) {
    eye.addEventListener("click", function () {
      const input = document.getElementById(eye.dataset.target);
      input.type = input.type === "password" ? "text" : "password";
    });
  });

});
