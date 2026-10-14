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
  const footerMotion = document.querySelector('[data-footer-motion]');
  const footerBand = document.querySelector('.footer-signature');
  const footerBase = document.querySelector('.footer-base');
  let scrollFrame = 0;
  const updateScroll = () => {
    scrollFrame = 0;
    const scrollTop = Math.max(0, window.scrollY);
    if (header) header.classList.toggle('is-scrolled', scrollTop > 24);
    if (progress) progress.style.transform = `scaleX(${Math.min(1, scrollTop / Math.max(1, root.scrollHeight - window.innerHeight))})`;
    if (footerMotion && footerBand && footerBase) {
      if (motionReduced()) {
        footerMotion.style.removeProperty('transform');
      } else {
        const band = footerBand.getBoundingClientRect();
        const distance = band.height + footerBase.offsetHeight;
        const position = Math.max(0, Math.min(1, (window.innerHeight - band.top) / Math.max(1, distance)));
        const travel = window.innerWidth <= 680 ? 144 : 280;
        footerMotion.style.transform = `translate3d(${(1 - position) * travel}px, 0, 0)`;
      }
    }
  };
  const scheduleScroll = () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScroll);
  };
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  window.addEventListener('load', scheduleScroll, { once: true });
  updateScroll();

  const heroImage = document.querySelector('.hero-image');
  const heroSlides = [
    { src: '/assets/project-11.jpg', alt: 'A house with a stone facade, timber accents and a landscaped front yard.', caption: 'Stone, timber, and a place to call home.' },
    { src: '/assets/project-05.jpg', alt: 'An open kitchen and living room with wood beams, a large island and a stone fireplace.', caption: 'Room for the moments that matter.' },
    { src: '/assets/project-02.jpg', alt: 'A close view of a kitchen island with a black faucet, white counters and wood cabinetry.', caption: 'Details that feel like you.' }
  ];
  const heroButtons = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const heroCaption = document.querySelector('.hero-image-caption');
  const heroCounter = document.querySelector('.hero-image-counter');
  const heroAnnouncement = document.querySelector('#hero-announcement');
  let heroIndex = 0;
  let heroVisibleIndex = 0;
  let heroAnimations = [];
  let heroOutgoing = null;
  let heroTransition = 0;
  const stopHeroAnimation = () => {
    for (const animation of heroAnimations) animation.cancel();
    heroAnimations = [];
    if (heroOutgoing) heroOutgoing.remove();
    heroOutgoing = null;
  };
  const cancelHeroTransition = () => {
    heroTransition += 1;
    stopHeroAnimation();
  };
  const showHeroSlide = async (index, direction = 0) => {
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
    const slideDirection = direction || Math.sign(next - heroVisibleIndex) || 1;
    const animateTransition = !motionReduced() && typeof heroImage.animate === 'function';
    if (animateTransition) {
      heroOutgoing = heroImage.cloneNode(false);
      heroOutgoing.className = 'hero-transition-image';
      heroOutgoing.alt = '';
      heroOutgoing.setAttribute('aria-hidden', 'true');
      heroOutgoing.removeAttribute('fetchpriority');
      heroImage.after(heroOutgoing);
    }
    heroVisibleIndex = next;
    heroImage.src = slide.src;
    heroImage.alt = slide.alt;
    heroCaption.textContent = slide.caption;
    heroCounter.textContent = `${String(next + 1).padStart(2, '0')} / 03`;
    for (const button of heroButtons) button.setAttribute('aria-pressed', String(Number(button.dataset.heroSlide) === next));
    heroAnnouncement.textContent = `${slide.caption} Photo ${next + 1} of ${heroSlides.length}.`;
    if (animateTransition) {
      const timing = { duration: 480, easing: 'cubic-bezier(.22, .61, .36, 1)' };
      try {
        heroAnimations.push(heroImage.animate([
          { transform: `translateX(${slideDirection * 100}%)` },
          { transform: 'translateX(0)' }
        ], timing));
        heroAnimations.push(heroOutgoing.animate([
          { transform: 'translateX(0)' },
          { transform: `translateX(${slideDirection * -100}%)` }
        ], timing));
        heroAnimations[0].addEventListener('finish', () => {
          if (transition === heroTransition) stopHeroAnimation();
        }, { once: true });
      } catch {
        stopHeroAnimation();
      }
    }
  };
  if (heroImage) {
    document.querySelector('[data-hero-controls]').hidden = false;
    for (const button of heroButtons) button.addEventListener('click', () => showHeroSlide(Number(button.dataset.heroSlide)));
    document.querySelector('[data-hero-prev]').addEventListener('click', () => showHeroSlide(heroIndex - 1, -1));
    document.querySelector('[data-hero-next]').addEventListener('click', () => showHeroSlide(heroIndex + 1, 1));
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
    const link = event.target.closest('a');
    if (!link) return;
    setMenu(false);
    if (!mobile.matches || !link.hash || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const destination = document.getElementById(link.hash.slice(1));
    if (!destination) return;
    if (!destination.hasAttribute('tabindex')) destination.setAttribute('tabindex', '-1');
    window.requestAnimationFrame(() => destination.focus({ preventScroll: true }));
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
    cards.forEach((card) => {
      card.hidden = !visible.includes(card);
      card.classList.remove('is-wide', 'is-narrow');
    });
    if (category === 'all') {
      visible[0]?.classList.add('is-wide');
      visible[1]?.classList.add('is-narrow');
    }
    count.textContent = `${visible.length} of ${matches.length} photos`;
    moreWrap.hidden = matches.length <= 6;
    moreButton.innerHTML = expanded ? 'Show fewer photos <span aria-hidden="true">−</span>' : `View all ${matches.length} photos <span aria-hidden="true">+</span>`;
    moreButton.setAttribute('aria-expanded', String(expanded));
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
    if (!expanded) {
      filters.find((filter) => filter.dataset.filter === category)?.focus({ preventScroll: true });
      document.querySelector('.gallery-controls').scrollIntoView({ block: 'start', behavior: motionReduced() ? 'instant' : 'smooth' });
    }
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
