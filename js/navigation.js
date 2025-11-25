// ===== Navigation JavaScript =====

document.addEventListener('DOMContentLoaded', function() {
  initNavigation();
});

// Handle browser back/forward button (restore from cache)
window.addEventListener('pageshow', function(event) {
  // If page was restored from cache, reinitialize
  if (event.persisted) {
    initNavigation();
  }
});

function initNavigation() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navMenuClose = document.getElementById('nav-menu-close');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Navbar scroll effect
  window.addEventListener('scroll', debounce(() => {
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, 10));
  
  // Mobile menu toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      toggleMobileMenu();
    });
  }
  
  // Mobile menu close button
  if (navMenuClose && navMenu) {
    navMenuClose.addEventListener('click', () => {
      closeMobileMenu();
    });
  }
  
  // Function to toggle mobile menu
  function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (navMenu.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    // Animate hamburger bars with enhanced effects
    animateHamburgerBars();
  }
  
  // Function to close mobile menu
  function closeMobileMenu() {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    animateHamburgerBars();
  }
  
  // Function to animate hamburger bars
  function animateHamburgerBars() {
    const bars = navToggle.querySelectorAll('.bar');
    bars.forEach((bar, index) => {
      if (navToggle.classList.contains('active')) {
        setTimeout(() => {
          if (index === 0) {
            bar.style.transform = 'rotate(45deg) translate(8px, 8px)';
            bar.style.background = 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))';
          }
          if (index === 1) {
            bar.style.opacity = '0';
            bar.style.transform = 'translateX(-30px) scale(0)';
          }
          if (index === 2) {
            bar.style.transform = 'rotate(-45deg) translate(8px, -8px)';
            bar.style.background = 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))';
          }
        }, index * 100);
      } else {
        setTimeout(() => {
          bar.style.transform = '';
          bar.style.opacity = '';
          bar.style.background = '';
        }, index * 50);
      }
    });
  }
  
  // Add pulse animation to hamburger menu
  function addHamburgerPulse() {
    if (window.innerWidth <= 768) {
      setInterval(() => {
        if (!navToggle.classList.contains('active')) {
          navToggle.style.animation = 'pulseGlow 2s ease-in-out';
          setTimeout(() => {
            navToggle.style.animation = '';
          }, 2000);
        }
      }, 5000); // Pulse every 5 seconds when not active
    }
  }
  
  // Initialize hamburger pulse
  addHamburgerPulse();
  
  // Close mobile menu when clicking on links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        closeMobileMenu();
      }
    });
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('active') && 
        !navMenu.contains(e.target) && 
        !navToggle.contains(e.target) &&
        !navMenuClose.contains(e.target)) {
      closeMobileMenu();
    }
  });
  
  // Close mobile menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });
  
  // Add ripple effect to nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) { // Only on mobile
        createRippleEffect(e, link);
      }
    });
  });
  
  // Function to create ripple effect
  function createRippleEffect(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%);
      border-radius: 50%;
      transform: scale(0);
      animation: rippleEffect 0.6s ease-out;
      pointer-events: none;
      z-index: 1;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
  
  // Active link highlighting
  updateActiveLink();
  window.addEventListener('scroll', throttle(updateActiveLink, 100));
  
  // Smooth scroll for anchor links
  initSmoothScroll();
}

// Update active navigation link based on scroll position
function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  let current = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    const sectionHeight = section.offsetHeight;
    
    if (window.pageYOffset >= sectionTop && 
        window.pageYOffset < sectionTop + sectionHeight) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    
    // Check if link href matches current section or page
    const href = link.getAttribute('href');
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    const linkPage = href.replace('.html', '').replace('/', '');
    
    // Handle index.html as empty string
    if (linkPage === 'index' || linkPage === '') {
      if (currentPage === '' || currentPage === 'index') {
        link.classList.add('active');
      }
    } else if (href.includes(current) || 
        (current === '' && href.includes('index.html')) ||
        (currentPage === linkPage) ||
        (currentPage === '' && linkPage === 'index')) {
      link.classList.add('active');
    }
  });
}

// Initialize smooth scrolling
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

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
