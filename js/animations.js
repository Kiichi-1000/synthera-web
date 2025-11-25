// ===== Animations JavaScript =====

document.addEventListener('DOMContentLoaded', function() {
  initAnimations();
});

// Handle browser back/forward button (restore from cache)
window.addEventListener('pageshow', function(event) {
  // If page was restored from cache, reinitialize
  if (event.persisted) {
    initAnimations();
  }
});

function initAnimations() {
  initTextAnimations();
  initCardAnimations();
  initButtonAnimations();
  initTabAnimations();
  initFilterAnimations();
  initHoverEffects();
}

// ===== Text Animations =====
function initTextAnimations() {
  // Split text into characters for animation
  const textElements = document.querySelectorAll('.title-word[data-word]');
  
  textElements.forEach(element => {
    const text = element.dataset.word;
    element.innerHTML = '';
    
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.textContent = text[i];
      span.style.opacity = '0';
      span.style.transform = 'translateY(100px)';
      span.style.display = 'inline-block';
      element.appendChild(span);
    }
    
    // Animate characters
    const spans = element.querySelectorAll('span');
    spans.forEach((span, index) => {
      setTimeout(() => {
        span.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        span.style.opacity = '1';
        span.style.transform = 'translateY(0)';
      }, index * 50);
    });
  });
}

// ===== Card Animations =====
function initCardAnimations() {
  // Area cards hover effect
  const areaCards = document.querySelectorAll('.area-card');
  
  areaCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
    });
  });
  
  // Project cards 3D effect
  const projectCards = document.querySelectorAll('.project-card, .article-card');
  
  projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
  });
}

// ===== Button Animations =====
function initButtonAnimations() {
  const buttons = document.querySelectorAll('.cta-button, .load-more-button, .tab-button, .filter-button');
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
    });
    
    button.addEventListener('mousedown', () => {
      button.style.transform = 'translateY(0) scale(0.98)';
    });
    
    button.addEventListener('mouseup', () => {
      button.style.transform = 'translateY(-2px) scale(1)';
    });
  });
}

// ===== Tab Animations =====
function initTabAnimations() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab;
      
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Show target content with animation
      const targetContent = document.getElementById(targetTab + '-content');
      if (targetContent) {
        targetContent.classList.add('active');
        
        // Animate content appearance
        targetContent.style.opacity = '0';
        targetContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          targetContent.style.transition = 'all 0.6s ease';
          targetContent.style.opacity = '1';
          targetContent.style.transform = 'translateY(0)';
        }, 50);
      }
    });
  });
}

// ===== Filter Animations =====
function initFilterAnimations() {
  const filterButtons = document.querySelectorAll('.filter-button');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Animate button click
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 150);
    });
  });
}

// ===== Hover Effects =====
function initHoverEffects() {
  // Glow effect for interactive elements
  const glowElements = document.querySelectorAll('.area-card, .project-card, .article-card, .value-card');
  
  glowElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      element.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.3)';
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.boxShadow = '';
    });
  });
  
  // Icon animations
  const icons = document.querySelectorAll('.card-icon svg, .tab-icon svg');
  
  icons.forEach(icon => {
    icon.addEventListener('mouseenter', () => {
      icon.style.transform = 'scale(1.1) rotate(5deg)';
    });
    
    icon.addEventListener('mouseleave', () => {
      icon.style.transform = 'scale(1) rotate(0deg)';
    });
  });
}

// ===== Scroll-triggered Animations =====
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        
        // Stagger animation for child elements
        const children = entry.target.querySelectorAll('.area-card, .vm-item, .value-card, .timeline-item');
        children.forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('animate-in');
          }, index * 100);
        });
      }
    });
  }, observerOptions);
  
  // Observe sections
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    observer.observe(section);
  });
}

// ===== Loading Animations =====
function showLoadingAnimation(element) {
  element.classList.add('loading');
  
  // Add skeleton loading effect
  const skeletonElements = element.querySelectorAll('.skeleton');
  skeletonElements.forEach(skeleton => {
    skeleton.style.animation = 'loading 1.5s infinite';
  });
}

function hideLoadingAnimation(element) {
  element.classList.remove('loading');
  
  // Remove skeleton loading effect
  const skeletonElements = element.querySelectorAll('.skeleton');
  skeletonElements.forEach(skeleton => {
    skeleton.style.animation = '';
  });
}

// ===== Page Transition Animations =====
function initPageTransitions() {
  // Fade in animation when page loads
  document.body.style.opacity = '0';
  document.body.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    document.body.style.transition = 'all 0.6s ease';
    document.body.style.opacity = '1';
    document.body.style.transform = 'translateY(0)';
  }, 100);
  
  // Link click animations
  const links = document.querySelectorAll('a[href$=".html"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Fade out animation
      document.body.style.transition = 'all 0.3s ease';
      document.body.style.opacity = '0';
      document.body.style.transform = 'translateY(-20px)';
      
      // Navigate after animation
      setTimeout(() => {
        window.location.href = link.href;
      }, 300);
    });
  });
}

// ===== Utility Functions =====
function addAnimationClass(element, className, duration = 1000) {
  element.classList.add(className);
  
  setTimeout(() => {
    element.classList.remove(className);
  }, duration);
}

function animateElement(element, animation, duration = 1000) {
  element.style.animation = `${animation} ${duration}ms ease`;
  
  setTimeout(() => {
    element.style.animation = '';
  }, duration);
}

// Initialize all animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initPageTransitions();
});

// Handle browser back/forward button (restore from cache)
window.addEventListener('pageshow', function(event) {
  // If page was restored from cache, reinitialize
  if (event.persisted) {
    initScrollAnimations();
    initPageTransitions();
  }
});

// Export animation functions
window.SyntheraAnimations = {
  showLoadingAnimation,
  hideLoadingAnimation,
  addAnimationClass,
  animateElement
};
