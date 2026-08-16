/**
 * Eastern River Post and Beam - Portfolio Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  const state = {
    data: window.PORTFOLIO_DATA || { albums: [], totalPhotos: 0 }
  };

  // DOM Elements
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav-drawer');
  const albumsGrid = document.getElementById('albums-overview-grid');

  // ==========================================
  // 1. Initialize Application
  // ==========================================
  function init() {
    renderAlbumCards();
    setupHeaderScroll();
    setupMobileNav();
    setupEmailObfuscation();
    setupSmoothScroll();
  }

  // ==========================================
  // 2. Render Album Overview Cards
  // ==========================================
  function renderAlbumCards() {
    if (!albumsGrid) return;
    albumsGrid.innerHTML = '';

    state.data.albums.forEach(album => {
      const card = document.createElement('div');
      card.className = 'album-card';

      card.innerHTML = `
        <div class="album-cover-box">
          <img src="${album.cover}" alt="${album.title}" loading="lazy" />
          <span class="album-tag-badge">${album.tag}</span>
          <span class="album-count-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            ${album.count} Photos
          </span>
        </div>
        <div class="album-card-body">
          <h3 class="album-card-title">${album.title}</h3>
          <p class="album-card-desc">${album.description || album.subtitle}</p>
        </div>
      `;

      albumsGrid.appendChild(card);
    });
  }

  // ==========================================
  // 3. Header Scroll & Mobile Nav
  // ==========================================
  function setupHeaderScroll() {
    window.addEventListener('scroll', () => {
      if (!header) return;
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  function setupMobileNav() {
    if (!mobileToggle || !mobileNav) return;
    mobileToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('active');
    });

    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
      });
    });
  }

  // ==========================================
  // 4. Dynamic Email Obfuscation (Bot-Resistant)
  // ==========================================
  function setupEmailObfuscation() {
    // Break email string into parts so automated email harvest crawlers scanning raw HTML cannot scrape it
    const user = 'info';
    const domainParts = ['easternriverpostandbeam', 'com'];
    const emailAddress = user + '@' + domainParts.join('.');
    const encodedSubject = encodeURIComponent('Timber Frame Inquiry - Eastern River Post and Beam');
    const mailtoLink = 'mailto:' + emailAddress + '?subject=' + encodedSubject;

    // 1. Update Primary Contact Section Card
    const emailCards = document.querySelectorAll('.js-obfuscated-email-card');
    const emailDisplays = document.querySelectorAll('.js-email-display');

    emailCards.forEach(card => {
      card.setAttribute('href', mailtoLink);
      card.setAttribute('aria-label', 'Send email to ' + emailAddress);
    });

    emailDisplays.forEach(display => {
      display.textContent = emailAddress;
    });

    // 2. Update Footer Link
    const footerEmailLinks = document.querySelectorAll('.js-footer-email-link');
    const footerEmailTexts = document.querySelectorAll('.js-footer-email');

    footerEmailLinks.forEach(link => {
      link.setAttribute('href', mailtoLink);
      link.setAttribute('aria-label', 'Send email to ' + emailAddress);
    });

    footerEmailTexts.forEach(text => {
      text.textContent = emailAddress;
    });
  }

  // ==========================================
  // 5. Smooth Scroll & Active Nav Spy
  // ==========================================
  function setupSmoothScroll() {
    const navLinks = document.querySelectorAll('.site-nav .nav-link, .mobile-nav-drawer a');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    });
  }

  // Run
  init();
});
