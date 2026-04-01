// ---------- Font Picker ----------
const FONTS = ['Jua', 'Nunito', 'Lexend'];
const STORAGE_KEY_FONT = 'vigila-font';

function applyFont(font) {
    document.body.style.fontFamily = `'${font}', sans-serif`;
    document.body.dataset.font = font;
    document.querySelectorAll('.font-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.font === font);
    });
    try {
        localStorage.setItem(STORAGE_KEY_FONT, font);
    } catch {}
}

function initFontPicker() {
    const toggle = document.getElementById('fontPickerToggle');
    const dropdown = document.getElementById('fontDropdown');

    // Restore saved font
    try {
        const saved = localStorage.getItem(STORAGE_KEY_FONT);
        if (saved && FONTS.includes(saved)) applyFont(saved);
    } catch {}

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });

    document.querySelectorAll('.font-option').forEach(opt => {
        opt.addEventListener('click', () => {
            applyFont(opt.dataset.font);
            dropdown.classList.remove('open');
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#fontPickerWrapper')) {
            dropdown.classList.remove('open');
        }
    });
}

// ---------- Copy Buttons ----------
function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetId = btn.dataset.target;
            const codeEl = document.getElementById(targetId);
            if (!codeEl) return;

            // Get raw text, decode HTML entities that hljs may have encoded
            const text = codeEl.innerText || codeEl.textContent;

            try {
                await navigator.clipboard.writeText(text);
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = 'Copy';
                    btn.classList.remove('copied');
                }, 2000);
            } catch {
                // Fallback
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = 'Copy';
                    btn.classList.remove('copied');
                }, 2000);
            }
        });
    });
}

// ---------- Scroll Reveal ----------
function initScrollReveal() {
    const targets = document.querySelectorAll(
        '.feature-card, .step, .prose-card, .hero-inner, .hero-visual, .section-title, .section-body, .cta-inner'
    );

    targets.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12
    });

    targets.forEach(el => observer.observe(el));
}

// ---------- Highlight.js ----------
function initHighlight() {
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
    }
}

// ---------- Active nav link highlighting ----------
function initNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.style.fontWeight = link.getAttribute('href') === `#${id}` ? '700' : '';
                    link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--brand-text)' : '';
                });
            }
        });
    }, {
        threshold: 0.4
    });

    sections.forEach(s => observer.observe(s));
}

// ---------- PWA Service Worker ----------
function registerSW() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
        });
    }
}

// ---------- Mobile Nav Sidebar ----------
function initMobileNav() {
    const hamburger = document.getElementById('navHamburger');
    const sidebar = document.getElementById('navSidebar');
    const overlay = document.getElementById('navOverlay');
    const closeBtn = document.getElementById('navSidebarClose');

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        sidebar.setAttribute('aria-hidden', 'false');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        sidebar.setAttribute('aria-hidden', 'true');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', openSidebar);
    closeBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    // Close on any sidebar link click
    sidebar.querySelectorAll('.nav-sidebar-link').forEach(link => {
        link.addEventListener('click', closeSidebar);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSidebar();
    });
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
    initFontPicker();
    initCopyButtons();
    initScrollReveal();
    initHighlight();
    initNavHighlight();
    initMobileNav();
    registerSW();
});