'use strict';
/* ============================================
   CODING PORTFOLIO — SCRIPT.JS
   Animations: Preloader · Cursor · Typed text
   Canvas (Matrix rain) · Scroll reveals
   Skill bars · Contribution graph · Slider
   Form · Ripple · Text scramble · Parallax
   ============================================ */

/* ------------------------------------------
   1. PRELOADER — Terminal count-up
   ------------------------------------------ */
const preloader = document.getElementById('preloader');
const countEl   = document.getElementById('preload-count');

let pct = 0;
const pTimer = setInterval(() => {
    pct += Math.random() * 10 + 2;
    if (pct >= 100) { pct = 100; clearInterval(pTimer); doneLoading(); }
    countEl.textContent = Math.floor(pct) + '%';
}, 80);

function doneLoading() {
    setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.style.overflow = '';
        startTypedRole();
    }, 600);
}
document.body.style.overflow = 'hidden';


/* ------------------------------------------
   1b. IDE TAB SWITCHER (Hero Code Window)
   ------------------------------------------ */
(function initIdeTabs() {
    const tabs    = document.querySelectorAll('.ide-tab');
    const panels  = document.querySelectorAll('.ide-panel');
    const sidebar = document.getElementById('ide-sidebar');

    // Count visible lines in a panel's <pre>
    function getLineCount(panel) {
        const pre = panel.querySelector('pre');
        if (!pre) return 20;
        return pre.textContent.split('\n').length;
    }

    // Rebuild sidebar numbers for a given count
    function setSidebarLines(count) {
        if (!sidebar) return;
        sidebar.innerHTML = Array.from({ length: count }, (_, i) =>
            `<span>${i + 1}</span>`
        ).join('');
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            // Update tab styling
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Hide all panels, then show target with animation
            panels.forEach(p => {
                if (p.classList.contains('active')) {
                    // Fade out
                    p.style.opacity    = '0';
                    p.style.transform  = 'translateX(-6px)';
                    setTimeout(() => {
                        p.classList.remove('active');
                        p.style.opacity   = '';
                        p.style.transform = '';
                    }, 200);
                }
            });

            const targetPanel = document.getElementById(`panel-${target}`);
            if (targetPanel) {
                setTimeout(() => {
                    targetPanel.classList.add('active');
                    setSidebarLines(getLineCount(targetPanel));
                }, 220);
            }
        });
    });

    // Set initial sidebar line count from the active panel
    const activePanel = document.querySelector('.ide-panel.active');
    if (activePanel) setSidebarLines(getLineCount(activePanel));
})();


/* ------------------------------------------
   2. TYPED ROLE EFFECT
   ------------------------------------------ */
const roles = [
    'Aspiring Java Developer',
    'Web Developer',
    'Full-Stack Developer',
    'MCA Student @ ASM IBMR',
    'Open Source Enthusiast',
];
let roleIdx  = 0;
let charIdx  = 0;
let deleting = false;
const typedEl = document.getElementById('typed-role');

function startTypedRole() {
    if (!typedEl) return;
    typeLoop();
}

function typeLoop() {
    const current = roles[roleIdx];
    if (!deleting) {
        typedEl.textContent = current.slice(0, ++charIdx);
        if (charIdx === current.length) { deleting = true; setTimeout(typeLoop, 1800); return; }
    } else {
        typedEl.textContent = current.slice(0, --charIdx);
        if (charIdx === 0) {
            deleting = false;
            roleIdx  = (roleIdx + 1) % roles.length;
            setTimeout(typeLoop, 400);
            return;
        }
    }
    setTimeout(typeLoop, deleting ? 40 : 75);
}


/* ------------------------------------------
   3. CUSTOM CURSOR
   ------------------------------------------ */
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let   mx = 0, my = 0, fx = 0, fy = 0;

window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
});
(function animFollower() {
    fx += (mx - fx) * 0.1;
    fy += (my - fy) * 0.1;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(animFollower);
})();
document.querySelectorAll('a, button, .pill, .proj-link-btn, .contrib-day, .social-icon-btn').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});


/* ------------------------------------------
   3b. TOUCH CURSOR — Mobile finger tracker
   ------------------------------------------ */
const touchCursor = document.getElementById('touch-cursor');
if (touchCursor) {
    let touchActive = false;

    function moveTouchCursor(x, y) {
        touchCursor.style.left = x + 'px';
        touchCursor.style.top  = y + 'px';
    }

    window.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        moveTouchCursor(t.clientX, t.clientY);
        touchCursor.classList.remove('releasing');
        touchCursor.classList.add('active');
        touchActive = true;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (!touchActive) return;
        const t = e.touches[0];
        moveTouchCursor(t.clientX, t.clientY);
    }, { passive: true });

    window.addEventListener('touchend', () => {
        touchActive = false;
        touchCursor.classList.remove('active');
        touchCursor.classList.add('releasing');
        setTimeout(() => touchCursor.classList.remove('releasing'), 300);
    }, { passive: true });

    window.addEventListener('touchcancel', () => {
        touchActive = false;
        touchCursor.classList.remove('active', 'releasing');
    }, { passive: true });
}


/* ------------------------------------------
   4. NAV — SCROLL EFFECT
   ------------------------------------------ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


/* ------------------------------------------
   5. MATRIX / CODE RAIN CANVAS BACKGROUND
   ------------------------------------------ */
const addMatrixBg = () => {
    const canvas = document.createElement('canvas');
    canvas.id    = 'matrix-canvas';
    canvas.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        pointer-events: none; z-index: 0; opacity: 0.06;
    `;
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const cols     = Math.floor(canvas.width / 16);
    const drops    = new Array(cols).fill(0);
    const chars    = '01アイウエオabcdef{}[]<>=>'.split('');
    const fontSize = 13;

    function drawMatrix() {
        ctx.fillStyle = 'rgba(13,17,23,0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#39d353';
        ctx.font = fontSize + 'px Fira Code, monospace';

        drops.forEach((y, i) => {
            const ch = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(ch, i * 16, y * fontSize);
            if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        });
    }

    setInterval(drawMatrix, 50);
    window.addEventListener('resize', () => {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }, { passive: true });
};
addMatrixBg();


/* ------------------------------------------
   6. SCROLL REVEAL — IntersectionObserver
   ------------------------------------------ */
const revealItems = document.querySelectorAll('.reveal');
const revealObs   = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            entry.target.style.transitionDelay = (entry.target.dataset.delay || 0) + 'ms';
            entry.target.classList.add('visible');
            revealObs.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });
revealItems.forEach(el => revealObs.observe(el));


/* ------------------------------------------
   7. SKILL BARS — Fill on scroll
   ------------------------------------------ */
document.querySelectorAll('.skill-fill-bar').forEach(bar => {
    const barObs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
            setTimeout(() => { bar.style.width = bar.dataset.w + '%'; }, 150);
            barObs.disconnect();
        }
    }, { threshold: 0.3 });
    barObs.observe(bar);
});


/* ------------------------------------------
   8. GITHUB CONTRIBUTION GRAPH — Real Data
   ------------------------------------------ */
const grid = document.getElementById('contrib-grid');
if (grid) {
    const GITHUB_USERNAME = 'SuyashT0911';
    const LEVELS = ['#21262d', '#0e4429', '#006d32', '#26a641', '#39d353'];

    function getContribLevel(count) {
        if (count === 0) return 0;
        if (count <= 2)  return 1;
        if (count <= 5)  return 2;
        if (count <= 9)  return 3;
        return 4;
    }

    function renderGraph(weeks) {
        grid.innerHTML = '';
        // Pad to always show 52 full weeks
        const allDays = [];
        weeks.forEach(week => week.contributionDays.forEach(day => allDays.push(day)));

        allDays.forEach(day => {
            const el = document.createElement('div');
            el.classList.add('contrib-day');
            const lvl = getContribLevel(day.contributionCount);
            el.style.background = LEVELS[lvl];
            const dateStr = new Date(day.date).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
            });
            el.title = `${day.contributionCount} contribution${day.contributionCount !== 1 ? 's' : ''} on ${dateStr}`;
            grid.appendChild(el);
        });

        // Update the count label if it exists
        const countEl = document.querySelector('.gh-count');
        if (countEl) {
            const total = allDays.reduce((sum, d) => sum + d.contributionCount, 0);
            countEl.textContent = `${total} contributions in the last year`;
        }
    }

    function renderFallback() {
        grid.innerHTML = '';
        const weights = [55, 15, 12, 10, 8];
        function weightedRandom() {
            const total = weights.reduce((a, b) => a + b, 0);
            let rand = Math.random() * total;
            for (let i = 0; i < weights.length; i++) { rand -= weights[i]; if (rand <= 0) return i; }
            return 0;
        }
        for (let d = 0; d < 364; d++) {
            const el = document.createElement('div');
            el.classList.add('contrib-day');
            const lvl = weightedRandom();
            el.style.background = LEVELS[lvl];
            el.title = 'Contribution data unavailable';
            grid.appendChild(el);
        }
    }

    async function fetchContributions() {
        try {
            // Use github-contributions-api (free, no token needed)
            const res = await fetch(
                `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`
            );
            if (!res.ok) throw new Error('API error');
            const data = await res.json();

            // This API returns { total: {...}, contributions: [{date, count, level}] }
            if (data.contributions && data.contributions.length > 0) {
                grid.innerHTML = '';
                data.contributions.forEach(day => {
                    const el = document.createElement('div');
                    el.classList.add('contrib-day');
                    el.style.background = LEVELS[Math.min(day.level, 4)];
                    const dateStr = new Date(day.date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                    });
                    el.title = `${day.count} contribution${day.count !== 1 ? 's' : ''} on ${dateStr}`;
                    grid.appendChild(el);
                });

                // Update total count
                const countEl = document.querySelector('.gh-count');
                if (countEl) {
                    const total = data.contributions.reduce((sum, d) => sum + d.count, 0);
                    countEl.textContent = `${total} contributions in the last year · github.com/${GITHUB_USERNAME}`;
                }
            } else {
                renderFallback();
            }
        } catch (err) {
            console.warn('GitHub contributions API failed, using fallback.', err);
            renderFallback();
        }
    }

    // Fetch real contributions, then resize
    fetchContributions().then(() => sizeContribCells());
}

/* ------------------------------------------
   8b. CONTRIB GRID — Dynamic Square Sizer
   ------------------------------------------ */
function sizeContribCells() {
    const wrapper = document.querySelector('.contrib-scroll-wrapper');
    if (!wrapper) return;

    const WEEKS   = 52;
    const GAP     = 3;
    const MIN_CELL = 11; // px — smallest usable cell on mobile

    // How wide is the scroll area (excluding padding)?
    const available = wrapper.clientWidth - 2;
    // Calculate cell size so 52 columns exactly fill the width
    const computed = Math.floor((available - (WEEKS - 1) * GAP) / WEEKS);
    const cell = Math.max(computed, MIN_CELL);

    // Apply via CSS variable — both grid-template-rows and grid-auto-columns use it
    document.documentElement.style.setProperty('--contrib-cell', cell + 'px');
}

// Re-calculate on window resize (e.g. rotating phone, resizing desktop)
window.addEventListener('resize', sizeContribCells);
// Also run once on DOM ready in case grid is already rendered
document.addEventListener('DOMContentLoaded', sizeContribCells);


/* ------------------------------------------
   9. TEXT SCRAMBLE ON NAV HOVER
   ------------------------------------------ */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#{}[]<>';
document.querySelectorAll('.nav-item').forEach(el => {
    const orig = el.textContent;
    el.addEventListener('mouseenter', () => {
        let iter = 0; clearInterval(el._s);
        el._s = setInterval(() => {
            el.textContent = orig.split('').map((ch, i) =>
                i < iter ? orig[i] : CHARS[Math.floor(Math.random() * CHARS.length)]
            ).join('');
            if (iter++ >= orig.length) { clearInterval(el._s); el.textContent = orig; }
        }, 40);
    });
    el.addEventListener('mouseleave', () => { clearInterval(el._s); el.textContent = orig; });
});


/* ------------------------------------------
   10. RIPPLE EFFECT ON BUTTONS
   ------------------------------------------ */
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect   = this.getBoundingClientRect();
        const size   = Math.max(rect.width, rect.height);
        ripple.className  = 'ripple';
        ripple.style.cssText = `
            width:${size}px; height:${size}px;
            left:${e.clientX - rect.left - size/2}px;
            top:${e.clientY - rect.top  - size/2}px;
        `;
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    });
});


/* ------------------------------------------
   11. SMOOTH ANCHOR SCROLL
   ------------------------------------------ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});


/* ------------------------------------------
   12. CONTACT FORM FEEDBACK
   ------------------------------------------ */
const form      = document.getElementById('contact-form');
const submitBtn = document.getElementById('form-submit');
if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        const span = submitBtn.querySelector('span');
        const orig = span.textContent;
        submitBtn.disabled = true;
        span.textContent   = 'sending()...';
        setTimeout(() => {
            span.textContent            = '✓ message.sent()';
            submitBtn.style.background  = '#4fe07a';
            setTimeout(() => {
                span.textContent           = orig;
                submitBtn.disabled         = false;
                submitBtn.style.background = '';
                form.reset();
            }, 3000);
        }, 1200);
    });
}


/* ------------------------------------------
   13. PROJECT CODE PREVIEW — Typing effect
   ------------------------------------------ */
document.querySelectorAll('.code-preview-body pre').forEach((pre, idx) => {
    const html     = pre.innerHTML;
    const stripped = pre.textContent;
    // Show immediately with highlight — no destructive typing needed since
    // HTML entities and spans are complex. A line-by-line reveal is elegant enough.
    const lines     = pre.innerHTML.split('\n');
    pre.innerHTML   = '';
    const codeObs   = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
            lines.forEach((line, i) => {
                setTimeout(() => {
                    pre.innerHTML += line + (i < lines.length - 1 ? '\n' : '');
                }, i * 60);
            });
            codeObs.disconnect();
        }
    }, { threshold: 0.3 });
    codeObs.observe(pre);
});


/* ------------------------------------------
   14. HERO SECTION PARALLAX
   ------------------------------------------ */
const heroSection = document.getElementById('hero');
window.addEventListener('scroll', () => {
    if (!heroSection) return;
    const sy = window.scrollY;
    const greeting = document.querySelector('.hero-greeting');
    if (greeting) greeting.style.transform = `translateY(${sy * 0.08}px)`;
}, { passive: true });
