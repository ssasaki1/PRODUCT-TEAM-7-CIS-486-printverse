// Redirect if already logged in
const existingUser = localStorage.getItem("printverseUser");
if (existingUser) {
  window.location.href = "index.html";
}

const loginForm = document.getElementById("login-form");
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");
const loginStatus = document.getElementById("login-status");
const registerButton = document.getElementById("register-button");

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();

  if (!username || !password) {
    loginStatus.textContent = "Enter username and password.";
    return;
  }

  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    loginStatus.textContent = `❌ ${data.error}`;
    return;
  }

  localStorage.setItem("printverseUser", JSON.stringify(data.user));
  window.location.href = "index.html";
});

// Register
registerButton.addEventListener("click", async () => {
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();

  if (!username || !password) {
    loginStatus.textContent = "Enter username and password.";
    return;
  }

  const res = await fetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    loginStatus.textContent = `❌ ${data.error}`;
    return;
  }

  localStorage.setItem("printverseUser", JSON.stringify(data.user));
  window.location.href = "index.html";
});
