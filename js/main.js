/* Study Circle — Workshops, Interactive Learning Plan & Form Validation */
document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("#workshop-list");
  const searchInput = document.querySelector("#workshop-search");
  const categoryFilter = document.querySelector("#category-filter");
  const sortSelect = document.querySelector("#workshop-sort");
  const emptyState = document.querySelector("#workshop-empty");

  function createWorkshopCard(item, savedIds) {
    const isAdded = savedIds.includes(item.id);
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-xl-4";

    const card = document.createElement("article");
    card.className = "card workshop-card";
    card.id = item.id;

    const banner = document.createElement("div");
    banner.className = "card-banner " + item.category.toLowerCase();
    const tag = document.createElement("small");
    tag.textContent = item.category + " / " + item.level;
    const mark = document.createElement("b");
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = item.category === "Web" ? "</>" : item.category === "Design" ? "Aa" : item.category === "Tools" ? "+ / −" : "{ }";
    banner.append(tag, mark);

    const body = document.createElement("div");
    body.className = "card-body";

    const meta = document.createElement("div");
    meta.className = "meta-row";
    meta.textContent = item.level + " · " + item.duration + " min · " + item.day;

    const heading = document.createElement("h3");
    heading.textContent = item.title;

    const description = document.createElement("p");
    description.textContent = item.description;

    const outlineButton = document.createElement("button");
    outlineButton.type = "button";
    outlineButton.className = "outline-toggle";
    outlineButton.setAttribute("aria-expanded", "false");
    outlineButton.textContent = "What you’ll practise";

    const outline = document.createElement("div");
    outline.className = "workshop-outline-content";
    const skills = document.createElement("ul");
    item.skills.forEach(skill => {
      const li = document.createElement("li");
      li.textContent = skill;
      skills.append(li);
    });
    outline.append(skills);

    const outcome = document.createElement("p");
    outcome.className = "outcome";
    outcome.textContent = "Make: " + item.outcome;

    const actions = document.createElement("div");
    actions.className = "workshop-actions";

    const add = document.createElement("button");
    add.type = "button";
    add.className = isAdded ? "btn btn-accent btn-sm add-plan" : "btn btn-ink btn-sm add-plan";
    add.dataset.id = item.id;
    add.textContent = isAdded ? "✓ In your plan" : "Add to plan";
    add.setAttribute("aria-pressed", String(isAdded));

    const choose = document.createElement("a");
    choose.className = "text-link";
    choose.href = "workshops.html?workshop=" + encodeURIComponent(item.id) + "#join";
    choose.textContent = "Register ↗";

    actions.append(add, choose);
    body.append(meta, heading, description, outlineButton, outline, outcome, actions);
    card.append(banner, body);
    col.append(card);
    return col;
  }

  function renderWorkshops() {
    if (!list) return;
    const savedIds = getSavedPlan();
    const term = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;

    let results = WORKSHOPS_DATA.filter(item => {
      const searchable = (item.title + " " + item.description + " " + item.category + " " + item.skills.join(" ")).toLowerCase();
      return searchable.includes(term) && (category === "all" || item.category === category);
    });

    if (sortSelect.value === "duration-asc") results.sort((a, b) => a.duration - b.duration);
    if (sortSelect.value === "duration-desc") results.sort((a, b) => b.duration - a.duration);
    if (sortSelect.value === "title") results.sort((a, b) => a.title.localeCompare(b.title));

    list.replaceChildren();
    results.forEach(item => list.append(createWorkshopCard(item, savedIds)));

    const countEl = document.querySelector("#workshop-count");
    if (countEl) {
      countEl.textContent = "Showing " + results.length + " of " + WORKSHOPS_DATA.length + " workshops";
    }
    if (emptyState) {
      emptyState.hidden = results.length !== 0;
    }
  }

  function updatePlanSummary() {
    const savedIds = getSavedPlan();
    const chosen = WORKSHOPS_DATA.filter(item => savedIds.includes(item.id));
    const totalMinutes = chosen.reduce((sum, item) => sum + item.duration, 0);

    const planCountEl = document.querySelector("#plan-count");
    const planMinutesEl = document.querySelector("#plan-minutes");
    if (planCountEl) {
      planCountEl.textContent = chosen.length + (chosen.length === 1 ? " workshop" : " workshops");
    }
    if (planMinutesEl) {
      planMinutesEl.textContent = totalMinutes + " minutes total";
    }
  }

  if (list) {
    renderWorkshops();
    updatePlanSummary();

    [searchInput, categoryFilter, sortSelect].forEach(control => {
      control.addEventListener(control === searchInput ? "input" : "change", renderWorkshops);
    });

    list.addEventListener("click", event => {
      const addButton = event.target.closest(".add-plan");
      if (addButton) {
        const id = addButton.dataset.id;
        toggleWorkshopInPlan(id);
        renderWorkshops();
        updatePlanSummary();
        // jQuery pulse feedback on summary bar
        if (window.jQuery) {
          window.jQuery("#plan-summary-bar").stop(true, true).fadeOut(90).fadeIn(180);
        }
      }

      const outlineButton = event.target.closest(".outline-toggle");
      if (outlineButton) {
        const panel = outlineButton.nextElementSibling;
        const opening = outlineButton.getAttribute("aria-expanded") !== "true";
        outlineButton.setAttribute("aria-expanded", String(opening));
        outlineButton.textContent = opening ? "Hide practice outline" : "What you’ll practise";
        if (window.jQuery) {
          window.jQuery(panel).stop(true, true).slideToggle(180);
        } else {
          panel.style.display = opening ? "block" : "none";
        }
      }
    });

    const clearBtn = document.querySelector("#clear-plan");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        clearSavedPlan();
        renderWorkshops();
        updatePlanSummary();
      });
    }
  }

  /* --- Workshop Join / Registration Demo Form --- */
  const joinForm = document.querySelector("#join-form");
  if (joinForm) {
    const fields = {
      name: document.querySelector("#full-name"),
      email: document.querySelector("#email"),
      phone: document.querySelector("#phone"),
      workshop: document.querySelector("#workshop"),
      question: document.querySelector("#question"),
      agree: document.querySelector("#demo-agree")
    };
    const result = document.querySelector("#join-result");
    const summary = document.querySelector("#selection-summary");
    const errorIds = {
      name: "name-error",
      email: "email-error",
      phone: "phone-error",
      workshop: "workshop-error",
      experience: "experience-error",
      question: "question-error",
      agree: "agree-error"
    };

    // Autofill if user is signed in
    const currentUser = getCurrentUser();
    if (currentUser) {
      if (fields.name && !fields.name.value) fields.name.value = currentUser.name;
      if (fields.email && !fields.email.value) fields.email.value = currentUser.email;
    }

    const setError = (key, message) => {
      const node = document.getElementById(errorIds[key]);
      if (node) node.textContent = message;
      const field = key === "experience"
        ? document.querySelector('[name="experience"]')
        : key === "agree" ? fields.agree : fields[key];
      if (field) field.setAttribute("aria-invalid", String(Boolean(message)));
    };

    function validateField(key) {
      let message = "";
      if (key === "name" && fields.name.value.trim().length < 2) {
        message = "Please enter at least 2 characters.";
      }
      if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.value.trim())) {
        message = "Enter a valid email address, for example alex@example.com.";
      }
      if (key === "phone" && fields.phone.value.trim() && !/^\+?[0-9\s().-]{7,20}$/.test(fields.phone.value.trim())) {
        message = "Use 7–20 digits and common phone symbols, or leave this optional field empty.";
      }
      if (key === "workshop" && !fields.workshop.value) {
        message = "Choose one workshop to continue.";
      }
      if (key === "experience" && !document.querySelector('[name="experience"]:checked')) {
        message = "Choose the level that describes you.";
      }
      if (key === "question" && fields.question.value.length > 500) {
        message = "Keep your question under 500 characters.";
      }
      if (key === "agree" && !fields.agree.checked) {
        message = "Please confirm that you understand this is a demonstration.";
      }
      setError(key, message);
      return !message;
    }

    Object.keys(fields).forEach(key => {
      const field = fields[key];
      const eventName = key === "agree" || key === "workshop" ? "change" : "input";
      field.addEventListener(eventName, () => validateField(key));
      field.addEventListener("blur", () => validateField(key));
    });

    document.querySelectorAll('[name="experience"]').forEach(radio => {
      radio.addEventListener("change", () => validateField("experience"));
    });

    const selected = new URLSearchParams(window.location.search).get("workshop");
    if (WORKSHOPS_DATA.some(item => item.id === selected)) {
      fields.workshop.value = selected;
    }

    joinForm.addEventListener("submit", event => {
      event.preventDefault();
      const valid = Object.keys(fields).map(validateField).concat([validateField("experience")]).every(Boolean);
      if (!valid) {
        const first = joinForm.querySelector('[aria-invalid="true"]');
        if (first) first.focus();
        return;
      }

      const chosenId = fields.workshop.value;
      const chosen = WORKSHOPS_DATA.find(item => item.id === chosenId);

      // Also save chosen workshop to user's plan in localStorage if not already saved
      const currentPlan = getSavedPlan();
      if (chosen && !currentPlan.includes(chosen.id)) {
        currentPlan.push(chosen.id);
        savePlan(currentPlan);
        renderWorkshops();
        updatePlanSummary();
      }

      summary.textContent = "Registered workshop: " + (chosen ? chosen.title : fields.workshop.selectedOptions[0].textContent) +
        " — added to your saved learning plan (viewable on your Profile page).";
      joinForm.hidden = true;
      result.hidden = false;
      if (window.jQuery) {
        window.jQuery(result).stop(true, true).hide().fadeIn(260);
      }
      result.focus();
      joinForm.reset();
      Object.keys(errorIds).forEach(key => setError(key, ""));
    });

    const editBtn = document.querySelector("#edit-selection");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        result.hidden = true;
        joinForm.hidden = false;
        fields.workshop.focus();
        if (window.jQuery) {
          window.jQuery("html, body").stop(true).animate({ scrollTop: window.jQuery(joinForm).offset().top - 30 }, 250);
        }
      });
    }
  }

  /* --- jQuery Effect #3: Smooth in-page anchor scrolling without queuing --- */
  if (window.jQuery) {
    window.jQuery(document).on("click", 'a[href*="#"]', function (event) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;
      const parts = href.split("#");
      const targetId = parts[1];
      const target = document.getElementById(targetId);
      if (target && (this.pathname === window.location.pathname || parts[0] === "")) {
        event.preventDefault();
        window.jQuery("html, body").stop(true).animate({ scrollTop: window.jQuery(target).offset().top - 24 }, 300);
      }
    });
  }
});
