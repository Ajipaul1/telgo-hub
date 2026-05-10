const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("reveal-ready");

const finePointer = window.matchMedia("(pointer: fine)").matches;

const initPageReady = () => {
    window.requestAnimationFrame(() => {
        document.documentElement.classList.add("is-loaded");
    });
};

const setStaggerIndexes = () => {
    const staggerGroups = [
        ".stats-band",
        ".feature-grid",
        ".service-grid",
        ".carousel-track",
        ".fleet-grid",
        ".why-grid",
        ".logo-wall",
        ".testimonials-grid .carousel-track",
    ];

    staggerGroups.forEach((selector) => {
        document.querySelectorAll(selector).forEach((group) => {
            [...group.children].forEach((child, index) => {
                child.style.setProperty("--stagger-index", `${Math.min(index, 9)}`);
            });
        });
    });
};

const initHeader = () => {
    const header = document.querySelector(".site-header");
    const navToggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".site-nav");
    const navLinks = nav ? [...nav.querySelectorAll("a")] : [];

    const syncHeaderState = () => {
        header?.classList.toggle("is-scrolled", window.scrollY > 18);
    };

    syncHeaderState();
    window.addEventListener("scroll", syncHeaderState, { passive: true });

    if (!navToggle || !nav) {
        return;
    }

    const closeNav = () => {
        navToggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        document.body.classList.remove("nav-open");
    };

    const openNav = () => {
        navToggle.setAttribute("aria-expanded", "true");
        nav.classList.add("is-open");
        document.body.classList.add("nav-open");
    };

    navToggle.addEventListener("click", () => {
        const expanded = navToggle.getAttribute("aria-expanded") === "true";
        if (expanded) {
            closeNav();
            return;
        }

        openNav();
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", closeNav);
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeNav();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 960) {
            closeNav();
        }
    });
};

const initReveals = () => {
    const revealItems = [...document.querySelectorAll("[data-reveal]")];

    if (!revealItems.length) {
        return;
    }

    if (prefersReducedMotion) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.18,
        rootMargin: "0px 0px -40px 0px",
    });

    revealItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const isInInitialViewport = rect.top < window.innerHeight - 40 && rect.bottom > 0;

        if (isInInitialViewport) {
            item.classList.add("is-visible");
            return;
        }

        observer.observe(item);
    });
};

const initScrollProgress = () => {
    const progress = document.createElement("div");
    progress.className = "scroll-progress";
    progress.setAttribute("aria-hidden", "true");
    document.body.append(progress);

    let ticking = false;

    const syncProgress = () => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
        progress.style.setProperty("--scroll-progress", `${Math.min(Math.max(amount, 0), 1)}`);
        ticking = false;
    };

    const requestSync = () => {
        if (ticking) {
            return;
        }

        ticking = true;
        window.requestAnimationFrame(syncProgress);
    };

    syncProgress();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);
};

const initActiveNavigation = () => {
    const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
    const sectionMap = new Map();

    navLinks.forEach((link) => {
        const section = document.querySelector(link.getAttribute("href"));
        if (section) {
            sectionMap.set(section, link);
        }
    });

    if (!sectionMap.size) {
        return;
    }

    const setActive = (section) => {
        navLinks.forEach((link) => link.classList.remove("is-active"));
        document.querySelectorAll("main > section").forEach((item) => item.classList.remove("is-current-section"));
        sectionMap.get(section)?.classList.add("is-active");
        section.classList.add("is-current-section");
    };

    const observer = new IntersectionObserver((entries) => {
        const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
            setActive(visible[0].target);
        }
    }, {
        rootMargin: "-35% 0px -50% 0px",
        threshold: [0.12, 0.28, 0.45, 0.62],
    });

    sectionMap.forEach((_, section) => observer.observe(section));
};

const initPointerDepth = () => {
    if (prefersReducedMotion || !finePointer) {
        return;
    }

    const surfaces = [
        ...document.querySelectorAll([
            ".button",
            ".stats-band",
            ".expertise-panel",
            ".glass-card",
            ".project-card",
            ".fleet-card",
            ".testimonial-card",
            ".why-card",
            ".feature-pill",
            ".logo-card",
            ".commitment-card",
            ".cta-shell",
        ].join(",")),
    ];

    surfaces.forEach((surface) => {
        surface.addEventListener("pointermove", (event) => {
            const rect = surface.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;

            surface.style.setProperty("--pointer-x", `${x.toFixed(2)}%`);
            surface.style.setProperty("--pointer-y", `${y.toFixed(2)}%`);

            if (surface.matches(".project-card, .fleet-card, .testimonial-card")) {
                const tiltX = ((x - 50) * 0.045).toFixed(2);
                const tiltY = ((50 - y) * 0.035).toFixed(2);
                surface.style.setProperty("--tilt-x", `${tiltX}deg`);
                surface.style.setProperty("--tilt-y", `${tiltY}deg`);
            }
        }, { passive: true });

        surface.addEventListener("pointerleave", () => {
            surface.style.removeProperty("--pointer-x");
            surface.style.removeProperty("--pointer-y");
            surface.style.removeProperty("--tilt-x");
            surface.style.removeProperty("--tilt-y");
        }, { passive: true });
    });
};

const initMagneticButtons = () => {
    if (prefersReducedMotion || !finePointer) {
        return;
    }

    document.querySelectorAll(".button").forEach((button) => {
        button.addEventListener("pointermove", (event) => {
            const rect = button.getBoundingClientRect();
            const x = event.clientX - rect.left - rect.width / 2;
            const y = event.clientY - rect.top - rect.height / 2;

            button.style.setProperty("--magnet-x", `${(x * 0.08).toFixed(2)}px`);
            button.style.setProperty("--magnet-y", `${(y * 0.12).toFixed(2)}px`);
        }, { passive: true });

        button.addEventListener("pointerleave", () => {
            button.style.removeProperty("--magnet-x");
            button.style.removeProperty("--magnet-y");
        }, { passive: true });
    });
};

const initScrollDepth = () => {
    if (prefersReducedMotion) {
        return;
    }

    let ticking = false;

    const syncDepth = () => {
        const scrollY = window.scrollY;
        document.documentElement.style.setProperty("--hero-shift", `${Math.min(scrollY * 0.08, 42).toFixed(2)}px`);
        document.documentElement.style.setProperty("--parallax-soft", `${(scrollY * -0.035).toFixed(2)}px`);
        ticking = false;
    };

    const requestSync = () => {
        if (ticking) {
            return;
        }

        ticking = true;
        window.requestAnimationFrame(syncDepth);
    };

    syncDepth();
    window.addEventListener("scroll", requestSync, { passive: true });
};

const initGlobalSpotlight = () => {
    if (prefersReducedMotion || !finePointer) {
        return;
    }

    let pointerX = window.innerWidth * 0.5;
    let pointerY = window.innerHeight * 0.35;
    let ticking = false;

    const syncPointer = () => {
        document.documentElement.style.setProperty("--cursor-x", `${pointerX.toFixed(0)}px`);
        document.documentElement.style.setProperty("--cursor-y", `${pointerY.toFixed(0)}px`);
        ticking = false;
    };

    window.addEventListener("pointermove", (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;

        if (ticking) {
            return;
        }

        ticking = true;
        window.requestAnimationFrame(syncPointer);
    }, { passive: true });

    syncPointer();
};

const animateCounter = (element) => {
    const target = Number.parseInt(element.dataset.counter ?? "0", 10);
    const suffix = element.dataset.suffix ?? "";

    if (!Number.isFinite(target)) {
        return;
    }

    if (prefersReducedMotion) {
        element.textContent = `${target}${suffix}`;
        return;
    }

    const duration = 1200;
    const startTime = performance.now();

    const frame = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - (1 - progress) ** 3;
        element.textContent = `${Math.round(target * eased)}${suffix}`;

        if (progress < 1) {
            window.requestAnimationFrame(frame);
        }
    };

    window.requestAnimationFrame(frame);
};

const initCounters = () => {
    const counters = [...document.querySelectorAll("[data-counter]")];

    if (!counters.length) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            animateCounter(entry.target);
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.5,
    });

    counters.forEach((counter) => observer.observe(counter));
};

const initCarousel = (carousel) => {
    const id = carousel.id;
    const track = carousel.querySelector(".carousel-track");
    const slides = track ? [...track.children] : [];
    const dotsRoot = carousel.querySelector("[data-carousel-dots]");
    const prevButton = id ? document.querySelector(`[data-carousel-prev="${id}"]`) : null;
    const nextButton = id ? document.querySelector(`[data-carousel-next="${id}"]`) : null;

    if (!track || slides.length === 0) {
        return;
    }

    const dots = slides.map((_, index) => {
        if (!dotsRoot) {
            return null;
        }

        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
        dot.setAttribute("aria-pressed", "false");
        dot.addEventListener("click", () => {
            const slide = slides[index];
            track.scrollTo({
                left: slide.offsetLeft,
                behavior: prefersReducedMotion ? "auto" : "smooth",
            });
        });
        dotsRoot.append(dot);
        return dot;
    });

    const getActiveIndex = () => {
        const scrollLeft = track.scrollLeft;
        let closestIndex = 0;
        let smallestDistance = Number.POSITIVE_INFINITY;

        slides.forEach((slide, index) => {
            const distance = Math.abs(slide.offsetLeft - scrollLeft);
            if (distance < smallestDistance) {
                smallestDistance = distance;
                closestIndex = index;
            }
        });

        return closestIndex;
    };

    const updateDots = () => {
        const activeIndex = getActiveIndex();
        dots.forEach((dot, index) => {
            const isActive = index === activeIndex;
            dot?.classList.toggle("is-active", isActive);
            dot?.setAttribute("aria-pressed", `${isActive}`);
        });
    };

    const scrollBySlide = (direction) => {
        const activeIndex = getActiveIndex();
        const nextIndex = Math.max(0, Math.min(slides.length - 1, activeIndex + direction));
        track.scrollTo({
            left: slides[nextIndex].offsetLeft,
            behavior: prefersReducedMotion ? "auto" : "smooth",
        });
    };

    prevButton?.addEventListener("click", () => scrollBySlide(-1));
    nextButton?.addEventListener("click", () => scrollBySlide(1));

    track.addEventListener("scroll", () => {
        window.requestAnimationFrame(updateDots);
    }, { passive: true });

    window.addEventListener("resize", updateDots);
    updateDots();
};

const initCarousels = () => {
    document.querySelectorAll("[data-carousel]").forEach((carousel) => initCarousel(carousel));
};

const initYear = () => {
    const year = new Date().getFullYear();
    document.querySelectorAll("[data-year]").forEach((node) => {
        node.textContent = `${year}`;
    });
};

initPageReady();
setStaggerIndexes();
initHeader();
initScrollProgress();
initActiveNavigation();
initReveals();
initCounters();
initCarousels();
initPointerDepth();
initMagneticButtons();
initScrollDepth();
initGlobalSpotlight();
initYear();
