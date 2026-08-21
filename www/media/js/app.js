/**
 * Eastern River Post and Beam - Portfolio Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  const state = {
    data: window.PORTFOLIO_DATA || { albums: [], totalPhotos: 0 },
    activePhotosList: [],
    lightboxIndex: 0,
    lightboxZoomed: false
  };

  // DOM Elements
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav-drawer');
  const albumsGrid = document.getElementById('albums-overview-grid');

  // Lightbox Elements
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-current-img');
  const lightboxAlbumBadge = document.getElementById('lightbox-album-badge');
  const lightboxCounter = document.getElementById('lightbox-counter-display');
  const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
  const lightboxNextBtn = document.getElementById('lightbox-next-btn');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxZoomBtn = document.getElementById('lightbox-zoom-btn');
  const lightboxStage = document.querySelector('.lightbox-image-stage');
  const lightboxThumbs = document.getElementById('lightbox-thumbnails-strip');

  // ==========================================
  // 1. Initialize Application
  // ==========================================
  function init() {
    renderAlbumCards();
    setupHeaderScroll();
    setupMobileNav();
    setupLightboxEvents();
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
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `View photos in ${album.title}`);

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
          <div class="album-card-footer">
            <span>View Photos</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>
        </div>
      `;

      const clickHandler = () => openAlbumLightbox(album);

      card.addEventListener('click', clickHandler);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          clickHandler();
        }
      });

      albumsGrid.appendChild(card);
    });
  }

  // ==========================================
  // 3. Fullscreen Lightbox Viewer
  // ==========================================
  function openAlbumLightbox(album) {
    if (!lightbox || !album.images || album.images.length === 0) return;
    state.activePhotosList = album.images;
    state.lightboxIndex = 0;
    state.lightboxZoomed = false;
    if (lightboxStage) lightboxStage.classList.remove('zoomed');

    updateLightboxContent();
    renderLightboxThumbnails();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    state.lightboxZoomed = false;
    if (lightboxStage) lightboxStage.classList.remove('zoomed');
  }

  function prevLightboxImage() {
    if (state.activePhotosList.length === 0) return;
    state.lightboxIndex = (state.lightboxIndex - 1 + state.activePhotosList.length) % state.activePhotosList.length;
    state.lightboxZoomed = false;
    if (lightboxStage) lightboxStage.classList.remove('zoomed');
    updateLightboxContent();
    highlightActiveThumbnail();
  }

  function nextLightboxImage() {
    if (state.activePhotosList.length === 0) return;
    state.lightboxIndex = (state.lightboxIndex + 1) % state.activePhotosList.length;
    state.lightboxZoomed = false;
    if (lightboxStage) lightboxStage.classList.remove('zoomed');
    updateLightboxContent();
    highlightActiveThumbnail();
  }

  function toggleLightboxZoom() {
    state.lightboxZoomed = !state.lightboxZoomed;
    if (lightboxStage) {
      lightboxStage.classList.toggle('zoomed', state.lightboxZoomed);
    }
  }

  function updateLightboxContent() {
    const currentPhoto = state.activePhotosList[state.lightboxIndex];
    if (!currentPhoto) return;

    if (lightboxImg) {
      lightboxImg.src = currentPhoto.src;
      lightboxImg.alt = currentPhoto.alt;
    }
    if (lightboxAlbumBadge) {
      lightboxAlbumBadge.textContent = currentPhoto.albumTitle;
    }
    if (lightboxCounter) {
      lightboxCounter.textContent = `${state.lightboxIndex + 1} / ${state.activePhotosList.length}`;
    }
  }

  function renderLightboxThumbnails() {
    if (!lightboxThumbs) return;
    lightboxThumbs.innerHTML = '';

    state.activePhotosList.forEach((photo, idx) => {
      const thumb = document.createElement('div');
      thumb.className = `lightbox-thumb ${idx === state.lightboxIndex ? 'active' : ''}`;
      thumb.innerHTML = `<img src="${photo.src}" alt="Thumb ${idx + 1}" />`;
      thumb.addEventListener('click', () => {
        state.lightboxIndex = idx;
        state.lightboxZoomed = false;
        if (lightboxStage) lightboxStage.classList.remove('zoomed');
        updateLightboxContent();
        highlightActiveThumbnail();
      });
      lightboxThumbs.appendChild(thumb);
    });

    highlightActiveThumbnail();
  }

  function highlightActiveThumbnail() {
    if (!lightboxThumbs) return;
    const thumbs = lightboxThumbs.querySelectorAll('.lightbox-thumb');
    thumbs.forEach((t, idx) => {
      const isActive = idx === state.lightboxIndex;
      t.classList.toggle('active', isActive);
      if (isActive) {
        t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  }

  function setupLightboxEvents() {
    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
    if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', prevLightboxImage);
    if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', nextLightboxImage);
    if (lightboxZoomBtn) lightboxZoomBtn.addEventListener('click', toggleLightboxZoom);
    if (lightboxImg) lightboxImg.addEventListener('click', toggleLightboxZoom);

    // Close on clicking backdrop
    if (lightbox) {
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-body')) {
          closeLightbox();
        }
      });
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!lightbox || !lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevLightboxImage();
      if (e.key === 'ArrowRight') nextLightboxImage();
      if (e.key === 'z' || e.key === 'Z') toggleLightboxZoom();
    });

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    if (lightbox) {
      lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) prevLightboxImage();
          else nextLightboxImage();
        }
      }, { passive: true });
    }
  }

  // ==========================================
  // 4. Header Scroll & Mobile Nav
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
  // 5. Dynamic Email Obfuscation (Bot-Resistant)
  // ==========================================
  function setupEmailObfuscation() {
    // Break email string into parts so automated email harvest crawlers scanning raw HTML cannot scrape it
    const user = 'hunter.grossman15';
    const domainParts = ['gmail', 'com'];
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
  // 6. Smooth Scroll & Active Nav Spy
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
