const languageButton = document.querySelector(".lang-toggle");
const menuButton = document.querySelector(".menu-toggle");
const siteHeader = document.querySelector(".site-header");
const siteNavigation = document.querySelector("#site-navigation");
const mainContent = document.querySelector("main");
const translatableElements = document.querySelectorAll("[data-zh][data-en]");
const profileImage = document.querySelector(".portrait-frame img");
const languagePreferenceKey = "portfolio_language";
const isEnglishPage = window.location.pathname
  .replace(/\/+$/, "/")
  .includes("/en/");

function getInitialLanguage() {
  if (isEnglishPage) return "en";

  try {
    const savedLanguage = window.localStorage.getItem(languagePreferenceKey);
    if (savedLanguage === "zh" || savedLanguage === "en") {
      return savedLanguage;
    }
  } catch {
    // Browser privacy settings may disable local storage.
  }

  const browserLanguage =
    navigator.languages?.[0] || navigator.language || "en";
  return browserLanguage.toLowerCase().startsWith("zh") ? "zh" : "en";
}

let currentLanguage = getInitialLanguage();

function updateMenuLabel(isOpen) {
  menuButton.setAttribute(
    "aria-label",
    currentLanguage === "zh"
      ? isOpen
        ? "關閉導覽選單"
        : "開啟導覽選單"
      : isOpen
        ? "Close navigation menu"
        : "Open navigation menu",
  );
}

function setMenuOpen(isOpen) {
  menuButton.setAttribute("aria-expanded", String(isOpen));
  siteHeader.classList.toggle("menu-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  mainContent.inert = isOpen;
  updateMenuLabel(isOpen);
}

function setLanguage(language, remember = false) {
  currentLanguage = language;
  document.documentElement.lang = language === "zh" ? "zh-Hant" : "en";

  translatableElements.forEach((element) => {
    element.textContent = element.dataset[language];
  });

  languageButton.textContent = language === "zh" ? "EN" : "中";
  languageButton.setAttribute(
    "aria-label",
    language === "zh" ? "Switch to English" : "切換為中文",
  );
  profileImage.alt =
    language === "zh"
      ? "古仲文黑白形象照"
      : "Black-and-white editorial portrait of Ku Chung-Wen";
  updateMenuLabel(menuButton.getAttribute("aria-expanded") === "true");

  if (remember) {
    try {
      window.localStorage.setItem(languagePreferenceKey, language);
    } catch {
      // The language still switches when storage is unavailable.
    }
  }
}

setLanguage(currentLanguage);

languageButton.addEventListener("click", () => {
  const nextLanguage = currentLanguage === "zh" ? "en" : "zh";
  setLanguage(nextLanguage, true);
  trackEvent("language_switch", { selected_language: nextLanguage });

  if (nextLanguage === "en" && !isEnglishPage) {
    window.location.href = "en/";
    return;
  }

  if (nextLanguage === "zh" && isEnglishPage) {
    window.location.href = "../";
  }
});

menuButton.addEventListener("click", () => {
  setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
});

siteNavigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuButton.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) setMenuOpen(false);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  revealObserver.observe(element);
});

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const counter = entry.target;
      const target = Number(counter.dataset.target);
      const duration = 900;
      const startTime = performance.now();
      counter.textContent = "0";

      function updateCounter(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.round(target * eased);

        if (progress < 1) requestAnimationFrame(updateCounter);
      }

      requestAnimationFrame(updateCounter);
      counterObserver.unobserve(counter);
    });
  },
  { threshold: 0.6 },
);

document.querySelectorAll(".counter").forEach((counter) => {
  counterObserver.observe(counter);
});

document.querySelector("#year").textContent = new Date().getFullYear();

// GA4 is optional: add a Measurement ID in index.html when the site is deployed.
const measurementId = document
  .querySelector('meta[name="ga-measurement-id"]')
  ?.getAttribute("content")
  ?.trim();

window.dataLayer = window.dataLayer || [];

function gtag() {
  window.dataLayer.push(arguments);
}

if (measurementId) {
  const analyticsScript = document.createElement("script");
  analyticsScript.async = true;
  analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(analyticsScript);

  gtag("js", new Date());
  gtag("config", measurementId, { anonymize_ip: true });
}

function trackEvent(eventName, parameters = {}) {
  const eventDetail = {
    ...parameters,
    page_path: window.location.pathname,
    page_language: currentLanguage,
  };

  document.documentElement.dataset.lastAnalyticsEvent = eventName;

  try {
    const sessionEvents = JSON.parse(
      window.sessionStorage.getItem("portfolio_analytics_events") || "[]",
    );
    sessionEvents.push({
      event: eventName,
      ...eventDetail,
      timestamp: new Date().toISOString(),
    });
    window.sessionStorage.setItem(
      "portfolio_analytics_events",
      JSON.stringify(sessionEvents.slice(-50)),
    );
  } catch {
    // Analytics must never interrupt navigation or contact actions.
  }

  window.dataLayer.push({ event: eventName, ...eventDetail });

  if (measurementId) {
    gtag("event", eventName, eventDetail);
  }

  window.dispatchEvent(
    new CustomEvent("portfolio:analytics", {
      detail: { event: eventName, ...eventDetail },
    }),
  );
}

document.querySelectorAll("a[data-track]").forEach((trackedLink) => {
  trackedLink.addEventListener("click", () => {
    trackEvent(trackedLink.dataset.track, {
      link_label:
        trackedLink.dataset.trackLabel || trackedLink.textContent.trim(),
      link_url: trackedLink.href,
    });
  });
});

const cisProjects = {
  silna: {
    title: "SILNA Health",
    count: 8,
    image(index) {
      return `assets/cis/silna/${String(index).padStart(2, "0")}.jpg`;
    },
  },
  infinix: {
    title: "INFINIX",
    count: 8,
    image(index) {
      return `assets/cis/infinix/${String(index).padStart(2, "0")}.jpg`;
    },
  },
  roseline: {
    title: "ROSELINE Champagne",
    count: 8,
    image(index) {
      return `assets/cis/roseline/${String(index).padStart(2, "0")}.jpg`;
    },
  },
  frameNode: {
    title: "FRAME NODE",
    count: 10,
    image(index) {
      return `assets/cis/frame-node/${String(index).padStart(2, "0")}.jpg`;
    },
  },
  lumina: {
    title: "LUMINA",
    count: 8,
    image(index) {
      return `assets/cis/lumina/${String(index).padStart(2, "0")}.jpg`;
    },
  },
  yuguo: {
    title: "YUGUO 嶼菓",
    count: 8,
    image(index) {
      return `assets/cis/yuguo/${String(index).padStart(2, "0")}.jpg`;
    },
  },
  shizuka: {
    title: "SHIZUKA",
    count: 8,
    image(index) {
      return `assets/cis/shizuka/${String(index).padStart(2, "0")}.jpg`;
    },
  },
  cobinhoodCis: {
    title: "COBINHOOD CIS",
    count: 10,
    image(index) {
      return `assets/cis/cobinhood/${String(index).padStart(2, "0")}.jpg`;
    },
  },
  biasX: {
    title: "BIAS X",
    images: [
      "assets/portfolio/pic-BIAS-01.png",
      "assets/portfolio/pic-BIAS-02.png",
      "assets/portfolio/pic-BIAS-03.png",
      "assets/portfolio/pic-BIAS-04.png",
      "assets/portfolio/pic-BIAS-05.png",
    ],
  },
  spark: {
    title: "Spark",
    images: [
      "assets/portfolio/spark-web/01.jpg",
      "assets/portfolio/spark-web/02.jpg",
      "assets/portfolio/spark-web/03.jpg",
      "assets/portfolio/spark-web/04.jpg",
      "assets/portfolio/spark-web/05.jpg",
      "assets/portfolio/spark-web/06.jpg",
    ],
  },
  cobinhoodApp: {
    title: "COBINHOOD App",
    externalUrl:
      "https://www.red-dot.org/zh/project/cobinhood-crypto-exchange-26003",
    externalLabel: "VIEW RED DOT PROJECT",
    images: [
      "assets/portfolio/portfolio-cobinhood-02.jpg",
      "assets/portfolio/portfolio-cobinhood-01.jpg",
      "assets/portfolio/portfolio-cobinhood-03.jpg",
    ],
  },
  dexon: {
    title: "DEXON Wallet",
    images: [
      "assets/portfolio/portfolio-dexon-02.jpg",
      "assets/portfolio/portfolio-dexon-01.jpg",
      "assets/portfolio/portfolio-dexon-03.jpg",
    ],
  },
  eztable: {
    title: "EZTABLE",
    images: [
      "assets/portfolio/portfolio-eztable-02.jpg",
      "assets/portfolio/portfolio-eztable-01.jpg",
      "assets/portfolio/portfolio-eztable-03.jpg",
    ],
  },
  humbleHouse: {
    title: "Humble House",
    images: [
      "assets/portfolio/portfolio-humble-house-01.jpg",
      "assets/portfolio/portfolio-humble-house-02.jpg",
    ],
  },
  logitech: {
    title: "Logitech",
    images: [
      "assets/portfolio/portfolio-logitech-01.jpg",
      "assets/portfolio/portfolio-logitech-02.jpg",
    ],
  },
  luxgen: {
    title: "LUXGEN",
    images: [
      "assets/portfolio/portfolio-luxgen-01.jpg",
      "assets/portfolio/portfolio-luxgen-02.jpg",
    ],
  },
  sheraton: {
    title: "Sheraton Taipei",
    images: [
      "assets/portfolio/portfolio-sheraton-01.jpg",
      "assets/portfolio/portfolio-sheraton-02.jpg",
    ],
  },
};

const cisViewer = document.querySelector(".cis-viewer");
const cisViewerTitle = document.querySelector("#cis-viewer-title");
const cisViewerImage = document.querySelector(".cis-viewer-image");
const cisViewerCount = document.querySelector(".cis-viewer-count");
const cisViewerFrame = document.querySelector(".cis-viewer-frame");
const cisViewerExternal = document.querySelector(".cis-viewer-external");
const cisViewerPrev = document.querySelector(".cis-viewer-prev");
const cisViewerNext = document.querySelector(".cis-viewer-next");
let activeCisProject = null;
let activeCisPage = 1;
let cisSwipeStart = 0;
let cisTransitionTimer = null;

function renderCisPage(page) {
  if (!activeCisProject) return;

  const project = cisProjects[activeCisProject];
  const projectCount = project.images?.length || project.count;
  activeCisPage = ((page - 1 + projectCount) % projectCount) + 1;
  cisViewerImage.src = project.images
    ? project.images[activeCisPage - 1]
    : project.image(activeCisPage);
  cisViewerImage.alt = `${project.title} ${activeCisPage} / ${projectCount}`;
  cisViewerCount.textContent = `${String(activeCisPage).padStart(2, "0")} / ${String(projectCount).padStart(2, "0")}`;

  [activeCisPage - 1, activeCisPage + 1].forEach((nearbyPage) => {
    const wrappedPage = ((nearbyPage - 1 + projectCount) % projectCount) + 1;
    const preload = new Image();
    preload.src = project.images
      ? project.images[wrappedPage - 1]
      : project.image(wrappedPage);
  });
}

function showCisPage(page, direction = 0) {
  if (!activeCisProject) return;

  if (!direction || !cisViewerImage.src) {
    renderCisPage(page);
    return;
  }

  window.clearTimeout(cisTransitionTimer);
  cisViewerFrame.classList.remove("is-entering", "from-prev", "from-next");
  cisViewerFrame.classList.add(
    "is-changing",
    direction < 0 ? "from-prev" : "from-next",
  );

  cisTransitionTimer = window.setTimeout(() => {
    renderCisPage(page);
    cisViewerFrame.classList.remove("is-changing");
    cisViewerFrame.classList.add("is-entering");

    cisTransitionTimer = window.setTimeout(() => {
      cisViewerFrame.classList.remove("is-entering", "from-prev", "from-next");
    }, 340);
  }, 150);
}

document.querySelectorAll(".cis-card").forEach((card) => {
  card.addEventListener("click", () => {
    window.clearTimeout(cisTransitionTimer);
    cisViewerFrame.classList.remove(
      "is-changing",
      "is-entering",
      "from-prev",
      "from-next",
    );
    activeCisProject = card.dataset.cisProject;
    activeCisPage = 1;
    const project = cisProjects[activeCisProject];
    const projectCount = project.images?.length || project.count;
    cisViewerTitle.textContent = project.title;
    cisViewerPrev.hidden = projectCount < 2;
    cisViewerNext.hidden = projectCount < 2;
    cisViewerExternal.hidden = !project.externalUrl;
    if (project.externalUrl) {
      cisViewerExternal.href = project.externalUrl;
      cisViewerExternal.innerHTML = `${project.externalLabel}<span class="ui-arrow ui-arrow-up-right" aria-hidden="true"></span>`;
    } else {
      cisViewerExternal.removeAttribute("href");
      cisViewerExternal.textContent = "";
    }
    showCisPage(activeCisPage);
    cisViewer.showModal();
    document.body.classList.add("modal-open");
    trackEvent("portfolio_project_open", {
      project_name: cisProjects[activeCisProject].title,
    });
  });
});

document.querySelector(".cis-viewer-close").addEventListener("click", () => {
  cisViewer.close();
});

cisViewerPrev.addEventListener("click", () => {
  showCisPage(activeCisPage - 1, -1);
});

cisViewerNext.addEventListener("click", () => {
  showCisPage(activeCisPage + 1, 1);
});

cisViewer.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
});

cisViewer.addEventListener("click", (event) => {
  if (event.target === cisViewer) cisViewer.close();
});

cisViewerFrame.addEventListener("pointerdown", (event) => {
  cisSwipeStart = event.clientX;
});

cisViewerFrame.addEventListener("pointerup", (event) => {
  const swipeDistance = event.clientX - cisSwipeStart;
  if (Math.abs(swipeDistance) < 45) return;
  const direction = swipeDistance < 0 ? 1 : -1;
  showCisPage(activeCisPage + direction, direction);
});

document.addEventListener("keydown", (event) => {
  if (!cisViewer.open) return;
  if (event.key === "ArrowLeft") showCisPage(activeCisPage - 1, -1);
  if (event.key === "ArrowRight") showCisPage(activeCisPage + 1, 1);
});
