/* Study Circle — Student Account (Sign Up / Log In / Profile) & Saved Learning Plan */
document.addEventListener("DOMContentLoaded", () => {
  const authSection = document.getElementById("auth-section");
  const profileSection = document.getElementById("profile-section");
  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout-btn");

  function setInlineError(errorId, inputEl, message) {
    const errEl = document.getElementById(errorId);
    if (errEl) errEl.textContent = message;
    if (inputEl) inputEl.setAttribute("aria-invalid", String(Boolean(message)));
  }

  function renderProfileView() {
    const user = getCurrentUser();
    const savedIds = getSavedPlan();
    const chosenWorkshops = WORKSHOPS_DATA.filter(w => savedIds.includes(w.id));
    const totalMinutes = chosenWorkshops.reduce((sum, w) => sum + w.duration, 0);

    // Always render saved learning plan even if not logged in (works when localStorage is empty)
    const planListContainer = document.getElementById("profile-plan-list");
    const planEmptyNote = document.getElementById("profile-plan-empty");
    const statCountEl = document.getElementById("profile-stat-count");
    const statMinutesEl = document.getElementById("profile-stat-minutes");

    if (statCountEl) statCountEl.textContent = String(chosenWorkshops.length);
    if (statMinutesEl) statMinutesEl.textContent = totalMinutes + " min";

    if (planListContainer) {
      planListContainer.replaceChildren();
      if (chosenWorkshops.length === 0) {
        if (planEmptyNote) planEmptyNote.hidden = false;
      } else {
        if (planEmptyNote) planEmptyNote.hidden = true;
        chosenWorkshops.forEach(item => {
          const row = document.createElement("div");
          row.className = "saved-plan-item";

          const info = document.createElement("div");
          const title = document.createElement("h4");
          title.textContent = item.title;
          const meta = document.createElement("p");
          meta.textContent = item.category + " · " + item.duration + " minutes · " + item.day;
          info.append(title, meta);

          const removeBtn = document.createElement("button");
          removeBtn.type = "button";
          removeBtn.className = "btn btn-outline-ink btn-sm";
          removeBtn.textContent = "Remove";
          removeBtn.addEventListener("click", () => {
            removeWorkshopFromPlan(item.id);
            renderProfileView();
          });

          row.append(info, removeBtn);
          planListContainer.append(row);
        });
      }
    }

    if (user) {
      if (authSection) authSection.hidden = true;
      if (profileSection) {
        profileSection.hidden = false;
        if (window.jQuery) {
          window.jQuery(profileSection).stop(true, true).hide().fadeIn(240);
        }
      }
      const initials = user.name
        .trim()
        .split(/\s+/)
        .map(part => part[0]?.toUpperCase() || "")
        .slice(0, 2)
        .join("") || "SC";

      const avatarEl = document.getElementById("profile-avatar");
      const nameEl = document.getElementById("profile-name");
      const emailEl = document.getElementById("profile-email");
      const trackEl = document.getElementById("profile-track");

      if (avatarEl) avatarEl.textContent = initials;
      if (nameEl) nameEl.textContent = user.name;
      if (emailEl) emailEl.textContent = user.email;
      if (trackEl) trackEl.textContent = "Focus Track: " + (user.track || "Web Development");
    } else {
      if (authSection) authSection.hidden = false;
      if (profileSection) profileSection.hidden = true;
    }
  }

  /* --- Sign Up Validation & Storage --- */
  if (signupForm) {
    const suName = document.getElementById("signup-name");
    const suEmail = document.getElementById("signup-email");
    const suTrack = document.getElementById("signup-track");
    const suPass = document.getElementById("signup-password");
    const suStatus = document.getElementById("signup-status");

    function validateSignup() {
      let ok = true;
      if (suName.value.trim().length < 2) {
        setInlineError("signup-name-error", suName, "Enter your full name (at least 2 characters).");
        ok = false;
      } else {
        setInlineError("signup-name-error", suName, "");
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(suEmail.value.trim())) {
        setInlineError("signup-email-error", suEmail, "Enter a valid email address.");
        ok = false;
      } else {
        setInlineError("signup-email-error", suEmail, "");
      }

      if (suPass.value.trim().length < 4) {
        setInlineError("signup-password-error", suPass, "Enter a demo passcode of at least 4 characters.");
        ok = false;
      } else {
        setInlineError("signup-password-error", suPass, "");
      }
      return ok;
    }

    signupForm.addEventListener("submit", event => {
      event.preventDefault();
      if (!validateSignup()) return;

      const emailLower = suEmail.value.trim().toLowerCase();
      const users = getUsersDatabase();
      const existingIdx = users.findIndex(u => u.email.toLowerCase() === emailLower);

      const newUser = {
        name: suName.value.trim(),
        email: suEmail.value.trim(),
        track: suTrack.value,
        passcode: suPass.value.trim()
      };

      if (existingIdx >= 0) {
        users[existingIdx] = newUser;
      } else {
        users.push(newUser);
      }
      saveUsersDatabase(users);
      setCurrentUser(newUser);

      if (suStatus) {
        suStatus.hidden = false;
        suStatus.textContent = "Account created! Redirecting to your Profile...";
      }
      signupForm.reset();
      setTimeout(() => {
        if (suStatus) suStatus.hidden = true;
        renderProfileView();
      }, 350);
    });
  }

  /* --- Log In Validation & Check --- */
  if (loginForm) {
    const liEmail = document.getElementById("login-email");
    const liPass = document.getElementById("login-password");
    const liGeneralErr = document.getElementById("login-general-error");

    loginForm.addEventListener("submit", event => {
      event.preventDefault();
      let ok = true;

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(liEmail.value.trim())) {
        setInlineError("login-email-error", liEmail, "Please enter your registered email.");
        ok = false;
      } else {
        setInlineError("login-email-error", liEmail, "");
      }

      if (!liPass.value.trim()) {
        setInlineError("login-password-error", liPass, "Please enter your demo passcode.");
        ok = false;
      } else {
        setInlineError("login-password-error", liPass, "");
      }

      if (!ok) return;

      const users = getUsersDatabase();
      const matched = users.find(
        u => u.email.toLowerCase() === liEmail.value.trim().toLowerCase() && u.passcode === liPass.value.trim()
      );

      if (!matched) {
        if (liGeneralErr) {
          liGeneralErr.textContent = "No matching demo account found. Check your email/passcode or create an account on the left.";
        }
        liEmail.setAttribute("aria-invalid", "true");
        return;
      }

      if (liGeneralErr) liGeneralErr.textContent = "";
      setCurrentUser(matched);
      loginForm.reset();
      renderProfileView();
    });
  }

  /* --- Log Out --- */
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      setCurrentUser(null);
      renderProfileView();
    });
  }

  /* --- Clear All Saved Plan Items --- */
  const profileClearBtn = document.getElementById("profile-clear-plan");
  if (profileClearBtn) {
    profileClearBtn.addEventListener("click", () => {
      clearSavedPlan();
      renderProfileView();
    });
  }

  renderProfileView();
});
