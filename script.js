document.addEventListener('DOMContentLoaded', () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'auto';
  }

  // Smooth scrolling for anchor links starting with #
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Intersection Observer for fade-in and slide-up animations
  const animatedSections = document.querySelectorAll('.fade-in, .slide-up');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });

  animatedSections.forEach((section, i) => {
    section.style.animationDelay = `${i * 0.1}s`;
    observer.observe(section);
  });

  // ✅ Project box toggle with mobile-specific collapse behavior
  const projectBoxes = document.querySelectorAll('.project-box');

  projectBoxes.forEach(box => {
    box.addEventListener('click', () => {
      const details = box.querySelector(".project-details");
      if (!details) return;

      const isActive = box.classList.contains("active");
      const isMobile = window.innerWidth <= 768;

      if (isActive) {
        // Collapse
        box.classList.remove("active");
        if (isMobile) box.classList.remove("expanded");
        details.style.maxHeight = null;
      } else {
        // Expand
        box.classList.add("active");
        if (isMobile) box.classList.add("expanded");
        details.style.maxHeight = details.scrollHeight + "px";
      }
    });
  });

  // Skill circle interaction
  const skillSpans = document.querySelectorAll('.clickable-skill');
  const circle = document.querySelector('.circle');
  const percentageText = document.querySelector('.percentage-text');
  const selectedSkill = document.getElementById('selected-skill');

  if (circle && percentageText && selectedSkill) {
    let skillCooldown = false;

    function handleSkillClick() {
      if (skillCooldown) return;
      skillCooldown = true;

      const level = parseInt(this.getAttribute('data-level'));
      const skill = this.getAttribute('data-skill');
      const circumference = 2 * Math.PI * 40; // radius 40 assumed
      const offset = circumference - (level / 100) * circumference;

      circle.style.strokeDashoffset = offset;
      percentageText.textContent = `${level}%`;
      selectedSkill.textContent = skill;

      skillCooldown = false;
    }

    skillSpans.forEach(span => {
      span.style.cursor = 'pointer';
      span.tabIndex = 0;

      span.addEventListener('click', handleSkillClick);
      span.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSkillClick.call(span);
        }
      });
    });
  }

  // Typing effect lines
  const lines = [
    "An Agricultural Engineer",
    "I'm specializing in Precision Agriculture",
    "I love blending Nature with Technology",
    "Robotics in Agriculture is my thing",
    "Hooked on Coding and Data Science",
    "I see poetry in Code, stories in Data",
    "I work with Spectroscopy and Image Processing",
    "My hometown is in Sherpur, Bangladesh"
  ];

  const typingText = document.getElementById("typing-text");
  let lineIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let isPaused = false;

  if (typingText) {
    typingText.addEventListener('mouseenter', () => isPaused = true);
    typingText.addEventListener('mouseleave', () => isPaused = false);
  }

  document.addEventListener('visibilitychange', () => {
    isPaused = document.hidden;
  });

  function typeLine() {
    if (isPaused) {
      setTimeout(typeLine, 100);
      return;
    }

    const currentLine = lines[lineIndex];
    const visibleText = currentLine.substring(0, charIndex);
    if (typingText) {
      typingText.textContent = visibleText;
    }

    if (!isDeleting && charIndex < currentLine.length) {
      charIndex++;
      setTimeout(typeLine, 50);
    } else if (!isDeleting && charIndex === currentLine.length) {
      setTimeout(() => {
        isDeleting = true;
        typeLine();
      }, 1500);
    } else if (isDeleting && charIndex > 0) {
      charIndex--;
      setTimeout(typeLine, 30);
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      lineIndex = (lineIndex + 1) % lines.length;
      setTimeout(typeLine, 500);
    }
  }

  if (typingText) {
    typeLine();
  }

  // Hamburger menu toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('show');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('show');
      });
    });
  }

function applyTouchHoverEffect(selector, hoverClass) {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) return;

  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener('click', () => {
      el.classList.add(hoverClass); // simulate hover
      setTimeout(() => {
        el.classList.remove(hoverClass); // remove after 0.6s
      }, 600);
    });
  });
}

// Use your existing selectors + their hover class
applyTouchHoverEffect('.name', 'hover');
applyTouchHoverEffect('.clickable-skill', 'hover');
applyTouchHoverEffect('.project-title a', 'hover');
applyTouchHoverEffect('.nav-links a', 'hover');
applyTouchHoverEffect('.contact-icon', 'hover');
applyTouchHoverEffect('.certificate-link', 'hover');


});
