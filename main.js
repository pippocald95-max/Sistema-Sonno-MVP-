const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const diagramContent = {
  'SONNO': 'Il sonno è l’esito emergente di tutto il sistema. Per comprenderlo in modo utile bisogna leggere come i fattori si rinforzano, si compensano o si disturbano tra loro.',
  'Stress': 'Lo stress non è solo un carico psicologico: può alterare la soglia di attivazione del sistema e mantenere il sonno in una condizione di fragilità e vigilanza.',
  'Nutrizione': 'Timing, composizione dei pasti, stimolanti, digestione e relazione con il ritmo biologico possono modulare profondità, continuità e qualità del recupero.',
  'Ritmo Circadiano': 'Il ritmo circadiano coordina l’architettura temporale del recupero. Quando è disallineato, anche un sonno apparentemente sufficiente può risultare inefficiente.',
  'Ergonomia': 'Il sistema di riposo materiale incide su postura, micro-risvegli, adattamento fisico e continuità. Va valutato con criteri, non per intuizione.',
  'Recupero': 'Recuperare non coincide con il solo dormire: significa ripristinare risorse cognitive, fisiche e regolative in modo coerente con il carico della persona.',
  'Respirazione': 'Pattern respiratori, qualità del flusso e interferenze notturne possono modificare stabilità fisiologica e sensazione di recupero al risveglio.',
  'Neuroscienze': 'Le neuroscienze aiutano a leggere il sonno come processo dinamico di regolazione, consolidamento e integrazione, non come semplice routine serale.',
  'Ambiente': 'Luce, temperatura, micro-rumore, aria, disposizione e materiali costituiscono un contesto attivo che può sostenere o compromettere il recupero.',
  'Abitudini': 'Le abitudini quotidiane hanno effetti cumulativi. Il punto non è avere routine perfette, ma comprendere quali comportamenti stanno mantenendo il problema.'
};

const navToggle = document.querySelector('[data-nav-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    mobileMenu.classList.toggle('is-open');
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-open');
    });
  });
}

const details = [...document.querySelectorAll('.faq-list details')];
details.forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    details.forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

const panelTitle = document.querySelector('[data-panel-title]');
const panelText = document.querySelector('[data-panel-text]');
const nodes = [...document.querySelectorAll('.diagram-node')];
const lines = [...document.querySelectorAll('.diagram-links path')];

function activateNode(name) {
  nodes.forEach((node) => {
    node.classList.toggle('is-active', node.dataset.node === name);
  });
  lines.forEach((line) => {
    const isActive = line.dataset.line === name;
    line.classList.toggle('is-active', isActive);
    line.style.strokeOpacity = isActive ? '1' : '0.45';
  });
  if (panelTitle && panelText) {
    panelTitle.textContent = name;
    panelText.textContent = diagramContent[name] || diagramContent.SONNO;
  }
}

activateNode('SONNO');

nodes.forEach((node) => {
  const name = node.dataset.node;
  node.addEventListener('mouseenter', () => activateNode(name));
  node.addEventListener('focus', () => activateNode(name));
  node.addEventListener('click', () => activateNode(name));
  node.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activateNode(name);
    }
  });
});

const canvas = document.getElementById('ambient-canvas');
const ctx = canvas ? canvas.getContext('2d', { alpha: true }) : null;
let particles = [];
let pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };

function setupCanvas() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = window.innerWidth < 768 ? 26 : 42;
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.08,
    vy: (Math.random() - 0.5) * 0.08,
    r: Math.random() * 1.4 + 0.4,
    a: Math.random() * 0.24 + 0.06,
    depth: Math.random() * 0.8 + 0.2
  }));
}

function drawAmbient() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((p, index) => {
    p.x += p.vx + (pointer.x - window.innerWidth / 2) * 0.000008 * p.depth;
    p.y += p.vy + (pointer.y - window.innerHeight / 2) * 0.000008 * p.depth;

    if (p.x < -20) p.x = window.innerWidth + 20;
    if (p.x > window.innerWidth + 20) p.x = -20;
    if (p.y < -20) p.y = window.innerHeight + 20;
    if (p.y > window.innerHeight + 20) p.y = -20;

    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 10);
    glow.addColorStop(0, `rgba(143,163,181,${p.a * 0.7})`);
    glow.addColorStop(1, 'rgba(143,163,181,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(245,245,240,${p.a})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();

    if (index < particles.length - 1) {
      const next = particles[index + 1];
      const dx = next.x - p.x;
      const dy = next.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 160) {
        ctx.strokeStyle = `rgba(143,163,181,${0.08 * (1 - dist / 160)})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }
    }
  });

  if (!reduceMotion) window.requestAnimationFrame(drawAmbient);
}

if (canvas && ctx) {
  setupCanvas();
  if (!reduceMotion) drawAmbient();
  else drawAmbient();

  window.addEventListener('resize', setupCanvas);
  window.addEventListener('pointermove', (event) => {
    pointer = { x: event.clientX, y: event.clientY };
  }, { passive: true });
}

// ============================================
// PREMIUM TEXT ANIMATIONS - LUXURY TECH EFFECTS
// ============================================

// Initialize text animations with SplitType
function initPremiumTextAnimations() {
  if (!window.SplitType) return;

  // Split headings and paragraphs for word-level animations
  const headings = document.querySelectorAll('h1, h2, h3');
  const paragraphs = document.querySelectorAll('p, .hero-lead');

  headings.forEach((heading) => {
    const split = new SplitType(heading, { types: 'words' });
    const words = split.words;

    if (words && words.length > 0) {
      // Add class for neon glow
      heading.classList.add('neon-text', 'cyan');
      gsap.set(words, { opacity: 0.7 });

      // 3D Rotation & Morphing hover effect
      heading.addEventListener('mouseenter', () => {
        gsap.killTweensOf(words);
        words.forEach((word, i) => {
          gsap.to(word, {
            opacity: 1,
            rotationX: Math.random() * 20 - 10,
            rotationY: Math.random() * 20 - 10,
            skewY: Math.random() * 4 - 2,
            color: i % 2 === 0 ? '#00d9ff' : '#ff00ff',
            duration: 0.4,
            delay: i * 0.04,
            ease: 'back.out',
            transformOrigin: 'center center'
          });
        });
      });

      heading.addEventListener('mouseleave', () => {
        gsap.killTweensOf(words);
        gsap.to(words, {
          opacity: 1,
          rotationX: 0,
          rotationY: 0,
          skewY: 0,
          color: 'inherit',
          duration: 0.5,
          ease: 'power2.out'
        });
      });

      // Dynamic glitch effect with chromatic aberration
      if (!reduceMotion) {
        setInterval(() => {
          if (Math.random() > 0.96) {
            const randomWords = [...words].sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 2) + 1);
            
            randomWords.forEach((word) => {
              gsap.timeline()
                .to(word, { x: -3, y: 2, duration: 0.08, ease: 'none' }, 0)
                .to(word, { x: 3, y: -2, duration: 0.08, ease: 'none' })
                .to(word, { x: -1, y: 1, duration: 0.08, ease: 'none' })
                .to(word, { x: 0, y: 0, duration: 0.08, ease: 'none' });
            });
          }
        }, 2500);
      }
    }
  });

  // Scroll-based text effects with 3D transformations
  if (!reduceMotion && window.ScrollTrigger) {
    paragraphs.forEach((para) => {
      const split = new SplitType(para, { types: 'words' });
      if (split.words && split.words.length > 0) {
        gsap.to(split.words, {
          scrollTrigger: {
            trigger: para,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 0.5,
            markers: false
          },
          opacity: 1,
          rotationX: (i) => i % 3 === 0 ? 5 : -5,
          rotationY: (i) => i % 2 === 0 ? 8 : -8,
          duration: 1,
          stagger: 0.05
        });
      }
    });
  }

  // Mouse tracking for parallax chromatic effect
  if (!reduceMotion) {
    document.addEventListener('mousemove', (e) => {
      const moveX = (e.clientX - window.innerWidth / 2) * 0.0015;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.0015;

      headings.forEach((heading) => {
        const words = heading.querySelectorAll('[data-word]');
        words.forEach((word, i) => {
          gsap.to(word, {
            x: moveX * (i % 2 === 0 ? 20 : -20),
            y: moveY * (i % 2 === 0 ? 20 : -20),
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        });
      });
    });
  }
}

// Initialize when SplitType is ready
function waitForSplitType() {
  if (window.SplitType) {
    initPremiumTextAnimations();
  } else if (!reduceMotion) {
    setTimeout(waitForSplitType, 100);
  }
}
waitForSplitType();

// ============================================
// GSAP ANIMATIONS
// ============================================

if (!reduceMotion && window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
    gestureOrientation: 'vertical',
    wheelMultiplier: 0.9,
    touchMultiplier: 1
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  gsap.utils.toArray('.reveal').forEach((element) => {
    // Base reveal animation
    gsap.fromTo(element,
      { opacity: 0, filter: 'blur(10px)', clipPath: 'inset(0 0 12% 0)' },
      {
        opacity: 1,
        filter: 'blur(0px)',
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.05,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 88%'
        }
      }
    );

    // Premium staggered word animations for headings and paragraphs
    if (window.SplitType) {
      const headingsInReveal = element.querySelectorAll('h1, h2, h3');
      const paramsInReveal = element.querySelectorAll('p:not(.eyebrow)');
      
      headingsInReveal.forEach((heading) => {
        const split = new SplitType(heading, { types: 'words' });
        if (split.words && split.words.length > 0) {
          gsap.fromTo(split.words,
            { opacity: 0, y: 8, filter: 'blur(4px)' },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.7,
              stagger: 0.08,
              ease: 'back.out',
              scrollTrigger: {
                trigger: heading,
                start: 'top 85%'
              }
            }
          );
        }
      });

      paramsInReveal.forEach((paragraph) => {
        const split = new SplitType(paragraph, { types: 'words' });
        if (split.words && split.words.length > 0) {
          gsap.fromTo(split.words,
            { opacity: 0, y: 4 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.04,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: paragraph,
                start: 'top 90%'
              }
            }
          );
        }
      });
    }
  });

  // drawSVG animation (requires DrawSVGPlugin - use fallback opacity animation if not available)
  if (gsap.plugins && gsap.plugins.drawSVG) {
    gsap.fromTo('.network-lines path',
      { drawSVG: '0% 0%', opacity: 0.18 },
      {
        drawSVG: '0% 100%',
        opacity: 0.28,
        duration: 2.4,
        stagger: 0.08,
        ease: 'power2.out'
      }
    );
  } else {
    gsap.fromTo('.network-lines path',
      { opacity: 0.18 },
      {
        opacity: 0.28,
        duration: 2.4,
        stagger: 0.08,
        ease: 'power2.out'
      }
    );
  }

  gsap.to('.network-rings circle', {
    scale: 1.03,
    transformOrigin: 'center center',
    repeat: -1,
    yoyo: true,
    duration: 4,
    stagger: 0.35,
    ease: 'sine.inOut'
  });

  gsap.to('.network-nodes circle:not(.core-node)', {
    opacity: 0.55,
    repeat: -1,
    yoyo: true,
    stagger: { each: 0.12, repeat: -1 },
    duration: 2.8,
    ease: 'sine.inOut'
  });

  gsap.to('.diagram-field circle', {
    rotation: 360,
    transformOrigin: 'center center',
    duration: 80,
    repeat: -1,
    ease: 'none',
    stagger: 8
  });

  gsap.to('.diagram-node:not(.diagram-node--core)', {
    y: (i) => (i % 2 === 0 ? -6 : 6),
    duration: (i) => 4.8 + i * 0.2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    stagger: 0.12
  });

  gsap.fromTo('.diagram-links path',
    { opacity: 0.15 },
    {
      opacity: 0.52,
      duration: 1.5,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#sistema',
        start: 'top 70%'
      }
    }
  );

  if (window.innerWidth > 1100) {
    ScrollTrigger.create({
      trigger: '[data-pin-wrap]',
      start: 'top top+=96',
      end: '+=720',
      pin: '.system-diagram-wrap',
      pinSpacing: true,
      scrub: 0.8
    });

    gsap.to('#system-diagram', {
      scale: 1.03,
      transformOrigin: 'center center',
      ease: 'none',
      scrollTrigger: {
        trigger: '#sistema',
        start: 'top center',
        end: 'bottom bottom',
        scrub: 0.8
      }
    });
  }
} else {
  document.querySelectorAll('.reveal').forEach((el) => {
    el.style.opacity = '1';
  });
}

// Fallback: ensure text is visible even if libraries fail or animations don't start
// Run immediately and also on DOMContentLoaded
function ensureTextVisible() {
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach((el) => {
    const opacity = parseFloat(window.getComputedStyle(el).opacity);
    if (opacity === 0) {
      el.style.setProperty('opacity', '1', 'important');
    }
  });
}

// Try immediately
ensureTextVisible();

// Also try on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(ensureTextVisible, 500);
  });
} else {
  setTimeout(ensureTextVisible, 500);
}

// Additional fallback after animations should complete
setTimeout(ensureTextVisible, 2000);

// ============================================
// APPLY GEOMETRIC & NEON EFFECTS TO CONTAINERS
// ============================================

function applyGeometricEffects() {
  // Apply geometric box effects to cards and containers
  const containers = document.querySelectorAll(
    '.section, [class*="card"], [class*="container"], .hero, .path-card, .testimonial, .method-card'
  );

  containers.forEach((container, index) => {
    // Add geometric box class
    if (!container.classList.contains('geometric-box')) {
      container.classList.add('geometric-box');
    }

    // Occasionally add glitch effect
    if (index % 5 === 0) {
      container.classList.add('glitch-container');
    }
  });

  // Add neon/metallic glow to headings
  const headings = document.querySelectorAll('h1, h2, h3');
  headings.forEach((heading, index) => {
    if (!heading.classList.contains('neon-text')) {
      heading.classList.add('neon-text');
      if (index % 2 === 0) {
        heading.classList.add('cyan');
      } else {
        heading.classList.add('magenta');
      }
    }
  });

  // Add morphing shapes to specific elements
  const specialElements = document.querySelectorAll('.btn, .header-cta, [class*="cta"]');
  specialElements.forEach((el) => {
    if (!el.classList.contains('morphing-shape')) {
      el.classList.add('morphing-shape');
    }
  });
}

// Apply effects when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyGeometricEffects);
} else {
  setTimeout(applyGeometricEffects, 100);
}

// Re-apply effects periodically for dynamically loaded content
if (!reduceMotion) {
  setInterval(applyGeometricEffects, 5000);
}
