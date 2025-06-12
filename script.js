
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    target.scrollIntoView({ behavior: "smooth" });
  });
});

const animatedSections = document.querySelectorAll('.fade-in, .slide-up');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.2
});

animatedSections.forEach(section => observer.observe(section));
function toggleProject(element) {
  element.classList.toggle("active");
}

function toggleProject(box) {
  box.classList.toggle("active");
  const details = box.querySelector(".project-details");
  if (box.classList.contains("active")) {
    details.style.maxHeight = details.scrollHeight + "px";
  } else {
    details.style.maxHeight = null;
  }
}

const skillSpans = document.querySelectorAll('.clickable-skill');
const circle = document.querySelector('.circle');
const percentageText = document.querySelector('.percentage-text');
const selectedSkill = document.getElementById('selected-skill');

skillSpans.forEach(span => {
  span.style.cursor = 'pointer';

  span.addEventListener('click', () => {
    const level = parseInt(span.getAttribute('data-level'));
    const skill = span.getAttribute('data-skill');

    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (level / 100) * circumference;

    circle.style.strokeDashoffset = offset;
    circle.classList.add('glow');
    percentageText.textContent = `${level}%`;
    selectedSkill.textContent = skill;

    setTimeout(() => circle.classList.remove('glow'), 800);
  });
});


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

  function typeLine() {
    const currentLine = lines[lineIndex];
    const visibleText = currentLine.substring(0, charIndex);

    typingText.textContent = visibleText;

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

  document.addEventListener("DOMContentLoaded", () => {
    typeLine();
  });
