const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const precisePointer = matchMedia('(hover: hover) and (pointer: fine)');

// Each surface tilts around its own centre, with a maximum of five degrees.
const depthSurfaces = document.querySelectorAll('.project, .toolkit-grid .entry, .activity-grid .entry, .academic-timeline .entry, .scrap-photo');
for (const surface of depthSurfaces) {
  surface.classList.add(surface.classList.contains('scrap-photo') ? 'depth-photo' : 'depth-surface');

  function resetTilt() {
    surface.style.removeProperty('--tilt-x');
    surface.style.removeProperty('--tilt-y');
    surface.classList.remove('is-tilting');
  }

  surface.addEventListener('pointermove', event => {
    if (motionPreference.matches || !precisePointer.matches || event.pointerType === 'touch') return;
    const bounds = surface.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
    surface.style.setProperty('--tilt-x', (-vertical * 10).toFixed(2) + 'deg');
    surface.style.setProperty('--tilt-y', (horizontal * 10).toFixed(2) + 'deg');
    surface.classList.add('is-tilting');
  });

  surface.addEventListener('pointerleave', resetTilt);
  surface.addEventListener('pointercancel', resetTilt);
}

const activityToggle = document.querySelector('#activity-toggle');
activityToggle?.addEventListener('click', () => {
  const expanded = activityToggle.getAttribute('aria-expanded') !== 'true';
  activityToggle.setAttribute('aria-expanded', String(expanded));
  activityToggle.textContent = expanded ? 'Show fewer activities ↑' : 'Show more activities ↓';
  for (const activity of document.querySelectorAll('.extra-activity')) {
    activity.hidden = !expanded;
  }
});

// Keep native dialogs outside transformed cards so they remain viewport-centred.
for (const dialog of document.querySelectorAll('.project dialog')) {
  document.body.append(dialog);
}

if ('IntersectionObserver' in window && !motionPreference.matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.05 });

  for (const section of document.querySelectorAll('main > section:not(#home) > .section-head')) {
    section.classList.add('reveal-ready');
    observer.observe(section);
  }

  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) {
      for (const section of document.querySelectorAll('.reveal-ready')) {
        section.classList.add('revealed');
      }
      observer.disconnect();
    }
  });
}

const themeButton = document.querySelector('#theme-toggle');

function updateThemeButton() {
  const dark = document.documentElement.dataset.theme === 'dark';
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';

  themeButton.setAttribute('aria-label', label);
  themeButton.setAttribute('title', label);
}

themeButton.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark'
    ? 'light'
    : 'dark';

  document.documentElement.dataset.theme = theme;

  try {
    localStorage.setItem('fatin-portfolio-theme', theme);
  } catch {
    // Theme switching still works without local storage.
  }

  updateThemeButton();
});

updateThemeButton();

const typingText = document.querySelector('#typing-text');
const interests = ['machine learning', 'natural language processing', 'data analytics', 'web development'];
let interestIndex = 0;
let characterCount = interests[0].length;
let deleting = true;
let typingTimer;

function typeInterest() {
  const phrase = interests[interestIndex];
  characterCount += deleting ? -1 : 1;
  typingText.textContent = phrase.slice(0, characterCount);
  let delay = deleting ? 45 : 85;

  if (characterCount === 0) {
    deleting = false;
    interestIndex = (interestIndex + 1) % interests.length;
    delay = 300;
  } else if (characterCount === phrase.length && !deleting) {
    deleting = true;
    delay = 1900;
  }

  typingTimer = setTimeout(typeInterest, delay);
}

function syncTyping() {
  clearTimeout(typingTimer);

  if (motionPreference.matches) {
    typingText.textContent = interests[0];
    return;
  }

  interestIndex = 0;
  characterCount = interests[0].length;
  deleting = true;
  typingText.textContent = interests[0];
  typingTimer = setTimeout(typeInterest, 1900);
}

motionPreference.addEventListener('change', syncTyping);
syncTyping();

/* EDUCATION — Tilt kad, angkat foto dan animasi masuk */
{
  const educationCards = [...document.querySelectorAll("#education .edu-card")];

  const tiltAllowed = window.matchMedia(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
  );

  const motionAllowed = window.matchMedia(
    "(prefers-reduced-motion: no-preference)"
  );

  educationCards.forEach((card) => {
    const photo = card.querySelector(".edu-photo");
    if (!photo) return;

    function resetTilt() {
      card.classList.remove("edu-tilting");
      card.style.removeProperty("--edu-card-x");
      card.style.removeProperty("--edu-card-y");
      photo.style.removeProperty("--edu-photo-x");
      photo.style.removeProperty("--edu-photo-y");
    }

    card.addEventListener("pointermove", (event) => {
      if (!tiltAllowed.matches || event.pointerType === "touch") return;

      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;

      card.style.setProperty("--edu-card-x", `${-y * 4}deg`);
      card.style.setProperty("--edu-card-y", `${x * 4}deg`);
      photo.style.setProperty("--edu-photo-x", `${-y * 6}deg`);
      photo.style.setProperty("--edu-photo-y", `${x * 6}deg`);

      card.classList.add("edu-tilting");
    });

    card.addEventListener("pointerleave", resetTilt);
    card.addEventListener("pointercancel", resetTilt);
    tiltAllowed.addEventListener("change", resetTilt);
  });

  if (motionAllowed.matches && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visibleCards = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => entry.target)
        .sort((first, second) =>
          educationCards.indexOf(first) - educationCards.indexOf(second)
        );

      visibleCards.forEach((card, index) => {
        card.style.setProperty("--edu-reveal-delay", `${index * 140}ms`);
        card.classList.replace("edu-waiting", "edu-revealed");
        observer.unobserve(card);
      });
    }, { threshold: 0.15 });

    educationCards.forEach((card) => {
      card.classList.add("edu-waiting");
      observer.observe(card);
    });
  }
}

/* SKILLS — Kad muncul satu demi satu semasa scroll */
{
  const skillCards = Array.from(
    document.querySelectorAll('#skills .toolkit-grid > .entry')
  );
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (skillCards.length && !reducedMotion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visibleCards = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => entry.target)
        .sort((a, b) => skillCards.indexOf(a) - skillCards.indexOf(b));

      visibleCards.forEach((card, index) => {
        card.style.setProperty('--skill-delay', `${index * 120}ms`);
        card.classList.replace('skill-waiting', 'skill-revealed');
        observer.unobserve(card);
      });
    }, { threshold: 0.12 });

    skillCards.forEach((card) => {
      card.classList.add('skill-waiting');
      observer.observe(card);
    });

    reducedMotion.addEventListener('change', () => {
      if (!reducedMotion.matches) return;

      observer.disconnect();
      skillCards.forEach((card) => {
        card.classList.remove('skill-waiting', 'skill-revealed');
        card.style.removeProperty('--skill-delay');
      });
    });
  }
}

/* CONTACT — Animasi tajuk, kad, butang dan nota pelawat */
{
  const contact = document.querySelector('#contact.contact-scrapbook');

  if (contact) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    const heading = contact.querySelector('.section-head');
    const cards = contact.querySelectorAll('.letter-grid .letter-card');

    /* Elakkan animasi tajuk umum bertindih dengan animasi Contact. */
    heading?.classList.remove('reveal-ready', 'revealed');

    const revealItems = [heading, ...cards].filter(Boolean);

    if (
      revealItems.length &&
      !reducedMotion.matches &&
      'IntersectionObserver' in window &&
      typeof contact.animate === 'function'
    ) {
      const revealAnimations = [];

      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;

        observer.disconnect();
        if (reducedMotion.matches) return;

        revealItems.forEach((item, index) => {
          const animation = item.animate(
            [
              { opacity: 0, transform: 'translateY(12px)' },
              { opacity: 1, transform: 'translateY(0)' }
            ],
            {
              duration: 420,
              delay: index * 140,
              easing: 'ease-out',
              fill: 'backwards'
            }
          );

          revealAnimations.push(animation);
        });
      }, { threshold: 0.05 });

      observer.observe(heading || contact);

      reducedMotion.addEventListener('change', () => {
        if (!reducedMotion.matches) return;

        observer.disconnect();
        revealAnimations.forEach((animation) => animation.cancel());
      });
    }

    /* Butang naik bila hover dan melantun sedikit bila ditekan. */
    for (const button of contact.querySelectorAll('.letter-button')) {
      let animation;

      function moveButton(keyframes, duration, fill = 'none') {
        if (reducedMotion.matches || typeof button.animate !== 'function') return;

        animation?.cancel();
        animation = button.animate(keyframes, {
          duration,
          easing: 'ease-out',
          fill
        });
      }

      button.addEventListener('pointerenter', (event) => {
        if (!canHover.matches || event.pointerType === 'touch') return;

        moveButton([
          { transform: 'translateY(0)' },
          { transform: 'translateY(-3px)' }
        ], 160, 'forwards');
      });

      button.addEventListener('pointerleave', () => {
        if (!animation) return;

        moveButton([
          { transform: getComputedStyle(button).transform },
          { transform: 'translateY(0)' }
        ], 160);
      });

      button.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;

        moveButton([
          { transform: 'translateY(1px) scale(0.97)' },
          { transform: 'translateY(-2px) scale(1.02)' },
          { transform: 'translateY(0) scale(1)' }
        ], 220);
      });

      button.addEventListener('pointercancel', () => animation?.cancel());

      reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches) animation?.cancel();
      });
    }

    /* Notes from visitors — simpan dalam browser. */
    const noteForm = contact.querySelector('#visitor-note-form');
    const noteList = contact.querySelector('#visitor-notes');
    const noteStatus = contact.querySelector('#visitor-note-status');
    const emptyMessage = contact.querySelector('#visitor-empty');
    const storageKey = 'fatin-portfolio-visitor-notes';
    const maxNotes = 30;

    if (noteForm && noteList && noteStatus && emptyMessage) {
      let notes = [];

      try {
        const savedNotes = JSON.parse(localStorage.getItem(storageKey) || '[]');

        if (Array.isArray(savedNotes)) {
          notes = savedNotes
            .filter((note) =>
              note &&
              typeof note.name === 'string' &&
              typeof note.message === 'string'
            )
            .slice(0, maxNotes);
        }
      } catch {
        // Nota masih boleh dipaparkan sepanjang lawatan ini.
      }

      function renderNotes() {
        noteList.replaceChildren();

        for (const note of notes) {
          const item = document.createElement('li');
          const author = document.createElement('strong');
          const message = document.createElement('p');

          author.textContent = note.name;
          message.textContent = note.message;

          item.append(author, message);
          noteList.append(item);
        }

        noteList.hidden = notes.length === 0;
        emptyMessage.hidden = notes.length > 0;
      }

      noteForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const fields = new FormData(noteForm);
        const name = String(fields.get('name') ?? '').trim().slice(0, 40);
        const message = String(fields.get('message') ?? '').trim().slice(0, 300);

        if (!name || !message) {
          noteStatus.textContent = 'Please enter your name and a message.';
          return;
        }

        notes = [{ name, message }, ...notes].slice(0, maxNotes);

        try {
          localStorage.setItem(storageKey, JSON.stringify(notes));
          noteStatus.textContent = 'Your note was saved in this browser.';
        } catch {
          noteStatus.textContent = 'Your note is visible until you reload this page.';
        }

        noteForm.reset();
        renderNotes();
        noteList.scrollTop = 0;
      });

      renderNotes();
    }
  }
}

/* EXPERIENCE — Fade in ketika scroll */
{
  const experience = document.querySelector("#experience.experience-rose");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (
    experience &&
    !reducedMotion.matches &&
    "IntersectionObserver" in window &&
    typeof Element.prototype.animate === "function"
  ) {
    const items = experience.querySelectorAll(".exp-intro, .exp-item");
    const animations = new Map();

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        animations.get(entry.target)?.play();
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0,
      rootMargin: "0px 0px -48px 0px"
    });

    for (const item of items) {
      const animation = item.animate(
        [
          { opacity: 0, translate: "0 16px" },
          { opacity: 1, translate: "0 0" }
        ],
        {
          duration: 480,
          easing: "ease-out",
          fill: "backwards"
        }
      );

      animation.pause();
      animation.currentTime = 0;
      animations.set(item, animation);
      observer.observe(item);

      animation.addEventListener("finish", () => {
        animations.delete(item);
      }, { once: true });
    }

    reducedMotion.addEventListener("change", () => {
      if (!reducedMotion.matches) return;

      observer.disconnect();

      for (const animation of animations.values()) {
        animation.cancel();
      }

      animations.clear();
    });
  }
}

/* PROJECTS — Filters, show more, SMS demo and case files */
(() => {
  const work = document.querySelector("#work.project-files");
  if (!work) return;

  const grid = work.querySelector("#project-grid");
  const filters = [...work.querySelectorAll(".filters button[data-filter]")];
  const more = work.querySelector(".files-more");
  const moreButton = more?.querySelector("button");

  if (grid && more && moreButton) {
    const projects = [...grid.querySelectorAll(":scope > .project")];
    const initialLimit = 3;

    let activeFilter =
      filters.find((button) => button.getAttribute("aria-pressed") === "true")
        ?.dataset.filter ?? "all";
    let expanded = false;

    function updateProjects() {
      const showingAll = activeFilter === "all";

      for (const filter of filters) {
        const selected = filter.dataset.filter === activeFilter;
        filter.classList.toggle("active", selected);
        filter.setAttribute("aria-pressed", String(selected));
      }

      projects.forEach((project, index) => {
        const categories = (project.dataset.category ?? "").split(/\s+/);
        project.hidden = !showingAll && !categories.includes(activeFilter);

        project.toggleAttribute(
          "data-files-collapsed",
          showingAll && !expanded && index >= initialLimit
        );
      });

      more.hidden = !showingAll || projects.length <= initialLimit;
      moreButton.setAttribute("aria-expanded", String(expanded));
      moreButton.textContent = expanded
        ? "Show fewer projects ↑"
        : "More projects ↓";
    }

    for (const filter of filters) {
      filter.addEventListener("click", () => {
        if (activeFilter === filter.dataset.filter) return;

        activeFilter = filter.dataset.filter;
        expanded = false;
        updateProjects();
      });
    }

    moreButton.addEventListener("click", () => {
      expanded = !expanded;
      updateProjects();
    });

    updateProjects();
  }

  /* Scam SMS Detection — illustrative examples */
  const demo = work.querySelector(".project-demo");

  if (demo) {
    const sampleButtons = [...demo.querySelectorAll("button[data-example]")];
    const message = demo.querySelector("#demo-message");
    const revealButton = demo.querySelector(".demo-reveal");
    const feedback = demo.querySelector(".demo-feedback");

    const examples = {
      reward: {
        message: "You’ve won a cash reward! Claim it today by entering your banking details.",
        clues: "Suspicious signs: an unexpected prize, pressure to act today and a request for banking details."
      },
      delivery: {
        message: "Your parcel is on hold. Update your address and pay a redelivery fee using the link in this message.",
        clues: "Suspicious signs: an unexpected fee and a link asking you to enter personal or payment details."
      },
      reminder: {
        message: "Reminder: Your appointment is tomorrow at 10:00 am. Please arrive 15 minutes early.",
        clues: "This example gives a time and arrival instructions. It contains no payment request or link."
      }
    };

    if (message && revealButton && feedback) {
      let activeExample = "reward";

      function selectExample(key) {
        if (!Object.hasOwn(examples, key)) return;

        activeExample = key;
        message.textContent = examples[key].message;
        feedback.textContent = "";

        for (const button of sampleButtons) {
          const selected = button.dataset.example === key;
          button.setAttribute("aria-pressed", String(selected));
        }
      }

      for (const button of sampleButtons) {
        button.addEventListener("click", () => {
          selectExample(button.dataset.example);
        });
      }

      revealButton.addEventListener("click", () => {
        feedback.textContent = examples[activeExample].clues;
      });

      selectExample(
        sampleButtons.find((button) => button.getAttribute("aria-pressed") === "true")
          ?.dataset.example ?? "reward"
      );
    }
  }

  /* Case-file dialogs */
  const openers = new Map();

  work.addEventListener("click", (event) => {
    const button = event.target.closest("button.detail-button[data-dialog]");
    if (!button) return;

    const dialog = document.getElementById(button.dataset.dialog);
    if (!(dialog instanceof HTMLDialogElement) || dialog.open) return;

    if (!openers.has(dialog)) {
      dialog.addEventListener("click", (dialogEvent) => {
        if (dialogEvent.target !== dialog) return;

        const bounds = dialog.getBoundingClientRect();
        const outside =
          dialogEvent.clientX < bounds.left ||
          dialogEvent.clientX > bounds.right ||
          dialogEvent.clientY < bounds.top ||
          dialogEvent.clientY > bounds.bottom;

        if (outside) dialog.close();
      });

      dialog.addEventListener("close", () => {
        openers.get(dialog)?.focus({ preventScroll: true });
      });
    }

    openers.set(dialog, button);
    dialog.showModal();
  });
})();

/* CASE FILE / 04 — Simulasi penyiraman TerraLux */
(() => {
  function initTerraLux() {
    const dialog = document.getElementById("project-3");
    if (!dialog) return;

    const dashboard = dialog.querySelector(".terra-dashboard");
    const waterButton = dialog.querySelector(".terra-water");
    const status = dialog.querySelector(".terra-status");
    const moisture = dialog.querySelector("[data-terra-moisture]");

    if (!dashboard || !waterButton || !status || !moisture) return;

    const initialMoisture = "42%";
    const wateredMoisture = "58%";
    let wateringTimer;

    function stopWatering() {
      window.clearTimeout(wateringTimer);
      dashboard.classList.remove("is-watering");
      waterButton.disabled = false;
      waterButton.textContent = "Water now";
    }

    waterButton.addEventListener("click", () => {
      if (waterButton.disabled) return;

      moisture.textContent = initialMoisture;
      waterButton.disabled = true;
      waterButton.textContent = "Watering…";
      status.textContent = "Simulating the watering cycle.";
      dashboard.classList.add("is-watering");

      wateringTimer = window.setTimeout(() => {
        stopWatering();
        moisture.textContent = wateredMoisture;
        status.textContent =
          `Demo complete. Soil moisture rose from ${initialMoisture} to ${wateredMoisture}.`;
      }, 1100);
    });

    dialog.addEventListener("close", () => {
      stopWatering();
      moisture.textContent = initialMoisture;
      status.textContent = "";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTerraLux, { once: true });
  } else {
    initTerraLux();
  }
})();

/* CASE FILE / 05 — Shopee sentiment examples */
(() => {
  function initReviewCase() {
    const dialog = document.getElementById("project-4");
    const preview = dialog?.querySelector(".review-case-preview");
    const quote = preview?.querySelector(".review-quote");
    const result = preview?.querySelector(".review-result");
    const buttons = preview?.querySelectorAll("[data-review-sentiment]");

    if (!quote || !result || !buttons?.length) return;

    const examples = {
      positive: {
        before: "Easy to use, and checkout was ",
        highlight: "quick and smooth",
        after: ".",
        label: "Positive"
      },
      neutral: {
        before: "The app works ",
        highlight: "as expected",
        after: ". I mainly use it to check prices.",
        label: "Neutral"
      },
      negative: {
        before: "The app ",
        highlight: "keeps freezing",
        after: " whenever I try to check out.",
        label: "Negative"
      }
    };

    function showExample(sentiment) {
      const example = examples[sentiment];
      if (!example) return;

      const highlight = document.createElement("mark");
      highlight.textContent = example.highlight;

      quote.replaceChildren(`“${example.before}`, highlight, `${example.after}”`);
      result.textContent = example.label;
      preview.dataset.sentiment = sentiment;

      for (const button of buttons) {
        const selected = button.dataset.reviewSentiment === sentiment;
        button.setAttribute("aria-pressed", String(selected));
        button.classList.toggle("active", selected);
      }
    }

    for (const button of buttons) {
      button.addEventListener("click", () => {
        showExample(button.dataset.reviewSentiment);
      });
    }

    showExample("positive");
    dialog.addEventListener("close", () => showExample("positive"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReviewCase, { once: true });
  } else {
    initReviewCase();
  }
})();

/* Activities — fade in on scroll */
(() => {
  function initJournalFade() {
    if (!("IntersectionObserver" in window)) return;

    const items = document.querySelectorAll(
      "#activities.campus-journal .journal-heading, " +
      "#activities.campus-journal .journal-card"
    );

    const observer = new IntersectionObserver((entries) => {
      let delay = 0;

      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        entry.target.style.setProperty("--journal-delay", `${delay}ms`);
        entry.target.classList.add("journal-fade-in");
        observer.unobserve(entry.target);
        delay += 90;
      }
    }, { threshold: 0.15 });

    items.forEach((item) => observer.observe(item));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initJournalFade, { once: true });
  } else {
    initJournalFade();
  }
})();


function setupActivityCards() {
  const section = document.querySelector("#activities");
  if (!section) return;

  const cards = [...section.querySelectorAll(".journal-grid > .journal-card")];
  const button = section.querySelector(".journal-toggle");
  if (!button) return;

  const label = button.querySelector(".journal-toggle-label");
  const icon = button.querySelector(".journal-toggle-icon");
  let expanded = false;

  function updateCards() {
    cards.forEach((card, index) => {
      card.hidden = !expanded && index >= 3;
    });

    button.hidden = cards.length <= 3;
    button.setAttribute("aria-expanded", String(expanded));

    label.textContent = expanded
      ? "Show fewer activities"
      : "Show more activities";

    icon.textContent = expanded ? "↑" : "↓";
  }

  button.onclick = () => {
    const previousTop = button.getBoundingClientRect().top;

    expanded = !expanded;
    updateCards();

    if (!expanded) {
      window.scrollBy({
        top: button.getBoundingClientRect().top - previousTop,
        behavior: "instant"
      });
    }
  };

  updateCards();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupActivityCards);
} else {
  setupActivityCards();
}


(() => {
  const toggle = document.querySelector("#mobile-menu-toggle");
  const sidebar = document.querySelector("#mobile-sidebar");

  if (!toggle || !sidebar) return;

  const closeButton = sidebar.querySelector(".mobile-menu-close");
  const links = [...sidebar.querySelectorAll("a[href^='#']")];
  const mobileScreen = window.matchMedia("(max-width: 800px)");

  function updateActiveLink() {
    const activeDesktopLink = document.querySelector(
      "header .links a[aria-current]"
    );

    const activeHash =
      activeDesktopLink?.getAttribute("href") ||
      window.location.hash ||
      "#home";

    links.forEach(link => {
      if (link.getAttribute("href") === activeHash) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  toggle.addEventListener("click", () => {
    if (!mobileScreen.matches || sidebar.open) return;

    updateActiveLink();
    sidebar.showModal();

    toggle.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("mobile-menu-open");
  });

  closeButton.addEventListener("click", () => {
    sidebar.close();
  });

  /* Close when tapping outside the sidebar */
  sidebar.addEventListener("click", event => {
    if (event.target !== sidebar) return;

    const bounds = sidebar.getBoundingClientRect();

    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    ) {
      sidebar.close();
    }
  });

  /* Close after selecting a section */
  links.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();

      const hash = link.getAttribute("href");
      const target = document.querySelector(hash);

      sidebar.close();

      if (target) {
        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        target.scrollIntoView({
          behavior: reducedMotion ? "instant" : "smooth",
          block: "start"
        });

        history.replaceState(null, "", hash);
      }
    });
  });

  /* Also handles Escape */
  sidebar.addEventListener("close", () => {
    toggle.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("mobile-menu-open");
  });

  /* Close sidebar when returning to desktop */
  mobileScreen.addEventListener("change", event => {
    if (!event.matches && sidebar.open) {
      sidebar.close();
    }
  });
})();


(() => {
  function initMobileMotion() {
    const media = window.matchMedia(
      "(max-width: 800px) and (prefers-reduced-motion: no-preference)"
    );

    const cards = [
      ...document.querySelectorAll(
        "#activities .journal-card, #work .project"
      )
    ];

    if (!cards.length || !("IntersectionObserver" in window)) return;

    let observer;

    function updateMotion() {
      observer?.disconnect();

      cards.forEach(card => {
        card.classList.remove(
          "mobile-motion-ready",
          "mobile-motion-visible"
        );
      });

      if (!media.matches) return;

      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("mobile-motion-visible");
          observer.unobserve(entry.target);
        });
      }, {
        threshold: 0.08
      });

      cards.forEach(card => {
        card.classList.add("mobile-motion-ready");
        observer.observe(card);
      });
    }

    updateMotion();
    media.addEventListener("change", updateMotion);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileMotion);
  } else {
    initMobileMotion();
  }
})();


(() => {
  function initMobileMotion() {
    const media = window.matchMedia(
      "(max-width: 800px) and (prefers-reduced-motion: no-preference)"
    );

    const cards = [
      ...document.querySelectorAll(
        "#activities .journal-card, #work .project"
      )
    ];

    if (!cards.length || !("IntersectionObserver" in window)) return;

    let observer;

    function updateMotion() {
      observer?.disconnect();

      cards.forEach(card => {
        card.classList.remove(
          "mobile-motion-ready",
          "mobile-motion-visible"
        );
      });

      if (!media.matches) return;

      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("mobile-motion-visible");
          observer.unobserve(entry.target);
        });
      }, {
        threshold: 0.08
      });

      cards.forEach(card => {
        card.classList.add("mobile-motion-ready");
        observer.observe(card);
      });
    }

    updateMotion();
    media.addEventListener("change", updateMotion);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileMotion);
  } else {
    initMobileMotion();
  }
})();


(() => {
  function initPortfolio3D() {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const cards = document.querySelectorAll(
      "#activities .journal-card, #work .project, #about .about-profile"
    );

    const buttons = document.querySelectorAll(
      ".hero-copy .actions .btn, " +
      "#activities .journal-toggle, " +
      "header .theme-icon-button, " +
      "header .mobile-menu-toggle, " +
      "#mobile-sidebar .mobile-menu-close, " +
      "#mobile-sidebar .mobile-sidebar-links > a"
    );

    function attachEffect(element, isCard) {
      if (element.dataset.fx3dReady) return;
      element.dataset.fx3dReady = "true";

      element.classList.add(
        isCard ? "fx3d-card" : "fx3d-button"
      );

      let touchStart = null;

      function reset() {
        element.classList.remove(
          "fx3d-active",
          "fx3d-pressed"
        );

        element.style.removeProperty("--fx-rx");
        element.style.removeProperty("--fx-ry");
        touchStart = null;
      }

      function move(event) {
        if (reducedMotion.matches) return;

        const bounds = element.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;

        const x = Math.max(
          -1,
          Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2)
        );

        const y = Math.max(
          -1,
          Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2)
        );

        element.classList.add("fx3d-active");

        element.style.setProperty(
          "--fx-rx",
          `${-y * (isCard ? 4 : 0)}deg`
        );

        element.style.setProperty(
          "--fx-ry",
          `${x * (isCard ? 5 : 2)}deg`
        );
      }

      element.addEventListener("pointerenter", event => {
        if (event.pointerType !== "touch") move(event);
      });

      element.addEventListener("pointermove", event => {
        if (event.pointerType === "touch") {
          if (!touchStart) return;

          /* Release the effect when the user starts scrolling */
          const distance = Math.hypot(
            event.clientX - touchStart.x,
            event.clientY - touchStart.y
          );

          if (distance > 12) {
            reset();
            return;
          }
        }

        move(event);
      }, { passive: true });

      element.addEventListener("pointerdown", event => {
        if (event.pointerType === "touch") {
          touchStart = {
            x: event.clientX,
            y: event.clientY
          };
        }

        move(event);

        if (!isCard && !reducedMotion.matches) {
          element.classList.add("fx3d-pressed");
        }
      }, { passive: true });

      element.addEventListener("pointerup", event => {
        element.classList.remove("fx3d-pressed");

        if (event.pointerType === "touch") reset();
      });

      element.addEventListener("pointerleave", reset);
      element.addEventListener("pointercancel", reset);
      element.addEventListener("blur", reset);

      reducedMotion.addEventListener("change", reset);
    }

    cards.forEach(card => attachEffect(card, true));
    buttons.forEach(button => attachEffect(button, false));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPortfolio3D);
  } else {
    initPortfolio3D();
  }
})();
