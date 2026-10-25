document.addEventListener('DOMContentLoaded', () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'auto';
  }
  const lenis = new Lenis({
    autoRaf: true,
    lerp: 0.24,
    smoothWheel: true,
    wheelMultiplier: 1,
    syncTouch: false
  });

  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

  const storage = {
    get: (key) => { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set: (key, value) => { try { localStorage.setItem(key, value); } catch (e) {} }
  };

  /* ---------- Theme ---------- */

  const themeToggle = document.getElementById('theme-toggle');
  const themeStyle = document.getElementById('theme-style');
  const mobileThemeStyle = document.getElementById('mobile-theme-style');

  let themeAnimating = false;

  const applyTheme = (theme, save = true) => {
    if (themeAnimating) return;
    themeAnimating = true;
    const light = theme === 'light';
    themeStyle.disabled = !light;
    mobileThemeStyle.disabled = !light;
    if (save) storage.set('theme', theme);
    document.body.animate([
      { opacity: .96 },
      { opacity: 1 }
    ], { duration: 360, easing: 'ease-out' });
    themeToggle.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(.92)' },
      { transform: 'scale(1)' }
    ], { duration: 180, easing: 'ease-out' });
    setTimeout(() => { themeAnimating = false; }, 260);
  };

  const savedTheme = storage.get('theme');
  if (savedTheme) {
    applyTheme(savedTheme, false);
  } else {
    applyTheme(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark', false);
  }

  themeToggle.addEventListener('click', () => {
    applyTheme(themeStyle.disabled ? 'light' : 'dark');
  });

  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (storage.get('theme')) return;
    applyTheme(e.matches ? 'light' : 'dark', false);
  });

  /* ---------- History-backed layers ----------
     Every menu / popup pushes a history entry, so the browser or phone
     back button closes the top layer instead of leaving the site. All UI
     closes go through history.back() and the popstate handler does the
     actual closing, which keeps the stack and the history in sync. */

  const layers = [];
  let pendingBacks = 0;

  const pushLayer = (layer) => {
    layers.push(layer);
    history.pushState({ layer: layer.type, depth: layers.length }, '');
  };

  const topLayer = () => layers[layers.length - 1 - pendingBacks] || null;

  const requestClose = () => {
    if (layers.length - pendingBacks <= 0) return;
    pendingBacks++;
    history.back();
  };

  window.addEventListener('popstate', () => {
    if (pendingBacks > 0) pendingBacks--;
    const layer = layers.pop();
    if (layer) layer.close();
  });

  /* ---------- Navigation ---------- */

  const siteHeader = document.getElementById('site-header');
  const nav = siteHeader.querySelector('nav');
  const hamburger = siteHeader.querySelector('.hamburger');
  const navLinks = siteHeader.querySelector('.nav-links');

  // Menu items slide in one after another.
  navLinks.querySelectorAll(':scope > li').forEach((item, i) => item.style.setProperty('--n', i));

  // A section picked from the menu is scrolled to once the menu has closed
  // and the page is unlocked again.
  let pendingScroll = null;

  const scrollToSection = (target) => {
    lenis.scrollTo(target, {
      offset: -70,
      duration: 0.5,
      easing: (t) => 1 - Math.pow(1 - t, 3)
    });
  };

  const closeNavVisual = () => {
    nav.classList.remove('open');
    siteHeader.classList.remove('menu-open');
    document.documentElement.classList.remove('nav-open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    // Light lock: stop smooth scrolling only, so the page isn't re-laid out
    // (no scrollbar jump) while the menu slides.
    if (scrollLocks === 0) lenis.start();
    if (pendingScroll) {
      scrollToSection(pendingScroll);
      pendingScroll = null;
    }
  };

  const openNav = () => {
    if (nav.classList.contains('open')) return;
    nav.classList.add('open');
    siteHeader.classList.add('menu-open');
    document.documentElement.classList.add('nav-open');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    lenis.stop();
    pushLayer({ type: 'nav', close: closeNavVisual });
  };

  const closeNav = () => {
    if (!nav.classList.contains('open')) return;
    if (topLayer() && topLayer().type === 'nav') requestClose();
  };

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (nav.classList.contains('open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      if (nav.classList.contains('open')) {
        pendingScroll = target;
        closeNav();
      } else {
        scrollToSection(target);
      }
    });
  });

  // The bar stays black while the black hero is under it and turns into
  // frosted glass once the rest of the page reaches it.
  const heroBlock = document.getElementById('header');
  const updateHeader = () => {
    const overHero = heroBlock && heroBlock.getBoundingClientRect().bottom > siteHeader.offsetHeight;
    siteHeader.classList.toggle('is-scrolled', !overHero);
  };
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  // Highlight the menu link of the section being read.
  const menuLinks = Array.from(navLinks.querySelectorAll('a[href^="#"]'));
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      menuLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  menuLinks.forEach(link => {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) sectionObserver.observe(section);
  });

  /* ---------- Reveal on scroll ---------- */

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px', threshold: 0.08 });

  document.querySelectorAll('.fade-in, .slide-up').forEach(el => observer.observe(el));

  /* ---------- Typewriter ---------- */

  const typingText = document.getElementById('typing-text');

  const phrases = [
    "Building Autonomous Agricultural Robots",
    "Decoding Reality with Machine Vision",
    "Engineering the Future of Smart Farming",
    "Training Neural Nets for Field Intelligence",
    "Bridging Mechanical Logic and Nature",
    "Automating the Pulse of Modern Fields",
    "Crafting Precision Systems for Crop Growth",
    "Transforming Raw Data into Robotic Action",
    "Spatial Analysis via Advanced GIS",
    "Visualizing Sustainable Landscapes Remotely"
  ];

  let phraseIndex = 0;
  let characterIndex = 0;
  let isDeleting = false;

  const type = () => {
    const currentPhrase = phrases[phraseIndex];
    typingText.textContent = currentPhrase.substring(0, characterIndex);
    let typeSpeed = isDeleting ? 25 : 50;
    if (!isDeleting && characterIndex < currentPhrase.length) {
      characterIndex++;
    } else if (isDeleting && characterIndex > 0) {
      characterIndex--;
    } else {
      isDeleting = !isDeleting;
      typeSpeed = isDeleting ? 1500 : 500;
      if (!isDeleting) phraseIndex = (phraseIndex + 1) % phrases.length;
    }
    setTimeout(type, typeSpeed);
  };

  if (typingText) type();

  /* ---------- Hero network ----------
     Faint points drift behind the name and are linked by fine lines when
     close, like a sensor or neural network; now and then a small pulse of
     light travels along one of the links. */

  const heroSection = document.getElementById('header');
  const heroCanvas = heroSection && heroSection.querySelector('.hero-canvas');

  if (heroCanvas && heroCanvas.getContext) {
    const ctx = heroCanvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const LINK = 140;
    const PULSE_EVERY = 650;
    let width = 0;
    let height = 0;
    let points = [];
    let pulses = [];
    let lastPulse = 0;
    let running = false;
    let frame = null;
    let inView = true;

    const setup = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = heroCanvas.clientWidth;
      height = heroCanvas.clientHeight;
      heroCanvas.width = Math.round(width * ratio);
      heroCanvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(22, Math.min(70, Math.round(width * height / 11000)));
      points = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.08 + Math.random() * 0.14;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 0.7 + Math.random() * 1.1
        };
      });
      pulses = [];
    };

    const spawnPulse = () => {
      const a = Math.floor(Math.random() * points.length);
      const near = [];
      points.forEach((p, i) => {
        if (i !== a && Math.hypot(p.x - points[a].x, p.y - points[a].y) < LINK) near.push(i);
      });
      if (near.length) pulses.push({ a, b: near[Math.floor(Math.random() * near.length)], t: 0 });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 0.7;
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        for (let j = i + 1; j < points.length; j++) {
          const b = points[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(46, 141, 230, ${(1 - d / LINK) * 0.22})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = 'rgba(176, 198, 222, 0.55)';
      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      pulses.forEach(pulse => {
        const a = points[pulse.a];
        const b = points[pulse.b];
        // the link lights up a little while the pulse runs along it
        ctx.strokeStyle = `rgba(46, 141, 230, ${0.35 * Math.sin(pulse.t * Math.PI)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        const x = a.x + (b.x - a.x) * pulse.t;
        const y = a.y + (b.y - a.y) * pulse.t;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 7);
        glow.addColorStop(0, 'rgba(108, 191, 255, 0.9)');
        glow.addColorStop(1, 'rgba(108, 191, 255, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const step = (time) => {
      points.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.x = Math.min(Math.max(p.x, 0), width);
        p.y = Math.min(Math.max(p.y, 0), height);
      });
      if (time - lastPulse > PULSE_EVERY && pulses.length < 4) {
        spawnPulse();
        lastPulse = time;
      }
      pulses.forEach(pulse => { pulse.t += 0.012; });
      pulses = pulses.filter(pulse => pulse.t < 1
        && Math.hypot(points[pulse.a].x - points[pulse.b].x, points[pulse.a].y - points[pulse.b].y) < LINK);
      draw();
      frame = requestAnimationFrame(step);
    };

    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      frame = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    setup();
    draw();
    new ResizeObserver(() => {
      // ignore tiny changes (e.g. a scrollbar appearing) so the network
      // isn't rebuilt for nothing
      if (Math.abs(heroCanvas.clientWidth - width) < 24 && Math.abs(heroCanvas.clientHeight - height) < 24) return;
      setup();
      draw();
    }).observe(heroCanvas);
    // Only animate while the hero is on screen and the tab is visible.
    const update = () => {
      if (inView && !document.hidden) start(); else stop();
    };
    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      update();
    }).observe(heroSection);
    document.addEventListener('visibilitychange', update);
  }

  /* ---------- Popup windows ---------- */

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  // Remember whether the last interaction was a mouse/touch press or a key,
  // so focus is only handed back to the trigger for keyboard users (a
  // programmatic focus otherwise leaves a stray focus outline behind).
  let lastInput = 'pointer';
  window.addEventListener('pointerdown', () => { lastInput = 'pointer'; }, true);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') lastInput = 'keyboard';
  }, true);

  let scrollLocks = 0;
  const lockScroll = () => {
    if (scrollLocks++ === 0) {
      lenis.stop();
      document.body.classList.add('no-scroll');
    }
  };
  const unlockScroll = () => {
    if (--scrollLocks === 0) {
      if (!nav.classList.contains('open')) lenis.start();
      document.body.classList.remove('no-scroll');
    }
  };

  // content: the element shown in the window. Clicks outside any element
  // matching `inside` (the panel, or the image itself) close the window.
  const openModal = ({ content, label, variant = '', inside = '.modal-panel', onKeydown = null }) => {
    const trigger = document.activeElement;
    const openedByKeyboard = lastInput === 'keyboard';
    const overlay = el('div', `modal-overlay ${variant}`.trim());
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    if (label) overlay.setAttribute('aria-label', label);
    overlay.setAttribute('data-lenis-prevent', '');

    const closeBtn = el('button', 'modal-close');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      requestClose();
    });

    overlay.append(closeBtn, content);

    // Only treat it as an outside click if the press also started outside,
    // so selecting text and releasing over the backdrop doesn't close it.
    let pressedOutside = false;
    overlay.addEventListener('pointerdown', (e) => {
      pressedOutside = !e.target.closest(inside);
    });
    overlay.addEventListener('click', (e) => {
      if (pressedOutside && !e.target.closest(inside)) requestClose();
      pressedOutside = false;
    });

    document.body.appendChild(overlay);
    lockScroll();
    void overlay.offsetWidth;
    overlay.classList.add('is-open');
    closeBtn.focus({ preventScroll: true });

    pushLayer({
      type: 'modal',
      overlay,
      onKeydown,
      close: () => {
        overlay.classList.remove('is-open');
        overlay.classList.add('is-closing');
        unlockScroll();
        setTimeout(() => overlay.remove(), 300);
        if (openedByKeyboard && trigger && trigger.isConnected && typeof trigger.focus === 'function') {
          trigger.focus({ preventScroll: true });
        } else if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }
      }
    });
    return overlay;
  };

  const panelWindow = (className = '') => {
    const panel = el('div', `modal-panel ${className}`.trim());
    const scroll = el('div', 'modal-scroll');
    panel.appendChild(scroll);
    return { panel, scroll };
  };

  /* ---------- Cards ---------- */

  const sourceBoxes = Array.from(document.querySelectorAll('.page-content .project-box'));

  sourceBoxes.forEach((box, i) => {
    box.dataset.boxId = i;
    box.tabIndex = 0;
    box.setAttribute('role', 'button');
    box.setAttribute('aria-haspopup', 'dialog');
  });

  // Card chrome: a running number, an arrow, and for experience cards the
  // latest role (taken from the details) so every card has a meta line.
  document.querySelectorAll('.page-content .projects-container').forEach(container => {
    container.querySelectorAll(':scope > .project-box').forEach((box, i) => {
      box.style.setProperty('--i', i);
      const header = box.querySelector('.project-header');
      if (!header) return;
      if (!header.querySelector(':scope > .project-tag, :scope > .position-tag')) {
        const roles = box.querySelectorAll('.project-details .project-header');
        if (roles.length) {
          const meta = el('div', 'card-meta');
          roles[0].querySelectorAll('.post-tag, .post-date-tag').forEach(tag => meta.appendChild(tag.cloneNode(true)));
          if (roles.length > 1) {
            meta.appendChild(el('span', 'card-more', `+${roles.length - 1} role${roles.length > 2 ? 's' : ''}`));
          }
          header.insertBefore(meta, header.firstChild);
        }
      }
      const index = el('span', 'card-index', String(i + 1).padStart(2, '0'));
      index.setAttribute('aria-hidden', 'true');
      const arrow = el('span', 'card-arrow');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';
      box.insertBefore(index, box.firstChild);
      header.after(arrow);
    });
  });

  // Skill boxes rise in one after another, like the cards.
  document.querySelectorAll('.technicality-container .tech-box').forEach((box, i) => {
    box.style.setProperty('--i', i);
  });

  // Link buttons: an icon matching the destination, the label, and an arrow.
  const linkIcon = (href) => {
    if (/facebook\.com|fb\.me/i.test(href)) return 'fa-brands fa-facebook-f';
    if (/github\.com/i.test(href)) return 'fa-brands fa-github';
    if (/linkedin\.com/i.test(href)) return 'fa-brands fa-linkedin-in';
    if (/doi\.org|researchgate\.net/i.test(href)) return 'fa-regular fa-file-lines';
    return 'fa-solid fa-globe';
  };
  document.querySelectorAll('.page-content .link-button a').forEach(link => {
    const label = link.textContent.replace('⤴', '').trim();
    link.classList.add('link-pro');
    link.innerHTML = `<i class="link-icon ${linkIcon(link.href)}" aria-hidden="true"></i>`
      + '<span class="link-label"></span>'
      + '<i class="link-arrow fa-solid fa-arrow-right" aria-hidden="true"></i>';
    link.querySelector('.link-label').textContent = label;
  });

  // Soft glow that follows the mouse across a card.
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const box = e.target.closest && e.target.closest('.projects-container > .project-box');
    if (!box) return;
    const rect = box.getBoundingClientRect();
    box.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    box.style.setProperty('--my', `${e.clientY - rect.top}px`);
  });

  const openDetail = (box) => {
    const header = box.querySelector('.project-header');
    const details = box.querySelector('.project-details');
    if (!header || !details) return;
    const { panel, scroll } = panelWindow('modal-detail');
    const popup = el('div', 'project-popup');
    const tags = el('div', 'project-popup-tags');
    header.querySelectorAll(':scope > .project-tag, :scope > .position-tag, :scope > .date-tag, :scope > .post-tag, :scope > .post-date-tag').forEach(tag => {
      tags.appendChild(tag.cloneNode(true));
    });
    const titleElement = header.querySelector('.project-title');
    const title = titleElement ? titleElement.textContent.trim() : '';
    const body = details.cloneNode(true);
    body.classList.add('project-popup-body');
    body.querySelectorAll('br').forEach(br => br.remove());
    body.querySelectorAll('.media-grid-container').forEach(grid => {
      const count = grid.children.length;
      const head = el('div', 'gallery-head');
      head.append(el('span', 'gallery-label', 'Gallery'), el('span', 'gallery-line'), el('span', 'gallery-count', `${count} item${count === 1 ? '' : 's'}`));
      grid.before(head);
      grid.querySelectorAll('.clickable-media[data-type="image"] .media-mask-overlay').forEach(mask => {
        mask.innerHTML = '<i class="fa-solid fa-expand" aria-hidden="true"></i>';
      });
      grid.querySelectorAll('.clickable-media[data-type="pdf"]').forEach(item => {
        const mask = item.querySelector('.media-mask-overlay');
        if (mask) mask.innerHTML = '<i class="fa-solid fa-expand" aria-hidden="true"></i>';
        const icon = item.querySelector('.pdf-icon-symbol');
        if (icon) icon.innerHTML = '<i class="fa-regular fa-file-pdf" aria-hidden="true"></i>';
        item.appendChild(el('span', 'pdf-badge', 'PDF'));
      });
    });
    body.querySelectorAll('.auto-link-preview').forEach(renderLinkPreview);
    if (tags.children.length) popup.appendChild(tags);
    popup.append(el('div', 'project-popup-title', title), el('div', 'project-popup-divider'), body);
    scroll.appendChild(popup);
    openModal({ content: panel, label: title || 'Details' });
  };

  const openList = (container) => {
    const section = container.closest('section');
    const sectionTitle = section && section.querySelector('.title');
    const boxes = Array.from(container.querySelectorAll(':scope > .project-box'));
    const { panel, scroll } = panelWindow('modal-list');
    const heading = el('div', 'title', sectionTitle ? sectionTitle.textContent.trim() : '');
    heading.setAttribute('align', 'center');
    const list = el('div', 'projects-container');
    boxes.forEach(box => {
      const card = box.cloneNode(true);
      card.classList.remove('show-more-hidden');
      const details = card.querySelector('.project-details');
      if (details) details.remove();
      list.appendChild(card);
    });
    scroll.append(heading, el('hr', 'line'), list);
    openModal({ content: panel, label: sectionTitle ? sectionTitle.textContent.trim() : 'All entries' });
  };

  document.querySelectorAll('.page-content .projects-container').forEach(container => {
    const boxes = Array.from(container.querySelectorAll(':scope > .project-box'));
    if (boxes.length <= 3) return;
    boxes.slice(3).forEach(box => box.classList.add('show-more-hidden'));
    const wrapper = el('div', 'show-more-btn-wrapper');
    const btn = el('button', 'show-more-btn', 'Show More');
    btn.type = 'button';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openList(container);
    });
    wrapper.appendChild(btn);
    container.appendChild(wrapper);
  });

  /* ---------- Media: images, documents, maps ---------- */

  // gallery: every image source in the same gallery, so the viewer can step
  // through them with the arrows, the arrow keys or a swipe.
  const openImage = (src, gallery = [src]) => {
    let current = Math.max(0, gallery.indexOf(src));
    const stage = el('div', 'media-stage');
    const img = el('img', 'portal-fullscreen-img');
    img.src = src;
    img.alt = '';
    stage.appendChild(img);

    const hasGallery = gallery.length > 1;
    const counter = el('div', 'gallery-counter');
    const navButton = (direction, label, icon) => {
      const button = el('button', `gallery-nav gallery-${direction}`);
      button.type = 'button';
      button.setAttribute('aria-label', label);
      button.innerHTML = `<i class="fa-solid ${icon}"></i>`;
      return button;
    };
    const prev = navButton('prev', 'Previous image', 'fa-chevron-left');
    const next = navButton('next', 'Next image', 'fa-chevron-right');

    let showAt = () => {};
    const overlay = openModal({
      content: stage,
      label: 'Image viewer',
      variant: 'media-variant',
      inside: '.portal-fullscreen-img, .gallery-nav, .gallery-counter',
      onKeydown: (e) => {
        if (!hasGallery) return false;
        if (e.key === 'ArrowLeft') { showAt(current - 1); return true; }
        if (e.key === 'ArrowRight') { showAt(current + 1); return true; }
        return false;
      }
    });
    if (hasGallery) overlay.append(prev, next, counter);
    // Zoom with the wheel (or a pinch), and drag to move around a zoomed image.
    let scale = 1;
    let x = 0;
    let y = 0;
    const MIN_SCALE = 1;
    const MAX_SCALE = 4;

    const clampPan = () => {
      const maxX = img.offsetWidth * (scale - 1) / 2;
      const maxY = img.offsetHeight * (scale - 1) / 2;
      x = Math.min(Math.max(x, -maxX), maxX);
      y = Math.min(Math.max(y, -maxY), maxY);
    };

    const apply = () => {
      clampPan();
      img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      img.classList.toggle('is-zoomed', scale > 1);
    };

    showAt = (index) => {
      current = (index + gallery.length) % gallery.length;
      scale = 1;
      x = 0;
      y = 0;
      apply();
      img.classList.add('is-switching');
      const nextImage = new Image();
      nextImage.onload = nextImage.onerror = () => {
        img.src = gallery[current];
        img.classList.remove('is-switching');
      };
      nextImage.src = gallery[current];
      counter.textContent = `${current + 1} / ${gallery.length}`;
    };
    counter.textContent = `${current + 1} / ${gallery.length}`;
    prev.addEventListener('click', (e) => { e.stopPropagation(); showAt(current - 1); });
    next.addEventListener('click', (e) => { e.stopPropagation(); showAt(current + 1); });

    const setScale = (next) => {
      const previous = scale;
      scale = Math.min(Math.max(MIN_SCALE, next), MAX_SCALE);
      // Keep the same spot of the image in the middle while zooming.
      x *= scale / previous;
      y *= scale / previous;
      apply();
    };

    overlay.addEventListener('wheel', (e) => {
      e.preventDefault();
      setScale(scale + (e.deltaY > 0 ? -0.15 : 0.15));
    }, { passive: false });

    img.draggable = false;
    const pointers = new Map();
    let drag = null;
    let pinch = null;
    let swipe = null;

    const pinchDistance = () => {
      const [a, b] = Array.from(pointers.values());
      return Math.hypot(a.x - b.x, a.y - b.y);
    };

    img.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try { img.setPointerCapture(e.pointerId); } catch (err) {}
      img.classList.add('is-dragging');
      if (pointers.size === 2) {
        drag = null;
        pinch = { distance: pinchDistance(), scale };
      } else if (pointers.size === 1) {
        drag = { startX: e.clientX, startY: e.clientY, x, y };
        swipe = { x: e.clientX, y: e.clientY };
      }
      if (pointers.size > 1) swipe = null;
      e.preventDefault();
    });

    img.addEventListener('pointermove', (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pointers.size === 2) {
        setScale(pinch.scale * pinchDistance() / pinch.distance);
      } else if (drag && scale > 1) {
        x = drag.x + (e.clientX - drag.startX);
        y = drag.y + (e.clientY - drag.startY);
        apply();
      }
    });

    const endPointer = (e) => {
      if (!pointers.delete(e.pointerId)) return;
      // A quick sideways swipe on an un-zoomed image moves through the gallery.
      if (swipe && hasGallery && scale === 1 && e.type === 'pointerup') {
        const dx = e.clientX - swipe.x;
        const dy = e.clientY - swipe.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) showAt(current + (dx < 0 ? 1 : -1));
      }
      swipe = null;
      pinch = null;
      if (pointers.size === 1) {
        const [rest] = pointers.values();
        drag = { startX: rest.x, startY: rest.y, x, y };
      } else {
        drag = null;
        img.classList.remove('is-dragging');
      }
    };
    img.addEventListener('pointerup', endPointer);
    img.addEventListener('pointercancel', endPointer);
  };

  const PDFJS_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  let pdfjsReady = null;

  const loadPdfJs = () => {
    if (!pdfjsReady) {
      pdfjsReady = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = PDFJS_SRC;
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
          resolve(window.pdfjsLib);
        };
        script.onerror = () => {
          pdfjsReady = null;
          reject(new Error('pdf.js failed to load'));
        };
        document.head.appendChild(script);
      });
    }
    return pdfjsReady;
  };

  // Phone browsers (and some desktop ones) can't show PDFs in an iframe,
  // so render the pages ourselves for the same view everywhere.
  const renderPdfPages = (body, src, zoomLabel) => {
    const pages = el('div', 'doc-pages');
    const status = el('div', 'doc-status', 'Loading document…');
    pages.appendChild(status);
    body.appendChild(pages);

    // Zoom (buttons, Ctrl + wheel / trackpad pinch, two-finger pinch) and
    // drag-to-pan. Pages resize instantly while zooming, then re-render
    // sharply once zooming pauses.
    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 4;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const sheets = [];
    let zoom = 1;
    let fitWidth = 0;
    let redrawTimer = null;

    const sheetWidth = () => `${Math.round(fitWidth * zoom)}px`;

    // Each sheet is a page: the drawn canvas, an invisible text layer on top
    // so text can be selected and copied, and a layer of clickable links.
    const sizeSheet = (sheet) => {
      const unscaled = sheet.page.getViewport({ scale: 1 });
      sheet.wrap.style.width = sheetWidth();
      sheet.wrap.style.setProperty('--scale-factor', fitWidth * zoom / unscaled.width);
    };

    const drawSheet = async (sheet) => {
      const unscaled = sheet.page.getViewport({ scale: 1 });
      // Cap the backing canvas so very high zoom levels don't exhaust memory.
      const scale = Math.min((fitWidth * zoom / unscaled.width) * ratio, 4096 / unscaled.width);
      const viewport = sheet.page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      if (sheet.task) sheet.task.cancel();
      sheet.task = sheet.page.render({ canvasContext: canvas.getContext('2d'), viewport });
      try {
        await sheet.task.promise;
      } catch (err) {
        return;
      }
      sheet.canvas.replaceWith(canvas);
      sheet.canvas = canvas;
    };

    const addTextLayer = async (pdfjsLib, sheet) => {
      const layer = el('div', 'textLayer');
      sheet.wrap.appendChild(layer);
      const textContent = await sheet.page.getTextContent();
      await pdfjsLib.renderTextLayer({
        textContentSource: textContent,
        container: layer,
        viewport: sheet.page.getViewport({ scale: fitWidth * zoom / sheet.page.getViewport({ scale: 1 }).width }),
        textDivs: []
      }).promise;
      const end = el('div', 'endOfContent');
      layer.appendChild(end);
    };

    const addLinkLayer = async (sheet) => {
      const annotations = await sheet.page.getAnnotations();
      const unscaled = sheet.page.getViewport({ scale: 1 });
      const layer = el('div', 'doc-link-layer');
      annotations.forEach(annotation => {
        const url = annotation.subtype === 'Link' && (annotation.url || annotation.unsafeUrl);
        if (!url) return;
        const [x1, y1, x2, y2] = unscaled.convertToViewportRectangle(annotation.rect);
        const link = el('a', 'doc-link');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.title = url;
        // Percentages keep the links lined up at every zoom level.
        link.style.left = `${Math.min(x1, x2) / unscaled.width * 100}%`;
        link.style.top = `${Math.min(y1, y2) / unscaled.height * 100}%`;
        link.style.width = `${Math.abs(x2 - x1) / unscaled.width * 100}%`;
        link.style.height = `${Math.abs(y2 - y1) / unscaled.height * 100}%`;
        layer.appendChild(link);
      });
      if (layer.children.length) sheet.wrap.appendChild(layer);
    };

    const setZoom = (next, anchor) => {
      const previous = zoom;
      zoom = Math.min(Math.max(MIN_ZOOM, next), MAX_ZOOM);
      if (zoom === previous || !fitWidth) return;
      const rect = pages.getBoundingClientRect();
      const ax = anchor ? anchor.x - rect.left : pages.clientWidth / 2;
      const ay = anchor ? anchor.y - rect.top : pages.clientHeight / 2;
      const contentX = pages.scrollLeft + ax;
      const contentY = pages.scrollTop + ay;
      sheets.forEach(sizeSheet);
      // Keep the point under the cursor (or the middle) in place.
      pages.scrollLeft = contentX * (zoom / previous) - ax;
      pages.scrollTop = contentY * (zoom / previous) - ay;
      if (zoomLabel) zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
      pages.classList.toggle('is-zoomed', zoom > 1);
      clearTimeout(redrawTimer);
      redrawTimer = setTimeout(() => sheets.forEach(drawSheet), 200);
    };

    pages.addEventListener('wheel', (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom(zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1), { x: e.clientX, y: e.clientY });
    }, { passive: false });

    let drag = null;
    pages.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      // Dragging on text selects it and links stay clickable; anywhere else pans.
      if (e.target.closest('.textLayer span, .doc-link')) return;
      // Leave the scrollbars alone.
      if (e.offsetX >= pages.clientWidth || e.offsetY >= pages.clientHeight) return;
      drag = { x: e.clientX, y: e.clientY, left: pages.scrollLeft, top: pages.scrollTop };
      pages.classList.add('is-dragging');
      try { pages.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });
    pages.addEventListener('pointermove', (e) => {
      if (!drag) return;
      pages.scrollLeft = drag.left - (e.clientX - drag.x);
      pages.scrollTop = drag.top - (e.clientY - drag.y);
    });
    const endDrag = () => {
      drag = null;
      pages.classList.remove('is-dragging');
    };
    pages.addEventListener('pointerup', endDrag);
    pages.addEventListener('pointercancel', endDrag);

    let pinch = null;
    const touchInfo = (touches) => {
      const [a, b] = [touches[0], touches[1]];
      return {
        distance: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
        x: (a.clientX + b.clientX) / 2,
        y: (a.clientY + b.clientY) / 2
      };
    };
    pages.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) pinch = { ...touchInfo(e.touches), zoom };
    }, { passive: true });
    pages.addEventListener('touchmove', (e) => {
      if (!pinch || e.touches.length !== 2) return;
      e.preventDefault();
      const now = touchInfo(e.touches);
      setZoom(pinch.zoom * now.distance / pinch.distance, now);
    }, { passive: false });
    pages.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) pinch = null;
    });

    (async () => {
      try {
        const pdfjsLib = await loadPdfJs();
        const doc = await pdfjsLib.getDocument(src).promise;
        status.remove();
        const padding = parseFloat(getComputedStyle(pages).paddingLeft) || 0;
        fitWidth = Math.min(pages.clientWidth - padding * 2, 900);
        for (let n = 1; n <= doc.numPages; n++) {
          if (!body.isConnected) return;
          const page = await doc.getPage(n);
          const unscaled = page.getViewport({ scale: 1 });
          const wrap = el('div', 'doc-sheet');
          wrap.style.aspectRatio = `${unscaled.width} / ${unscaled.height}`;
          const placeholder = document.createElement('canvas');
          wrap.appendChild(placeholder);
          pages.appendChild(wrap);
          const sheet = { page, wrap, canvas: placeholder, task: null };
          sizeSheet(sheet);
          sheets.push(sheet);
          await Promise.all([
            drawSheet(sheet),
            addTextLayer(pdfjsLib, sheet).catch(() => {}),
            addLinkLayer(sheet).catch(() => {})
          ]);
        }
      } catch (err) {
        status.textContent = 'This document could not be displayed here. ';
        const link = el('a', '', 'Open it in a new tab');
        link.href = src;
        link.target = '_blank';
        link.rel = 'noopener';
        status.appendChild(link);
      }
    })();

    return { zoomIn: () => setZoom(zoom * 1.25), zoomOut: () => setZoom(zoom / 1.25), reset: () => setZoom(1) };
  };

  const openDocument = (src, title) => {
    const panel = el('div', 'modal-panel doc-panel');
    const toolbar = el('div', 'doc-toolbar');
    const open = el('a', 'doc-action');
    open.href = src;
    open.target = '_blank';
    open.rel = 'noopener';
    open.setAttribute('aria-label', 'Open in new tab');
    open.innerHTML = '<span class="doc-action-text">Open in new tab </span>⤴';
    const zoomGroup = el('div', 'doc-zoom');
    const zoomOut = el('button', 'doc-action doc-zoom-btn', '−');
    const zoomLevel = el('button', 'doc-action doc-zoom-level', '100%');
    const zoomIn = el('button', 'doc-action doc-zoom-btn', '+');
    zoomOut.type = zoomLevel.type = zoomIn.type = 'button';
    zoomOut.setAttribute('aria-label', 'Zoom out');
    zoomIn.setAttribute('aria-label', 'Zoom in');
    zoomLevel.setAttribute('aria-label', 'Reset zoom');
    zoomGroup.append(zoomOut, zoomLevel, zoomIn);
    toolbar.append(el('div', 'doc-title', title), zoomGroup, open);
    const body = el('div', 'doc-body');
    panel.append(toolbar, body);
    openModal({ content: panel, label: title, variant: 'doc-variant' });
    const controls = renderPdfPages(body, src, zoomLevel);
    zoomOut.addEventListener('click', controls.zoomOut);
    zoomIn.addEventListener('click', controls.zoomIn);
    zoomLevel.addEventListener('click', controls.reset);
  };

  const getNativeMapUrl = (mapSrc) => {
    const coordMatch = mapSrc.match(/!2d(-?\d+\.?\d*)!3d(-?\d+\.?\d*)/);
    const nameMatch = mapSrc.match(/!2s([^!]+)!5e/);
    const label = nameMatch ? decodeURIComponent(nameMatch[1]) : 'Location';

    if (!coordMatch) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`;
    }

    const lng = coordMatch[1];
    const lat = coordMatch[2];
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    return isIOS
      ? `https://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(label)}`
      : `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(label)})`;
  };

  const openMap = (mapSrc) => {
    if (isMobile()) {
      window.location.href = getNativeMapUrl(mapSrc);
      return;
    }
    const panel = el('div', 'modal-panel map-panel');
    const frame = el('iframe');
    frame.src = mapSrc;
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    frame.title = 'Map';
    panel.appendChild(frame);
    openModal({ content: panel, label: 'Location map' });
  };

  const mediaTitle = (element) => {
    if (element.dataset.title) return element.dataset.title;
    const name = element.querySelector('.pdf-filename-txt');
    if (name) return name.textContent.trim();
    if (element.classList.contains('cv-pdf')) return 'Curriculum Vitae';
    return 'Document';
  };

  /* ---------- Link previews ---------- */

  const previewCache = new Map();

  const fetchPreview = (url) => {
    if (!previewCache.has(url)) {
      const domain = new URL(url).hostname.replace('www.', '');
      const request = fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
        .then(response => response.json())
        .then(data => {
          const doc = new DOMParser().parseFromString(data.contents || '', 'text/html');
          const getMeta = (property) => {
            const meta = doc.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
            return meta ? meta.getAttribute('content') : null;
          };
          let image = getMeta('og:image');
          if (image && !image.startsWith('http')) {
            image = new URL(image, url).href;
          }
          const title = getMeta('og:title') || (doc.querySelector('title') || {}).textContent || domain;
          return { title: title.trim(), image, domain };
        })
        .catch(() => ({ title: domain, image: null, domain }));
      previewCache.set(url, request);
    }
    return previewCache.get(url);
  };

  function renderLinkPreview(preview) {
    const url = preview.dataset.url;
    if (!url) return;
    preview.innerHTML = '<div class="link-preview-card flex-skeleton-loader"><div class="preview-loading-shimmer"></div></div>';
    fetchPreview(url).then(meta => {
      const card = el('div', 'link-preview-card');
      card.innerHTML = '<div class="media-mask-overlay"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></div>';
      const imageWrap = el('div', 'link-preview-image-wrapper');
      if (meta.image) {
        const img = el('img', 'link-preview-image');
        img.src = meta.image;
        img.alt = '';
        img.addEventListener('error', () => {
          imageWrap.innerHTML = '<i class="fa-solid fa-link"></i>';
        });
        imageWrap.appendChild(img);
      } else {
        imageWrap.innerHTML = '<i class="fa-solid fa-link"></i>';
      }
      const info = el('div', 'link-preview-info');
      info.append(el('div', 'link-preview-title', meta.title), el('div', 'link-preview-domain', meta.domain));
      card.append(imageWrap, info);
      preview.replaceChildren(card);
    });
  }

  const prefetchPreviews = () => {
    document.querySelectorAll('.page-content .auto-link-preview').forEach(preview => {
      if (preview.dataset.url) fetchPreview(preview.dataset.url);
    });
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(prefetchPreviews, { timeout: 3000 });
  } else {
    setTimeout(prefetchPreviews, 1500);
  }

  /* ---------- Click routing ---------- */

  document.addEventListener('click', (e) => {
    const media = e.target.closest('.clickable-media');
    if (media) {
      e.stopPropagation();
      const type = media.dataset.type;
      if (type === 'image') {
        const grid = media.closest('.media-grid-container');
        const gallery = grid
          ? Array.from(grid.querySelectorAll('.clickable-media[data-type="image"]')).map(item => item.dataset.src)
          : [media.dataset.src];
        openImage(media.dataset.src, gallery);
      } else if (type === 'pdf') {
        openDocument(media.dataset.src, mediaTitle(media));
      } else if (type === 'link' && media.dataset.url) {
        window.open(media.dataset.url, '_blank', 'noopener');
      }
      return;
    }

    const location = e.target.closest('.location-trigger');
    if (location) {
      openMap(location.dataset.mapSrc);
      return;
    }

    const box = e.target.closest('.project-box');
    if (box && !e.target.closest('a')) {
      const source = sourceBoxes[box.dataset.boxId];
      if (source) openDetail(source);
      return;
    }

    if (nav.classList.contains('open') && !nav.contains(e.target)) {
      closeNav();
    }
  });

  /* ---------- Keyboard ---------- */

  const focusable = 'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

  window.addEventListener('keydown', (e) => {
    const top = topLayer();

    if (e.key === 'Escape' || e.keyCode === 27) {
      // Pressing Esc after using the mouse shouldn't leave a keyboard focus
      // outline on whatever was clicked last.
      if (lastInput === 'pointer' && document.activeElement && document.activeElement !== document.body) {
        document.activeElement.blur();
      }
      if (top) {
        e.preventDefault();
        requestClose();
      } else {
        openNav();
      }
      return;
    }

    if (top && top.onKeydown && top.onKeydown(e)) {
      e.preventDefault();
      return;
    }

    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('project-box')) {
      e.preventDefault();
      e.target.click();
      return;
    }

    if (e.key === 'Tab' && top && top.type === 'modal') {
      const items = Array.from(top.overlay.querySelectorAll(focusable)).filter(node => node.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!top.overlay.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ---------- Logo loop ---------- */

  const logoTrack = document.getElementById("logo-track");

  if (logoTrack) {
    const technologies = [
      { name: "HTML5", icon: "devicon:html5"},
      { name: "CSS3", icon: "devicon:css3"},
      { name: "JavaScript", icon: "devicon:javascript"},
      { name: "Python", icon: "devicon:python"},
      { name: "Git", icon: "devicon:git"},
      { name: "GitHub", type: "image", src: "https://cdn.simpleicons.org/github/838383"},
      {name: "C++", icon: "devicon:cplusplus"},
      {name: "Arduino", icon: "devicon:arduino"},
      {name: "Linux", icon: "devicon:linux"},
      {name: "OpenCV", icon: "devicon:opencv"},
      {name: "TensorFlow", icon: "devicon:tensorflow"},
      {name: "PyTorch", icon: "devicon:pytorch"},
      { name: "Ultralytics", type: "image", src: "https://raw.githubusercontent.com/ultralytics/assets/main/logo/Ultralytics-logomark-color.png"},
      {name: "VS Code", icon: "devicon:vscode"},
      {name: "Raspberry Pi", icon: "devicon:raspberrypi"},
      {name: "MATLAB", type: "image", src: "https://upload.wikimedia.org/wikipedia/commons/2/21/Matlab_Logo.png"},
      {name: "QGIS", type: "image", src: "https://dl.flathub.org/media/org/qgis/qgis.desktop/7035c8f06da487a2a289a2320c6d55b2/icons/128x128@2/org.qgis.qgis.desktop.png"},
      {name: "GEE", type: "image", src: "https://images.icon-icons.com/1508/PNG/512/googleearth-engine_104576.png"},
      {name: "FreeCAD", type: "image", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/FreeCAD-symbol.svg/1280px-FreeCAD-symbol.svg.png"}
    ];

    function createLogoGroup(hidden) {
      const group = document.createElement("div");
      group.className = "logo-group";
      if (hidden) group.setAttribute("aria-hidden", "true");
      technologies.forEach(tech => {
        const item = document.createElement("div");
        item.className = "logo-item";
        const tile = document.createElement("div");
        tile.className = "logo-tile";
        if (tech.type === "image") {
          tile.innerHTML = `<img src="${tech.src}" alt="${tech.name}" draggable="false">`;
        } else {
          tile.innerHTML = `<iconify-icon icon="${tech.icon}" aria-label="${tech.name}"></iconify-icon>`;
        }
        const name = document.createElement("span");
        name.className = "logo-name";
        name.textContent = tech.name;
        item.append(tile, name);
        group.appendChild(item);
      });
      return group;
    }

    logoTrack.innerHTML = "";
    logoTrack.appendChild(createLogoGroup(false));
    logoTrack.appendChild(createLogoGroup(true));

    const firstGroup = logoTrack.firstElementChild;
    const container = logoTrack.parentElement;
    const items = Array.from(logoTrack.querySelectorAll(".logo-item"));
    const SPEED = 120;

    let offset = 0;
    let currentSpeed = SPEED;
    let targetSpeed = SPEED;
    let lastTime = performance.now();
    let centers = [];
    let onScreen = true;
    let drag = null;

    const measure = () => {
      centers = items.map(item => item.offsetLeft + item.offsetWidth / 2);
    };
    measure();

    // Pause while the mouse is over the strip.
    container.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse") targetSpeed = 0;
    });
    container.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "mouse") targetSpeed = SPEED;
    });

    // Grab and drag (or swipe) the strip to move it by hand.
    container.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = { x: e.clientX, offset };
      container.classList.add("is-dragging");
      try { container.setPointerCapture(e.pointerId); } catch (err) {}
    });
    container.addEventListener("pointermove", (e) => {
      if (!drag) return;
      offset = drag.offset - (e.clientX - drag.x);
      currentSpeed = 0;
    });
    const endDrag = () => {
      drag = null;
      container.classList.remove("is-dragging");
    };
    container.addEventListener("pointerup", endDrag);
    container.addEventListener("pointercancel", endDrag);

    new IntersectionObserver((entries) => {
      onScreen = entries[0].isIntersecting;
    }).observe(container);

    function animate(time) {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      if (onScreen) {
        if (!drag) {
          currentSpeed += (targetSpeed - currentSpeed) * 0.05;
          offset += currentSpeed * delta;
        }
        const width = firstGroup.offsetWidth;
        offset = ((offset % width) + width) % width;
        logoTrack.style.transform = `translate3d(${-offset}px,0,0)`;

        // Logos near the middle grow and get their colour back; the ones
        // towards the edges shrink, fade and turn grey.
        const half = container.clientWidth / 2;
        items.forEach((item, i) => {
          const distance = Math.abs(centers[i] - offset - half) / half;
          const t = Math.max(0, 1 - distance);
          item.style.setProperty("--focus", (t * t * (3 - 2 * t)).toFixed(3));
        });
      }
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    new ResizeObserver(() => {
      measure();
      offset %= firstGroup.offsetWidth;
    }).observe(firstGroup);
  }
});
