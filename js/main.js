// ===== Main JavaScript File =====

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

// Initialize Application
function initializeApp() {
  initCustomCursor();
  initScrollAnimations();
  initParallaxEffects();
  initParticles();
  initTypingAnimation();
  initCounterAnimation();
  initScrollProgress();
  initHeaderEffects();
}

// ===== Custom Cursor =====
function initCustomCursor() {
  const cursor = document.getElementById('cursor');
  const cursorTrail = document.getElementById('cursor-trail');
  
  if (!cursor || !cursorTrail) return;
  
  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;
  
  // Mouse move event
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  // Animate cursor
  function animateCursor() {
    // Main cursor
    cursor.style.left = mouseX - 10 + 'px';
    cursor.style.top = mouseY - 10 + 'px';
    
    // Trail cursor
    trailX += (mouseX - trailX) * 0.1;
    trailY += (mouseY - trailY) * 0.1;
    
    cursorTrail.style.left = trailX - 4 + 'px';
    cursorTrail.style.top = trailY - 4 + 'px';
    
    requestAnimationFrame(animateCursor);
  }
  
  animateCursor();
  
  // Cursor hover effects
  const hoverElements = document.querySelectorAll('a, button, .area-card, .project-card, .article-card');
  
  hoverElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      cursor.style.transform = 'scale(1.5)';
      cursorTrail.style.transform = 'scale(1.2)';
    });
    
    element.addEventListener('mouseleave', () => {
      cursor.style.transform = 'scale(1)';
      cursorTrail.style.transform = 'scale(1)';
    });
  });
}

// ===== Scroll Animations =====
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        
        // Trigger specific animations
        if (entry.target.classList.contains('stat-number')) {
          animateCounter(entry.target);
        }
        
        if (entry.target.classList.contains('skill-progress')) {
          animateSkillBar(entry.target);
        }
      }
    });
  }, observerOptions);
  
  // Observe elements
  const animateElements = document.querySelectorAll(
    '.company-intro, .business-areas, .vm-item, .profile-content, .value-card, .timeline-item, .project-card, .article-card'
  );
  
  animateElements.forEach(element => {
    observer.observe(element);
  });
}

// ===== Parallax Effects =====
function initParallaxEffects() {
  const parallaxElements = document.querySelectorAll('.gradient-mesh, .particles');
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    parallaxElements.forEach(element => {
      element.style.transform = `translateY(${rate}px)`;
    });
  });
}

// ===== Particles =====
function initParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;
  
  const particleCount = 50;
  
  for (let i = 0; i < particleCount; i++) {
    createParticle(particlesContainer);
  }
}

function createParticle(container) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  
  // Random position
  particle.style.left = Math.random() * 100 + '%';
  particle.style.top = Math.random() * 100 + '%';
  
  // Random size
  const size = Math.random() * 4 + 2;
  particle.style.width = size + 'px';
  particle.style.height = size + 'px';
  
  // Random animation delay
  particle.style.animationDelay = Math.random() * 6 + 's';
  particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
  
  container.appendChild(particle);
}

// ===== Typing Animation =====
function initTypingAnimation() {
  const typingElements = document.querySelectorAll('.title-word[data-word]');
  
  typingElements.forEach((element, index) => {
    const text = element.dataset.word;
    element.textContent = '';
    
    setTimeout(() => {
      typeText(element, text, 100);
    }, index * 200);
  });
}

function typeText(element, text, speed) {
  let i = 0;
  const timer = setInterval(() => {
    element.textContent += text.charAt(i);
    i++;
    
    if (i > text.length) {
      clearInterval(timer);
    }
  }, speed);
}

// ===== Counter Animation =====
function initCounterAnimation() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      
      if (current >= target) {
        counter.textContent = target + '+';
        clearInterval(timer);
      } else {
        counter.textContent = Math.floor(current);
      }
    }, 16);
  });
}

function animateCounter(element) {
  const target = parseInt(element.dataset.target);
  const duration = 2000;
  const increment = target / (duration / 16);
  let current = 0;
  
  const timer = setInterval(() => {
    current += increment;
    
    if (current >= target) {
      element.textContent = target + '+';
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// ===== Skill Bar Animation =====
function animateSkillBar(element) {
  const width = element.dataset.width;
  element.style.width = width;
}

// ===== Scroll Progress =====
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.offsetHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    progressBar.style.width = scrollPercent + '%';
  });
}

// ===== Header Effects =====
function initHeaderEffects() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Add floating animation to nav links
  navLinks.forEach((link, index) => {
    link.addEventListener('mouseenter', () => {
      link.style.transform = 'translateY(-2px) scale(1.05)';
    });
    
    link.addEventListener('mouseleave', () => {
      link.style.transform = 'translateY(0) scale(1)';
    });
  });
  
  // Add parallax effect to navbar background
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * 0.1;
    
    if (navbar) {
      navbar.style.transform = `translateY(${rate}px)`;
    }
  });
  
  // Add glow effect on scroll
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const glowIntensity = Math.min(scrolled / 100, 1);
    
    if (navbar && navbar.classList.contains('scrolled')) {
      navbar.style.boxShadow = `
        0 8px 32px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.05),
        0 0 ${20 + glowIntensity * 30}px rgba(0, 212, 255, ${0.1 + glowIntensity * 0.2})
      `;
    }
  });
}

// ===== Utility Functions =====

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Smooth scroll to element
function smoothScrollTo(element) {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Format date
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('ja-JP', options);
}

// Truncate text
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

// Generate random ID
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Export functions for use in other modules
window.SyntheraUtils = {
  debounce,
  throttle,
  smoothScrollTo,
  isInViewport,
  formatDate,
  truncateText,
  generateId
};
