/* Study Circle — LocalStorage State Manager (Theme, Demo Auth, Saved Learning Plan) */
const STORAGE_KEYS = {
  THEME: "study_circle_theme",
  USER: "study_circle_user",
  USERS_DB: "study_circle_users_db",
  PLAN: "study_circle_plan"
};

/* --- Theme (Light / Dark Mode) --- */
function getSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === "dark" || saved === "light") return saved;
  } catch (e) {}
  return "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {}
  const toggleBtn = document.getElementById("theme-toggle");
  if (toggleBtn) {
    const isDark = theme === "dark";
    toggleBtn.setAttribute("aria-pressed", String(isDark));
    toggleBtn.innerHTML = isDark
      ? '<span aria-hidden="true">☀</span> Light'
      : '<span aria-hidden="true">☾</span> Dark';
  }
}

/* --- Saved Learning Plan (JSON Array of Workshop IDs) --- */
function getSavedPlan() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAN);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function savePlan(planIds) {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(planIds));
  } catch (e) {}
  updateNavIndicators();
}

function toggleWorkshopInPlan(id) {
  const current = getSavedPlan();
  const idx = current.indexOf(id);
  if (idx >= 0) {
    current.splice(idx, 1);
  } else {
    current.push(id);
  }
  savePlan(current);
  return current;
}

function removeWorkshopFromPlan(id) {
  const updated = getSavedPlan().filter(item => item !== id);
  savePlan(updated);
  return updated;
}

function clearSavedPlan() {
  savePlan([]);
}

/* --- Demo User Account (JSON Object in localStorage) --- */
function getUsersDatabase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS_DB);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveUsersDatabase(users) {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
  } catch (e) {}
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (e) {
    return null;
  }
}

function setCurrentUser(userObj) {
  try {
    if (userObj) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userObj));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  } catch (e) {}
  updateNavIndicators();
}

/* --- Shared Navbar Updates Across All Pages --- */
function updateNavIndicators() {
  const plan = getSavedPlan();
  const badges = document.querySelectorAll(".nav-plan-count");
  badges.forEach(badge => {
    badge.textContent = String(plan.length);
  });

  const user = getCurrentUser();
  const authLink = document.getElementById("nav-auth-link");
  if (authLink) {
    if (user) {
      const firstName = user.name.trim().split(/\s+/)[0];
      authLink.textContent = "Profile (" + firstName + ")";
      authLink.href = "profile.html";
    } else {
      authLink.textContent = "Sign In / Profile";
      authLink.href = "profile.html";
    }
  }
}

// Apply theme immediately on script load
applyTheme(getSavedTheme());

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(getSavedTheme());
  updateNavIndicators();

  const toggleBtn = document.getElementById("theme-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const nextTheme = getSavedTheme() === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
    });
  }
});
