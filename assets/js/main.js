document.addEventListener('DOMContentLoaded', () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'auto';
  }
  const lenis = new Lenis({
    autoRaf: true,
    lerp: 0.12,
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

  const nav = document.querySelector('nav');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  const closeNavVisual = () => {
    nav.style.height = '';
    nav.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  const openNav = () => {
    if (nav.classList.contains('open')) return;
    nav.classList.add('open');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    nav.style.height = nav.querySelector('.nav-top').offsetHeight + navLinks.scrollHeight + 'px';
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
      lenis.scrollTo(target, {
        offset: -70,
        duration: 1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
      closeNav();
    });
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

  /* ---------- Popup windows ---------- */

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  let scrollLocks = 0;
  const lockScroll = () => {
    if (scrollLocks++ === 0) {
      lenis.stop();
      document.body.classList.add('no-scroll');
    }
  };
  const unlockScroll = () => {
    if (--scrollLocks === 0) {
      lenis.start();
      document.body.classList.remove('no-scroll');
    }
  };

  // content: the element shown in the window. Clicks outside any element
  // matching `inside` (the panel, or the image itself) close the window.
  const openModal = ({ content, label, variant = '', inside = '.modal-panel', closeInPanel = true }) => {
    const trigger = document.activeElement;
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

    if (closeInPanel) {
      content.insertBefore(closeBtn, content.firstChild);
      overlay.appendChild(content);
    } else {
      overlay.appendChild(closeBtn);
      overlay.appendChild(content);
    }

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
      close: () => {
        overlay.classList.remove('is-open');
        overlay.classList.add('is-closing');
        unlockScroll();
        setTimeout(() => overlay.remove(), 300);
        if (trigger && trigger.isConnected && typeof trigger.focus === 'function') {
          trigger.focus({ preventScroll: true });
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

  const openImage = (src) => {
    const stage = el('div', 'media-stage');
    const img = el('img', 'portal-fullscreen-img');
    img.src = src;
    img.alt = '';
    stage.appendChild(img);
    const overlay = openModal({
      content: stage,
      label: 'Image viewer',
      variant: 'media-variant',
      inside: '.portal-fullscreen-img',
      closeInPanel: false
    });
    let scale = 1;
    overlay.addEventListener('wheel', (e) => {
      e.preventDefault();
      scale = Math.min(Math.max(1, scale + (e.deltaY > 0 ? -0.15 : 0.15)), 4);
      img.style.transform = `scale(${scale})`;
    }, { passive: false });
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
  const renderPdfPages = async (body, src) => {
    const pages = el('div', 'doc-pages');
    const status = el('div', 'doc-status', 'Loading document…');
    pages.appendChild(status);
    body.appendChild(pages);
    try {
      const pdfjsLib = await loadPdfJs();
      const doc = await pdfjsLib.getDocument(src).promise;
      status.remove();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      for (let n = 1; n <= doc.numPages; n++) {
        if (!body.isConnected) return;
        const page = await doc.getPage(n);
        const width = Math.min(pages.clientWidth - 24, 900);
        const viewport = page.getViewport({ scale: (width / page.getViewport({ scale: 1 }).width) * ratio });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        pages.appendChild(canvas);
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      }
    } catch (err) {
      status.textContent = 'This document could not be displayed here. ';
      const link = el('a', '', 'Open it in a new tab');
      link.href = src;
      link.target = '_blank';
      link.rel = 'noopener';
      status.appendChild(link);
    }
  };

  const openDocument = (src, title) => {
    const panel = el('div', 'modal-panel doc-panel');
    const toolbar = el('div', 'doc-toolbar');
    const open = el('a', 'doc-action');
    open.href = src;
    open.target = '_blank';
    open.rel = 'noopener';
    open.textContent = 'Open in new tab ⤴';
    toolbar.append(el('div', 'doc-title', title), open);
    const body = el('div', 'doc-body');
    panel.append(toolbar, body);
    openModal({ content: panel, label: title, variant: 'doc-variant' });
    renderPdfPages(body, src);
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
      card.innerHTML = '<div class="media-mask-overlay"><span class="media-mask-text">Open Link</span></div>';
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
        openImage(media.dataset.src);
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
      if (top) {
        e.preventDefault();
        requestClose();
      } else {
        openNav();
      }
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

    function createLogoGroup() {
      const group = document.createElement("div");
      group.className = "logo-group";
      technologies.forEach(tech => {
        const item = document.createElement("div");
        item.className = "logo-item";
        if (tech.type === "image") {
          item.innerHTML = `
          <img src="${tech.src}" alt="${tech.name}" title="${tech.name}">
          `;
        } else {
          item.innerHTML = `
          <iconify-icon icon="${tech.icon}" title="${tech.name}" aria-label="${tech.name}">
          </iconify-icon>
          `;
        }
        group.appendChild(item);
      });
      return group;
    }

    logoTrack.innerHTML = "";
    logoTrack.appendChild(createLogoGroup());
    logoTrack.appendChild(createLogoGroup());

    const firstGroup = logoTrack.firstElementChild;

    let offset = 0;
    let currentSpeed = 175;
    let targetSpeed = 175;
    let lastTime = performance.now();

    const container = logoTrack.parentElement;

    container.addEventListener("mouseenter", () => {
      targetSpeed = 0;
    });

    container.addEventListener("mouseleave", () => {
      targetSpeed = 175;
    });

    function animate(time) {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      currentSpeed += (targetSpeed - currentSpeed) * 0.05;
      offset += currentSpeed * delta;

      const width = firstGroup.offsetWidth;
      if (offset >= width) {
        offset -= width;
      }

      logoTrack.style.transform = `translate3d(${-offset}px,0,0)`;
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    new ResizeObserver(() => {
      offset %= firstGroup.offsetWidth;
    }).observe(firstGroup);
  }
});
