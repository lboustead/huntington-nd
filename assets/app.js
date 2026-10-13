(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 900px)');
  let motionOverride = null;
  const motionReduced = () => motionOverride === null ? reducedMotion.matches : !motionOverride;
  root.classList.toggle('motion-paused', motionReduced());
  root.classList.add('js');
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress');
  let scrollFrame = 0;
  const updateScroll = () => {
    scrollFrame = 0;
    const scrollTop = Math.max(0, window.scrollY);
    if (header) header.classList.toggle('is-scrolled', scrollTop > 24);
    if (progress) progress.style.transform = `scaleX(${Math.min(1, scrollTop / Math.max(1, root.scrollHeight - window.innerHeight))})`;
  };
  const scheduleScroll = () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScroll);
  };
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  window.addEventListener('load', scheduleScroll, { once: true });
  updateScroll();

  const revealElements = Array.from(document.querySelectorAll('[data-reveal]'));
  let revealObserver = null;
  const observeReveals = (elements = revealElements) => {
    if (!revealObserver) return;
    for (const element of elements) {
      if (!element.hasAttribute('data-reveal') || element.hidden || element.classList.contains('is-visible')) continue;
      revealObserver.unobserve(element);
      revealObserver.observe(element);
    }
  };
  const configureMotion = () => {
    if (revealObserver) revealObserver.disconnect();
    revealObserver = null;
    if (motionReduced() || !('IntersectionObserver' in window)) {
      root.classList.remove('motion-ready');
      for (const element of revealElements) element.classList.add('is-visible');
      return;
    }
    revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || entry.target.hidden) continue;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -20px 0px', threshold: 0.08 });
    root.classList.add('motion-ready');
    observeReveals();
  };

  const heroImage = document.querySelector('.hero-image');
  const heroSlides = [
    { src: '/assets/home-living.jpg', alt: 'A bright living room with timber beams, a stone fireplace and warm wood floors.', caption: 'Spaces to gather.' },
    { src: '/assets/home-kitchen.jpg', alt: 'A Huntington Builders kitchen with white cabinets, a wood island, black fixtures and an adjoining dining area.', caption: 'Details to make your own.' },
    { src: '/assets/project-11.jpg', alt: 'A house with a stone facade, timber accents and a landscaped front yard.', caption: 'A place to come home.' }
  ];
  const heroButtons = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const heroCaption = document.querySelector('.hero-image-caption');
  const heroCounter = document.querySelector('.hero-image-counter');
  const heroAnnouncement = document.querySelector('#hero-announcement');
  let heroIndex = 0;
  let heroVisibleIndex = 0;
  let heroAnimation = null;
  let heroTransition = 0;
  const stopHeroAnimation = () => {
    if (heroAnimation) heroAnimation.cancel();
    heroAnimation = null;
  };
  const cancelHeroTransition = () => {
    heroTransition += 1;
    stopHeroAnimation();
  };
  const showHeroSlide = async (index) => {
    if (!heroImage) return;
    const next = (index + heroSlides.length) % heroSlides.length;
    if (next === heroIndex) return;
    heroIndex = next;
    cancelHeroTransition();
    const transition = heroTransition;
    const slide = heroSlides[next];
    const incoming = new Image();
    incoming.src = slide.src;
    try { await incoming.decode(); } catch {
      if (transition === heroTransition) heroIndex = heroVisibleIndex;
      return;
    }
    if (transition !== heroTransition) return;
    heroVisibleIndex = next;
    heroImage.src = slide.src;
    heroImage.alt = slide.alt;
    heroCaption.textContent = slide.caption;
    heroCounter.textContent = `${String(next + 1).padStart(2, '0')} / 03`;
    for (const button of heroButtons) button.setAttribute('aria-pressed', String(Number(button.dataset.heroSlide) === next));
    heroAnnouncement.textContent = `${slide.caption} Photo ${next + 1} of ${heroSlides.length}.`;
    if (!motionReduced() && typeof heroImage.animate === 'function') {
      heroAnimation = heroImage.animate([{ opacity: 0.45 }, { opacity: 1 }], { duration: 350, easing: 'ease-out' });
    }
  };
  if (heroImage) {
    document.querySelector('[data-hero-controls]').hidden = false;
    for (const button of heroButtons) button.addEventListener('click', () => showHeroSlide(Number(button.dataset.heroSlide)));
    document.querySelector('[data-hero-prev]').addEventListener('click', () => showHeroSlide(heroIndex - 1));
    document.querySelector('[data-hero-next]').addEventListener('click', () => showHeroSlide(heroIndex + 1));
  }
  const processAccordions = [];
  document.querySelectorAll('.process-steps details').forEach((details) => {
    const summary = details.querySelector('summary');
    const panel = details.querySelector('.process-panel');
    if (!summary || !panel || typeof details.animate !== 'function') return;
    let targetOpen = details.open;
    let animation = null;
    let transition = 0;
    const settle = () => {
      transition += 1;
      if (animation) {
        animation.cancel();
        animation = null;
      }
      details.open = targetOpen;
      details.style.removeProperty('height');
      details.style.removeProperty('overflow');
      scheduleScroll();
    };
    const toggleDetails = (open) => {
      targetOpen = open;
      if (motionReduced()) {
        settle();
        return;
      }
      // A reversal starts from the current animated height, without a jump.
      const startHeight = details.getBoundingClientRect().height;
      transition += 1;
      if (animation) {
        animation.cancel();
        animation = null;
      }
      details.open = true;
      details.style.height = 'auto';
      const expandedHeight = details.getBoundingClientRect().height;
      const style = window.getComputedStyle(details);
      const collapsedHeight = summary.getBoundingClientRect().height
        + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)
        + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const endHeight = open ? expandedHeight : collapsedHeight;
      details.style.height = `${startHeight}px`;
      details.style.overflow = 'hidden';
      if (Math.abs(startHeight - endHeight) < 1) {
        settle();
        return;
      }
      const currentTransition = transition;
      try {
        animation = details.animate([
          { height: `${startHeight}px` },
          { height: `${endHeight}px` }
        ], { duration: 320, easing: 'cubic-bezier(.22, .68, .3, 1)', fill: 'forwards' });
        animation.addEventListener('finish', () => {
          if (transition === currentTransition) settle();
        }, { once: true });
      } catch {
        settle();
      }
      scheduleScroll();
    };
    summary.addEventListener('click', (event) => {
      // Native summary activation also synthesizes this click for Enter/Space.
      event.preventDefault();
      toggleDetails(animation ? !targetOpen : !details.open);
    });
    details.addEventListener('toggle', () => {
      if (!animation) targetOpen = details.open;
    });
    processAccordions.push({ settle: () => { if (animation) settle(); } });
  });
  const settleProcessAccordions = () => processAccordions.forEach((accordion) => accordion.settle());
  window.addEventListener('resize', settleProcessAccordions, { passive: true });

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  toggle.hidden = false;
  const setMenu = (open, returnFocus = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
    nav.inert = mobile.matches && !open;
    nav.setAttribute('aria-hidden', String(mobile.matches && !open));
    if (header) header.classList.toggle('is-menu-open', open);
    scheduleScroll();
    if (returnFocus) toggle.focus();
  };
  setMenu(false);
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) setMenu(false);
  });
  mobile.addEventListener('change', () => setMenu(false));

  const cards = Array.from(document.querySelectorAll('.project-card'));
  const filters = Array.from(document.querySelectorAll('.filter'));
  const count = document.querySelector('.gallery-count');
  const moreWrap = document.querySelector('.gallery-more-wrap');
  const moreButton = document.querySelector('#gallery-more');
  let category = 'all';
  let expanded = false;
  const matchingCards = () => cards.filter((card) => category === 'all' || card.dataset.category === category);
  const updateGallery = () => {
    const matches = matchingCards();
    const visible = expanded ? matches : matches.slice(0, 6);
    cards.forEach((card) => { card.hidden = !visible.includes(card); });
    visible.forEach((card, index) => card.style.setProperty('--reveal-delay', `${(index % 2) * 70}ms`));
    count.textContent = `${visible.length} of ${matches.length} photos`;
    moreWrap.hidden = matches.length <= 6;
    moreButton.innerHTML = expanded ? 'Show fewer photos <span aria-hidden="true">−</span>' : `View all ${matches.length} photos <span aria-hidden="true">+</span>`;
    moreButton.setAttribute('aria-expanded', String(expanded));
    observeReveals(visible);
    scheduleScroll();
  };
  document.querySelector('.gallery-controls').hidden = false;
  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      category = filter.dataset.filter;
      expanded = false;
      filters.forEach((item) => {
        const active = item === filter;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      updateGallery();
    });
  });
  moreButton.addEventListener('click', () => {
    expanded = !expanded;
    updateGallery();
    if (!expanded) document.querySelector('.gallery-controls').scrollIntoView({ block: 'start', behavior: motionReduced() ? 'instant' : 'smooth' });
  });
  updateGallery();

  const dialog = document.querySelector('#project-lightbox');
  const image = document.querySelector('#lightbox-image');
  const title = document.querySelector('#lightbox-title');
  const counter = document.querySelector('#lightbox-counter');
  let photoIndex = 0;
  let activePhotos = [];
  let opener = null;
  const showPhoto = (index) => {
    photoIndex = (index + activePhotos.length) % activePhotos.length;
    const card = activePhotos[photoIndex];
    image.src = card.href;
    image.alt = card.querySelector('img').alt;
    title.textContent = card.dataset.title;
    counter.textContent = `${photoIndex + 1} / ${activePhotos.length}`;
  };
  if (typeof dialog.showModal === 'function') {
    cards.forEach((card) => {
      card.setAttribute('aria-haspopup', 'dialog');
      card.addEventListener('click', (event) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        opener = card;
        activePhotos = matchingCards();
        showPhoto(activePhotos.indexOf(card));
        dialog.showModal();
        document.body.classList.add('modal-open');
        dialog.querySelector('.lightbox-close').focus();
      });
    });
    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.lightbox-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
    dialog.querySelector('.lightbox-next').addEventListener('click', () => showPhoto(photoIndex + 1));
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        showPhoto(photoIndex + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
      }
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      if (opener) opener.focus();
    });
  }
  const mapFrame = document.querySelector('.availability-map iframe');
  const mapPlaceholder = document.querySelector('.map-placeholder');
  const mapLoad = document.querySelector('#map-load');
  if (mapFrame && mapPlaceholder && mapLoad) {
    const mapSource = mapFrame.getAttribute('src');
    mapFrame.removeAttribute('src');
    mapFrame.hidden = true;
    mapPlaceholder.hidden = false;
    mapLoad.addEventListener('click', () => {
      mapFrame.src = mapSource;
      mapFrame.hidden = false;
      mapPlaceholder.hidden = true;
      mapFrame.focus();
    }, { once: true });
  }

  const motionToggle = document.querySelector('#motion-toggle');
  const motionToggleLabel = document.querySelector('#motion-toggle-label');
  const syncMotion = () => {
    const enabled = !motionReduced();
    root.classList.toggle('motion-opt-in', motionOverride === true);
    root.classList.toggle('motion-paused', !enabled);
    if (motionToggle) {
      motionToggle.hidden = false;
      motionToggle.setAttribute('aria-pressed', String(enabled));
      motionToggle.setAttribute('aria-label', 'Page motion');
      motionToggle.title = `Turn page motion ${enabled ? 'off' : 'on'}`;
    }
    if (motionToggleLabel) {
      motionToggleLabel.hidden = false;
      motionToggleLabel.textContent = `Motion ${enabled ? 'on' : 'off'}`;
    }
    stopHeroAnimation();
    settleProcessAccordions();
    configureMotion();
    scheduleScroll();
  };
  if (motionToggle) {
    motionToggle.addEventListener('click', () => {
      motionOverride = motionReduced();
      syncMotion();
    });
  }
  reducedMotion.addEventListener('change', syncMotion);
  syncMotion();
  document.querySelector('#copyright-year').textContent = String(new Date().getFullYear());
})();
