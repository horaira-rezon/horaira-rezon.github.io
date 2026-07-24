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

  const themeToggle=document.getElementById("theme-toggle");
  const themeStyle=document.getElementById("theme-style");
  const mobileThemeStyle = document.getElementById("mobile-theme-style");

  let themeAnimating=false;

  const applyTheme=(theme,save=true)=>{
    if(themeAnimating)return;
    themeAnimating=true;
    if(theme==="light"){
      themeStyle.disabled=false;
      mobileThemeStyle.disabled=false;
    }else{
      themeStyle.disabled=true;
      mobileThemeStyle.disabled=true;
    }
    
    if(save){
      localStorage.setItem("theme",theme);
    }

  document.body.animate([{
    opacity:.96
  },
  {
    opacity:1
  }],
  {
    duration:260,
    easing:"ease-out"
  });

  themeToggle.animate([
    {transform:"scale(1)"},
    {transform:"scale(.92)"},
    {transform:"scale(1)"}
  ],{
    duration:180,
    easing:"ease-out"
  });

  setTimeout(()=>{
    themeAnimating=false;
  },260);};

  const savedTheme=localStorage.getItem("theme");

  if(savedTheme){
    applyTheme(savedTheme,false);
  }else{
    const prefersLight=window.matchMedia("(prefers-color-scheme: light)").matches;
    applyTheme(prefersLight?"light":"dark",false);
  }

  themeToggle.addEventListener("click",()=>{

  const nextTheme=themeStyle.disabled?"light":"dark";

  applyTheme(nextTheme);});

  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change",(e)=>{
    if(localStorage.getItem("theme"))return;
    applyTheme(e.matches?"light":"dark",false);
  });

  const nav = document.querySelector('nav');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && nav && navLinks) {
    hamburger.addEventListener('click', e => {
      e.stopPropagation();
      if (nav.classList.contains('open')) {
        nav.style.height = '40px';
        nav.classList.remove('open');
        hamburger.classList.remove('active');
        setTimeout(() => {}, 350);
      } else {
        nav.classList.add('open');
        hamburger.classList.add('active');
        nav.style.height = 40 + navLinks.scrollHeight + 'px';
      }
    });

    document.addEventListener('click', e => {
      if (
        nav.classList.contains('open') &&
        !nav.contains(e.target)
      ) {
        nav.style.height = '40px';
        nav.classList.remove('open');
        hamburger.classList.remove('active');
        setTimeout(() => {}, 350);
      }
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target,{
        offset:-70,
        duration:0.5,
        easing:(t)=>1-Math.pow(1-t,3)
      });
      if (nav) {
        const header = document.querySelector('header');
        nav.style.height = '40px';
        nav.classList.remove('open');
        hamburger.classList.remove('active');
        
        setTimeout(() => {}, 350);
        nav.classList.remove('open');
        hamburger.classList.remove('active');
      }
    });
  });

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in, .slide-up').forEach(el => observer.observe(el));

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

  const initShowMore = (container) => {
    const boxes = Array.from(container.querySelectorAll('.project-box'));
    if (boxes.length <= 3) return;
    const hiddenBoxes = boxes.slice(3);
    const collapseWrapper = document.createElement('div');
    collapseWrapper.className = 'show-more-collapse-wrapper';
    collapseWrapper.style.cssText = 'overflow:hidden;height:0;display:flex;flex-direction:column;gap:1rem;margin-top:-1rem;';
    const firstHidden = hiddenBoxes[0];
    container.insertBefore(collapseWrapper, firstHidden);
    hiddenBoxes.forEach(box => {
      box.classList.remove('show-more-hidden');
      collapseWrapper.appendChild(box);
    });
    const wrapper = document.createElement('div');
    wrapper.className = 'show-more-btn-wrapper';
    const btn = document.createElement('button');
    btn.className = 'show-more-btn';
    btn.textContent = 'Show More';
    wrapper.appendChild(btn);
    container.appendChild(wrapper);
    let expanded = false;
    let animating = false;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (animating) return;
      if (!expanded) {
        animating = true;
        hiddenBoxes.forEach(box => {
          box.style.transition = 'none';
          box.style.opacity = '0';
          box.style.transform = 'translateY(-10px)';
        });
        void collapseWrapper.offsetHeight;
        const fullHeight = collapseWrapper.scrollHeight;
        collapseWrapper.style.marginTop = '0';
        collapseWrapper.style.transition = 'height 0.22s cubic-bezier(0.4,0,0.2,1)';
        collapseWrapper.style.height = fullHeight + 'px';
        collapseWrapper.style.overflow = 'clip';
        hiddenBoxes.forEach((box, i) => {
          box.style.transition = `opacity 0.18s ease ${0.08 + i * 0.05}s, transform 0.18s ease ${0.08 + i * 0.05}s`;
          box.style.opacity = '1';
          box.style.transform = 'translateY(0)';
        });
        btn.style.transition = 'opacity 0.1s ease';
        btn.style.opacity = '0';
        setTimeout(() => {
          btn.textContent = 'Show Less';
          void btn.offsetHeight;
          btn.style.opacity = '1';
          btn.style.transition = 'opacity 0.1s ease';
        }, 110);
        setTimeout(() => {
          collapseWrapper.style.transition = '';
          collapseWrapper.style.height = 'auto';
          collapseWrapper.style.overflow = 'visible';
          hiddenBoxes.forEach(box => {
            box.style.transition = '';
            box.style.opacity = '';
            box.style.transform = '';
          });
          btn.style.transition = '';
          btn.style.opacity = '';
          animating = false;
        }, 240 + hiddenBoxes.length * 35);
        expanded = true;
      } else {
        animating = true;
        const fullHeight = collapseWrapper.scrollHeight;
        collapseWrapper.style.overflow = 'hidden';
        collapseWrapper.style.transition = 'none';
        collapseWrapper.style.height = fullHeight + 'px';
        hiddenBoxes.forEach(box => {
          box.style.transition = 'none';
          box.style.opacity = '1';
          box.style.transform = 'translateY(0)';
        });
        void collapseWrapper.offsetHeight;
        const reversedBoxes = hiddenBoxes.slice().reverse();
        reversedBoxes.forEach((box, i) => {
          box.style.transition = `opacity 0.1s ease ${i * 0.025}s, transform 0.1s ease ${i * 0.025}s`;
          box.style.opacity = '0';
          box.style.transform = 'translateY(-10px)';
        });
        const fadeDuration = 80 + (hiddenBoxes.length - 1) * 25;
        setTimeout(() => {
          collapseWrapper.style.transition = 'height 0.16s cubic-bezier(0.4,0,0.2,1), margin-top 0.16s cubic-bezier(0.4,0,0.2,1)';
          collapseWrapper.style.height = '0';
          collapseWrapper.style.marginTop = '-1rem';
          setTimeout(() => {
            collapseWrapper.style.transition = '';
            btn.textContent = 'Show More';
            animating = false;
          }, 170);
        }, fadeDuration);
        expanded = false;
      }
    });
  };

  document.querySelectorAll('.projects-container').forEach(initShowMore);

  const boxCloseControllers = new Map();

  document.querySelectorAll('.project-box').forEach(box => {
    const header = box.querySelector('.project-header');
    const details = box.querySelector('.project-details');
    if (!header || !details) return;
    const openBox = () => {
      box.classList.add('open');
      details.style.transition = 'none';
      details.style.height = 'auto';
      const fullHeight = details.scrollHeight;
      details.style.height = '0';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          details.style.transition = 'height 0.22s cubic-bezier(0.4,0,0.2,1), margin-top 0.22s ease, padding-top 0.22s ease, border-color 0.22s ease';
          details.style.height = fullHeight + 'px';
          details.style.marginTop = '1rem';
          details.style.paddingTop = '1rem';
          details.style.borderTopColor = '#2e8de6';
          setTimeout(() => {
            details.style.height = 'auto';
            lenis.resize();
          }, 230);
        });
      });
    };
    const closeBox = () => {
      const h = details.offsetHeight;
      details.style.transition = 'none';
      details.style.height = h + 'px';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          details.style.transition = 'height 0.22s cubic-bezier(0.4,0,0.2,1), margin-top 0.22s ease, padding-top 0.22s ease, border-color 0.22s ease';
          details.style.height = '0';
          details.style.marginTop = '0';
          details.style.paddingTop = '0';
          details.style.borderTopColor = 'transparent';
          setTimeout(() => {
            box.classList.remove('open');
            details.style.transition = '';
            details.style.height = '';
            lenis.resize();
          }, 230);
        });
      });
    };
    boxCloseControllers.set(box, closeBox);
    box.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) return;
      if (e.target.tagName === 'A' || e.target.closest('a')) return;
      if (e.target.closest('.project-details')) return;
      e.stopPropagation();
      if (box.classList.contains('open')) {
        closeBox();
      } else {
        boxCloseControllers.forEach((otherClose, otherBox) => {
          if (otherBox !== box && otherBox.classList.contains('open')) {
            otherClose();
          }
        });
        openBox();
      }
    });
      details.addEventListener('click', (e) => e.stopPropagation());
    });

  const portalModal = document.getElementById('global-media-modal');
  const portalViewport = portalModal.querySelector('.portal-viewport-content');
  const portalClose = portalModal.querySelector('.portal-close-trigger');

  let scale = 1;
  let portalStack = [];

  const getPortalScrollTarget = () => portalViewport.querySelector('.project-popup') || portalViewport;

  const renderPortalContent = (htmlContent, isDocumentType) => {
    portalViewport.innerHTML = '';
    scale = 1;
    if (isDocumentType) {
      portalModal.classList.add('document-layout-variant');
    } else {
      portalModal.classList.remove('document-layout-variant');
    }
    portalViewport.innerHTML = htmlContent;
    const img = portalViewport.querySelector('.portal-fullscreen-img');
    if (img) img.style.transform = `scale(${scale})`;
  };

  const openPortal = (htmlContent, isDocumentType = false) => {
    portalStack = [];
    renderPortalContent(htmlContent, isDocumentType);
    portalModal.classList.add('active');
    document.body.classList.add('no-scroll');
    lenis.stop();
  };

  // Like openPortal, but remembers the currently-shown content (and its
  // scroll position) so closePortal can step back into it instead of
  // closing the whole modal. Used when a media viewer (image/pdf) is
  // opened from within an already-open popup.
  const openNestedPortal = (htmlContent, isDocumentType = false, onRestore = null) => {
    portalStack.push({
      html: portalViewport.innerHTML,
      isDocumentType: portalModal.classList.contains('document-layout-variant'),
      scrollTop: getPortalScrollTarget().scrollTop,
      onRestore
    });
    renderPortalContent(htmlContent, isDocumentType);
  };

  const closePortal = () => {
    if (!portalModal.classList.contains('active')) return;
    if (portalStack.length > 0) {
      const prev = portalStack.pop();
      renderPortalContent(prev.html, prev.isDocumentType);
      if (typeof prev.onRestore === 'function') prev.onRestore();
      requestAnimationFrame(() => {
        getPortalScrollTarget().scrollTop = prev.scrollTop || 0;
      });
      return;
    }
    portalModal.classList.remove('active');
    portalModal.classList.remove('document-layout-variant');
    portalViewport.innerHTML = '';
    document.body.classList.remove('no-scroll');
    lenis.start();
  };

  window.openPortal = openPortal;
  window.openNestedPortal = openNestedPortal;
  window.closePortal = closePortal;

  portalModal.addEventListener('wheel', (e) => {
    const img = portalViewport.querySelector('.portal-fullscreen-img');
    if (!img) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    scale = Math.min(Math.max(0.5, scale + delta), 4);
    img.style.transform = `scale(${scale})`;
  }, { passive: false });

  portalClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closePortal();
  });

  portalModal.addEventListener('click', (e) => {
    if (!e.target.closest('.portal-viewport-content')) {
      closePortal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      if (portalModal.classList.contains('active')) {
        closePortal();
      } else if (nav && hamburger) {
        const header = document.querySelector('header');
        
        if (nav.classList.contains('open')) {
          const header = document.querySelector('header');
          nav.style.height = '40px';
          nav.classList.remove('open');
          hamburger.classList.remove('active');
          
          setTimeout(() => {}, 350);
          nav.classList.remove('open');
          hamburger.classList.remove('active');
        } else {
          nav.classList.add('open');
          hamburger.classList.add('active');
          nav.style.height = 40 + navLinks.scrollHeight + 'px';
        }
      }
    }
  });

  document.querySelectorAll('.clickable-media').forEach(element => {
    element.addEventListener('click', (e) => {
      if (e.target.closest('.media-mask-overlay') || e.target.closest('.cv-pdf') || e.target.closest('.pdf-fallback-preview-card') || e.target.tagName === 'IMG') {
        e.stopPropagation();
        const type = element.dataset.type;
        const src = element.dataset.src;
        if (type === 'image') {
          openPortal(`<img src="${src}" class="portal-fullscreen-img" alt="Enlarged Reference View">`, false);
        } else if (type === 'pdf') {
          if (window.innerWidth <= 768) {
            window.open(src, '_blank');
            return;
          }
          openPortal(`
            <object data="${src}" type="application/pdf" class="portal-fullscreen-pdf">
              <iframe src="${src}">
                <p>Your browser downscaled this component view. <a href="${src}" target="_blank">Click here to download raw resource file directly.</a></p>
              </iframe>
            </object>
          `, true);
        }
      }
    });
  });

  // Builds a link that hands off to the device's own maps app (Apple Maps on
  // iOS, or a geo: intent on Android) using the lat/lng embedded in the
  // Google Maps embed URL's pb parameter.
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

  document.querySelectorAll('.location-trigger').forEach(element => {
    element.addEventListener('click', (e) => {
      e.stopPropagation();
      const mapSrc = element.dataset.mapSrc;

      if (window.innerWidth <= 768) {
        window.location.href = getNativeMapUrl(mapSrc);
        return;
      }

      openPortal(`
        <div class="portal-map-container">
          <div class="portal-map-frame">
            <iframe src="${mapSrc}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      `, true);
    });
  });

  document.querySelectorAll('.auto-link-preview').forEach(async (preview) => {
    const url = preview.dataset.url;
    if (!url) return;
    try {
      preview.innerHTML = `
        <div class="link-preview-card flex-skeleton-loader" style="width: 240px;">
          <div class="preview-loading-shimmer"></div>
        </div>
      `;
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      const html = data.contents;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const getMeta = (property) => {
        const el = doc.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
        return el ? el.getAttribute('content') : null;
      };
      const title = getMeta('og:title') || doc.querySelector('title')?.textContent || 'Special Achievement Reference';
      let image = getMeta('og:image');
      if (image && !image.startsWith('http')) {
        const urlObj = new URL(url);
        image = urlObj.origin + (image.startsWith('/') ? '' : '/') + image;
      }
      const domain = new URL(url).hostname.replace('www.', '');
      preview.innerHTML = `
        <div class="link-preview-card">
          <div class="media-mask-overlay">
            <span class="media-mask-text">Open Link</span>
          </div>
          ${image ? `<div class="link-preview-image-wrapper"><img src="${image}" alt="${title}" class="link-preview-image"></div>` : '<div class="link-preview-image-wrapper"><img src="Images/CIGR 2.jpg" class="link-preview-image"></div>'}
          <div class="link-preview-info">
            <div class="link-preview-title">${title}</div>
            <div class="link-preview-domain">${domain}</div>
          </div>
        </div>
      `;
      preview.querySelector('.link-preview-card').addEventListener('click', (e) => {
        e.stopPropagation();
        window.open(url, '_blank');
      });
      const imgElement = preview.querySelector('.link-preview-image');
      if (imgElement) {
        imgElement.addEventListener('load', () => {
          const aspect = imgElement.naturalWidth / imgElement.naturalHeight;
          if (aspect && !isNaN(aspect)) {
            const card = preview.querySelector('.link-preview-card');
            if (card) {
              const proportionalWidth = Math.min(Math.max(Math.round(200 * aspect), 240), 450);
              card.style.width = proportionalWidth + 'px';
              preview.style.width = proportionalWidth + 'px';
            }
          }
        });
      }
    } catch (err) {
      const domain = new URL(url).hostname.replace('www.', '');
      preview.classList.add('preview-failed');
      preview.innerHTML = `
        <div class="link-preview-card" style="width: 240px;">
          <div class="media-mask-overlay">
            <span class="media-mask-text">Open Link</span>
          </div>
          <div class="link-preview-image-wrapper"><img src="Images/CIGR 2.jpg" class="link-preview-image"></div>
          <div class="link-preview-info">
            <div class="link-preview-title">${url}</div>
            <div class="link-preview-domain">${domain}</div>
          </div>
        </div>
      `;
      preview.style.width = '240px';
      preview.querySelector('.link-preview-card').addEventListener('click', (e) => {
        e.stopPropagation();
        window.open(url, '_blank');
      });
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.project-box')) {
      document.querySelectorAll('.project-box.open').forEach(box => {
        const details = box.querySelector('.project-details');
        const h = details.offsetHeight;
        
        details.style.transition = 'none';
        details.style.height = h + 'px';
        
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            details.style.transition =
            'height 0.22s cubic-bezier(0.4,0,0.2,1), margin-top 0.22s ease, padding-top 0.22s ease, border-color 0.22s ease';
            
            details.style.height = '0';
            details.style.marginTop = '0';
            details.style.paddingTop = '0';
            details.style.borderTopColor = 'transparent';
            
            setTimeout(() => {
              box.classList.remove('open');
              details.style.transition = '';
              details.style.height = '';
              lenis.resize();
            }, 230);
          });
        });
      });
    }
  });

  document.querySelectorAll('.standalone-gallery-img').forEach(img => {
    const update = () => {
      if (img.decode) {
        img.decode().catch(() => {}).finally(() => lenis.resize());
      } else {
        lenis.resize();
      }
    };
    if (img.complete) {
      update();
    } else {
      img.addEventListener('load', update, { once: true });
    }
  });

  requestAnimationFrame(() => {
    document.querySelectorAll('.project-details').forEach(details => {
      details.style.height = '0';
    });
    lenis.resize();
  });

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
      {name: "FreeCAD", type: "image", src: "https://upload.wikimedia.org/wikipedia/commons/f/f7/FreeCAD_logo.svg"}
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
      currentSpeed += (targetSpeed - currentSpeed) * 0.1;
      offset += currentSpeed * delta;

      const width = firstGroup.offsetWidth;
      if (offset >= width) {
        offset -= width;}
        
        logoTrack.style.transform = `translate3d(${-offset}px,0,0)`;
        requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
      new ResizeObserver(() => {
        offset %= firstGroup.offsetWidth;
      }).observe(firstGroup);
    }
});