/**
 * Eastern River Post and Beam - Portfolio Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  const state = {
    activeFilter: 'all',
    currentViewMode: 'grid', // 'grid' | 'masonry'
    activePhotosList: [],
    lightboxIndex: 0,
    lightboxZoomed: false,
    data: window.PORTFOLIO_DATA || { albums: [], totalPhotos: 0 }
  };

  // DOM Elements
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav-drawer');
  const albumsGrid = document.getElementById('albums-overview-grid');
  const filterBar = document.getElementById('gallery-filter-bar');
  const galleryGrid = document.getElementById('gallery-photos-grid');
  const galleryCount = document.getElementById('gallery-count-display');
  const viewModeBtns = document.querySelectorAll('.view-mode-btn');

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
    buildAllPhotosList();
    renderAlbumCards();
    renderFilterButtons();
    renderGalleryPhotos();
    setupHeaderScroll();
    setupMobileNav();
    setupViewModeToggles();
    setupLightboxEvents();
    setupEmailObfuscation();
    setupSmoothScroll();
  }

  // Flatten all photos into a single list
  function buildAllPhotosList() {
    state.allPhotos = [];
    state.data.albums.forEach(album => {
      album.images.forEach(img => {
        state.allPhotos.push(img);
      });
    });
    state.activePhotosList = [...state.allPhotos];
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
      card.setAttribute('aria-label', `View album ${album.title}`);

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
            <span>Explore Album</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>
        </div>
      `;

      const clickHandler = () => {
        setFilter(album.id);
        const galleryElem = document.getElementById('portfolio-gallery');
        if (galleryElem) {
          galleryElem.scrollIntoView({ behavior: 'smooth' });
        }
      };

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
  // 3. Render Filter Buttons
  // ==========================================
  function renderFilterButtons() {
    if (!filterBar) return;
    filterBar.innerHTML = '';

    // "All Photos" button
    const allBtn = document.createElement('button');
    allBtn.className = `filter-btn ${state.activeFilter === 'all' ? 'active' : ''}`;
    allBtn.innerHTML = `All Projects <span class="count-pill">${state.allPhotos.length}</span>`;
    allBtn.addEventListener('click', () => setFilter('all'));
    filterBar.appendChild(allBtn);

    // Album buttons
    state.data.albums.forEach(album => {
      const btn = document.createElement('button');
      btn.className = `filter-btn ${state.activeFilter === album.id ? 'active' : ''}`;
      btn.innerHTML = `${album.title} <span class="count-pill">${album.count}</span>`;
      btn.addEventListener('click', () => setFilter(album.id));
      filterBar.appendChild(btn);
    });
  }

  function setFilter(albumId) {
    state.activeFilter = albumId;
    if (albumId === 'all') {
      state.activePhotosList = [...state.allPhotos];
    } else {
      const selected = state.data.albums.find(a => a.id === albumId);
      state.activePhotosList = selected ? [...selected.images] : [];
    }

    // Update active class on filter buttons
    const buttons = filterBar.querySelectorAll('.filter-btn');
    buttons.forEach((btn, idx) => {
      if (idx === 0) {
        btn.classList.toggle('active', albumId === 'all');
      } else {
        const album = state.data.albums[idx - 1];
        btn.classList.toggle('active', album && album.id === albumId);
      }
    });

    renderGalleryPhotos();
  }

  // ==========================================
  // 4. Render Gallery Photos
  // ==========================================
  function renderGalleryPhotos() {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

    if (galleryCount) {
      const activeAlbum = state.data.albums.find(a => a.id === state.activeFilter);
      const name = activeAlbum ? activeAlbum.title : 'All Projects';
      galleryCount.innerHTML = `Showing <strong>${state.activePhotosList.length}</strong> photos in <em>${name}</em>`;
    }

    state.activePhotosList.forEach((photo, index) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', `View photo ${photo.filename} in lightbox`);

      item.innerHTML = `
        <div class="gallery-item-image-wrapper">
          <img src="${photo.src}" alt="${photo.alt}" loading="lazy" />
          <div class="gallery-item-overlay">
            <div class="gallery-item-info">
              <span class="gallery-item-album">${photo.albumTitle}</span>
              <span class="gallery-item-title">${photo.filename.replace('.jpg', '')}</span>
            </div>
            <div class="gallery-item-zoom-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </div>
          </div>
        </div>
      `;

      const openHandler = () => openLightbox(index);
      item.addEventListener('click', openHandler);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openHandler();
        }
      });

      galleryGrid.appendChild(item);
    });
  }

  // ==========================================
  // 5. View Mode Toggles (Grid vs Masonry)
  // ==========================================
  function setupViewModeToggles() {
    viewModeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        state.currentViewMode = mode;
        viewModeBtns.forEach(b => b.classList.toggle('active', b === btn));
        if (galleryGrid) {
          galleryGrid.classList.toggle('masonry-view', mode === 'masonry');
        }
      });
    });
  }

  // ==========================================
  // 6. Fullscreen Lightbox Viewer
  // ==========================================
  function openLightbox(index) {
    if (!lightbox || state.activePhotosList.length === 0) return;
    state.lightboxIndex = (index + state.activePhotosList.length) % state.activePhotosList.length;
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
  // 7. Header Scroll & Mobile Nav
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
  // 8. Dynamic Email Obfuscation (Bot-Resistant)
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
  // 9. Smooth Scroll & Active Nav Spy
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
