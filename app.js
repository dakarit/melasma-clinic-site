(function () {
  // ── Mobile nav ──────────────────────────────────────────────────────────
  var burger = document.querySelector("[data-burger]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  var mobileNavClose = document.querySelector("[data-mobile-nav-close]");

  if (burger && mobileNav) {
    function openNav() {
      mobileNav.classList.add("is-open");
      mobileNav.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      burger.setAttribute("aria-expanded", "true");
    }
    function closeNav() {
      mobileNav.classList.remove("is-open");
      mobileNav.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      burger.setAttribute("aria-expanded", "false");
    }

    burger.addEventListener("click", openNav);
    if (mobileNavClose) mobileNavClose.addEventListener("click", closeNav);

    mobileNav.addEventListener("click", function (e) {
      if (e.target === mobileNav) closeNav();
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileNav.classList.contains("is-open")) closeNav();
    });
  }

  // ── Home hero: results grid ─────────────────────────────────────────────
  // Every few seconds one cell is featured on its own. Hovering a cell shows
  // its after photo, and clicking opens the before and after side by side.
  var hCells = Array.from(document.querySelectorAll('[data-hcell]'));
  var hLightbox = document.getElementById('hLightbox');
  var hLightboxSingle = document.getElementById('hLightboxSingle');
  var hLightboxImg = document.getElementById('hLightboxImg');
  var hLightboxClose = document.getElementById('hLightboxClose');
  var hLightboxPair = document.getElementById('hLightboxPair');
  var hLightboxClose2 = document.getElementById('hLightboxClose2');
  var hLightboxBefore = document.getElementById('hLightboxBefore');
  var hLightboxAfter = document.getElementById('hLightboxAfter');
  var hMasonry = document.getElementById('heroMasonry');

  if (hCells.length) {
    var featuredCell = null;
    var lastFeaturedCell = null;
    var hoveredCell = null;

    function featureCell(cell) {
      if (hoveredCell) return;
      if (featuredCell) featuredCell.classList.remove('is-featured');
      featuredCell = cell;
      cell.classList.add('is-featured');
      setTimeout(function () {
        if (featuredCell === cell && !hoveredCell) {
          cell.classList.remove('is-featured');
          featuredCell = null;
        }
      }, 2400);
    }

    function pulse() {
      if (hoveredCell) return;
      var candidates = hCells.filter(function(c) { return c !== lastFeaturedCell; });
      var pick = candidates[Math.floor(Math.random() * candidates.length)];
      lastFeaturedCell = pick;
      featureCell(pick);
    }

    setTimeout(pulse, 800);
    setInterval(pulse, 3200);

    hCells.forEach(function (cell) {
      cell.addEventListener('mouseenter', function (e) {
        // Start the reveal circle from where the mouse entered the cell
        var rect = cell.getBoundingClientRect();
        cell.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
        cell.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
        hoveredCell = cell;
        if (featuredCell) { featuredCell.classList.remove('is-featured'); featuredCell = null; }
        cell.classList.add('is-hovered');
      });
      cell.addEventListener('mousemove', function (e) {
        if (!cell.dataset.after) return;
        var rect = cell.getBoundingClientRect();
        cell.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
        cell.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
      });
      cell.addEventListener('mouseleave', function () {
        hoveredCell = null;
        cell.classList.remove('is-hovered');
      });
      cell.addEventListener('click', function () {
        if (!hLightbox) return;
        var before = cell.dataset.before;
        var after = cell.dataset.after;
        if (before && after) {
          hLightboxSingle.hidden = true;
          hLightboxPair.hidden = false;
          hLightboxBefore.src = before;
          hLightboxAfter.src = after;
        } else {
          hLightboxPair.hidden = true;
          hLightboxSingle.hidden = false;
          var img = cell.querySelector('.hCell__img');
          if (img) { hLightboxImg.src = img.src; hLightboxImg.alt = img.alt; }
        }
        hLightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      if (!hLightbox) return;
      hLightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (hLightboxClose) hLightboxClose.addEventListener('click', closeLightbox);
    if (hLightboxClose2) hLightboxClose2.addEventListener('click', closeLightbox);
    if (hLightbox) {
      hLightbox.addEventListener('click', function (e) {
        if (e.target === hLightbox) closeLightbox();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  // ── Doctor photo parallax ────────────────────────────────────────────────
  // From the old home hero. Only runs if a .heroDoc__img is on the page.
  var heroDocImgs = document.querySelectorAll(".heroDoc__img");
  if (heroDocImgs.length) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var y = window.scrollY;
          heroDocImgs.forEach(function (img) {
            img.style.transform = "translateY(" + (y * -0.12) + "px)";
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ── Links to a #section ──────────────────────────────────────────────────
  // Show that section right away and scroll to it, so it isn't left hidden
  // waiting for the scroll reveal.
  if (window.location.hash) {
    var target = document.querySelector(window.location.hash);
    if (target && target.hasAttribute('data-reveal')) {
      target.classList.add('is-visible');
      setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  // ── Scroll reveal ────────────────────────────────────────────────────────
  // Fades sections in as they scroll into view.
  if (window.IntersectionObserver) {
    var reveals = document.querySelectorAll("[data-reveal]");
    if (reveals.length) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
      );
      reveals.forEach(function (el) { observer.observe(el); });
    }
  }

  // ── Services tabs ───────────────────────────────────────────────────────
  // Switches the category panel and the header text above it.
  var svcTabs = document.querySelectorAll("[data-svc-tab]");
  var svcPanels = document.querySelectorAll("[data-svc-panel]");
  var svcCatName = document.getElementById("svc-cat-name");
  var svcCatTagline = document.getElementById("svc-cat-tagline");
  var svcCatDesc = document.getElementById("svc-cat-desc");

  function applySvcTabText(tab) {
    var isId = document.documentElement.getAttribute("lang") === "id";
    var name = (isId && tab.dataset.svcNameId) || tab.dataset.svcName;
    var tagline = (isId && tab.dataset.svcTaglineId) || tab.dataset.svcTagline;
    var desc = (isId && tab.dataset.svcDescId) || tab.dataset.svcDesc;
    if (svcCatName) svcCatName.textContent = name || "";
    if (svcCatTagline) svcCatTagline.innerHTML = tagline || "";
    if (svcCatDesc) svcCatDesc.textContent = desc || "";
  }
  // i18n.js calls this after switching languages, so the open tab's header
  // shows in the right language
  window.__updateActiveSvcTab = function () {
    var active = document.querySelector("[data-svc-tab].is-active");
    if (active) applySvcTabText(active);
  };

  if (svcTabs.length) {
    svcTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var key = tab.dataset.svcTab;

        svcTabs.forEach(function (t) {
          t.classList.remove("is-active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");

        svcPanels.forEach(function (panel) {
          if (panel.dataset.svcPanel === key) {
            panel.classList.add("is-active");
            panel.removeAttribute("hidden");
          } else {
            panel.classList.remove("is-active");
            panel.setAttribute("hidden", "");
          }
        });

        applySvcTabText(tab);
      });
    });

    // Open the tab named in the URL, e.g. services.html#services-tseries
    var initHash = window.location.hash;
    if (initHash && initHash.indexOf("#services-") === 0) {
      var initKey = initHash.slice("#services-".length);
      var initTab = document.querySelector('[data-svc-tab="' + initKey + '"]');
      if (initTab) {
        initTab.click();
        setTimeout(function () {
          var section = document.getElementById("services");
          if (section) section.scrollIntoView({ behavior: "auto" });
        }, 50);
      }
    }
  }

  // ── Nav dropdowns (About, Resources, Location) ──────────────────────────
  document.querySelectorAll("[data-nav-drop-wrap]").forEach(function (wrap) {
    var btn = wrap.querySelector("[data-nav-drop-btn]");
    var menu = wrap.querySelector("[data-nav-drop-menu]");
    if (!btn || !menu) return;

    function openDrop() {
      menu.removeAttribute("hidden");
      menu.offsetHeight;
      menu.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      // Only one dropdown open at a time
      document.querySelectorAll("[data-nav-drop-wrap]").forEach(function (other) {
        if (other === wrap) return;
        var otherMenu = other.querySelector("[data-nav-drop-menu]");
        var otherBtn = other.querySelector("[data-nav-drop-btn]");
        if (otherMenu) { otherMenu.classList.remove("is-open"); otherMenu.setAttribute("hidden", ""); }
        if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
      });
    }
    function closeDrop() {
      menu.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      setTimeout(function () {
        if (!menu.classList.contains("is-open")) menu.setAttribute("hidden", "");
      }, 200);
    }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      btn.getAttribute("aria-expanded") === "true" ? closeDrop() : openDrop();
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) closeDrop();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrop();
    });
  });

  // ── Book button in the top bar ───────────────────────────────────────────
  // Opens the list of clinic locations, each linking to that clinic's WhatsApp.
  var globalBookBtn = document.querySelector("[data-global-book]");
  var globalBookDrop = document.querySelector("[data-global-book-drop]");
  if (globalBookBtn && globalBookDrop) {
    function openGlobal() {
      globalBookDrop.removeAttribute("hidden");
      globalBookDrop.offsetHeight;
      globalBookDrop.classList.add("is-open");
      globalBookBtn.setAttribute("aria-expanded", "true");
    }
    function closeGlobal() {
      globalBookDrop.classList.remove("is-open");
      globalBookBtn.setAttribute("aria-expanded", "false");
      setTimeout(function () {
        if (!globalBookDrop.classList.contains("is-open")) globalBookDrop.setAttribute("hidden", "");
      }, 200);
    }
    globalBookBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      globalBookBtn.getAttribute("aria-expanded") === "true" ? closeGlobal() : openGlobal();
    });
    document.addEventListener("click", function (e) {
      if (!globalBookBtn.closest(".topbar__right").contains(e.target)) closeGlobal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeGlobal();
    });
  }

  // ── Book a Consultation button on treatment pages ────────────────────────
  // Same list of locations as the top bar.
  document.querySelectorAll("[data-book-toggle]").forEach(function (btn) {
    var wrapper = btn.closest(".treatBook");
    var dropdown = wrapper && wrapper.querySelector("[data-book-dropdown]");
    if (!dropdown) return;

    function openDrop() {
      dropdown.removeAttribute("hidden");
      dropdown.offsetHeight;
      dropdown.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
    }
    function closeDrop() {
      dropdown.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      setTimeout(function () {
        if (!dropdown.classList.contains("is-open")) dropdown.setAttribute("hidden", "");
      }, 200);
    }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      btn.getAttribute("aria-expanded") === "true" ? closeDrop() : openDrop();
    });
    document.addEventListener("click", function (e) {
      if (!wrapper.contains(e.target)) closeDrop();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrop();
    });
  });
})();
