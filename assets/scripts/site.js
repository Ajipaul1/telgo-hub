const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("reveal-ready");

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

initHeader();
initReveals();
initCounters();
initCarousels();
initYear();
