(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 900px)');
  const revealElements = Array.from(document.querySelectorAll('[data-reveal]'));
  let revealObserver = null;
  const observeReveals = (elements = revealElements) => {
    if (!revealObserver) return;
    elements.forEach((element) => {
      if (element.hidden || element.classList.contains('is-visible')) return;
      // Re-observe cards after a filter changes their display state.
      revealObserver.unobserve(element);
      revealObserver.observe(element);
    });
  };
  const configureMotion = () => {
    if (revealObserver) revealObserver.disconnect();
    revealObserver = null;
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      root.classList.remove('motion-ready');
      revealElements.forEach((element) => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.hidden) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -35px 0px', threshold: 0.08 });
    revealObserver = observer;
    root.classList.add('motion-ready');
    observeReveals();
  };

  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress');
  const heroImage = document.querySelector('.hero-image');
  const scrollEffects = Array.from(document.querySelectorAll('[data-scroll-motion], [data-scroll-rotate]')).map((element) => ({
    element,
    anchor: element.closest('[data-scroll-anchor]') || element.parentElement,
    shift: Math.max(-40, Math.min(40, Number(element.dataset.scrollMotion) || 0)),
    rotation: Math.max(-90, Math.min(90, Number(element.dataset.scrollRotate) || 0))
  }));
  let heroAnimation = null;
  let heroTransition = 0;
  const cancelHeroTransition = () => {
    heroTransition += 1;
    if (heroAnimation) {
      heroAnimation.cancel();
      heroAnimation = null;
    }
    return heroTransition;
  };
  const animateHeroImage = async (transition) => {
    if (!heroImage || reducedMotion.matches || typeof heroImage.animate !== 'function') return;
    try {
      if (typeof heroImage.decode === 'function') {
        await heroImage.decode();
      } else if (!heroImage.complete) {
        await new Promise((resolve, reject) => {
          const cleanup = () => {
            heroImage.removeEventListener('load', loaded);
            heroImage.removeEventListener('error', failed);
          };
          const loaded = () => { cleanup(); resolve(); };
          const failed = () => { cleanup(); reject(new Error('Hero image could not load.')); };
          heroImage.addEventListener('load', loaded, { once: true });
          heroImage.addEventListener('error', failed, { once: true });
        });
      }
      if (transition !== heroTransition || reducedMotion.matches || !heroImage.naturalWidth) return;
      // Only animate opacity so the scroll-driven image position stays intact.
      const animation = heroImage.animate([{ opacity: 0.4 }, { opacity: 1 }], {
        duration: 620,
        easing: 'cubic-bezier(.22, 1, .36, 1)'
      });
      heroAnimation = animation;
      animation.addEventListener('finish', () => {
        if (heroAnimation === animation) heroAnimation = null;
      }, { once: true });
    } catch {
      // A canceled decode or failed image must not interrupt the controls.
    }
  };
  let scrollFrame = 0;
  const updateScroll = () => {
    scrollFrame = 0;
    const scrollTop = Math.max(0, window.scrollY);
    const viewportHeight = window.innerHeight;
    const scrollRange = progress ? Math.max(1, root.scrollHeight - viewportHeight) : 1;
    const reduced = reducedMotion.matches;
    const anchorBounds = new Map();
    const effectUpdates = [];
    // Read stable frames together before any animated styles are written.
    scrollEffects.forEach((effect) => {
      if (reduced) {
        effectUpdates.push({ effect, shift: 0, rotation: 0 });
        return;
      }
      if (!effect.anchor || effect.element.closest('[hidden]')) return;
      if (!anchorBounds.has(effect.anchor)) anchorBounds.set(effect.anchor, effect.anchor.getBoundingClientRect());
      const bounds = anchorBounds.get(effect.anchor);
      if (!bounds.height || bounds.bottom < -160 || bounds.top > viewportHeight + 160) return;
      const position = Math.max(0, Math.min(1, (viewportHeight - bounds.top) / (viewportHeight + bounds.height)));
      effectUpdates.push({ effect, shift: (position - 0.5) * 2 * effect.shift, rotation: position * effect.rotation });
    });
    if (header) {
      header.classList.toggle('is-scrolled', scrollTop > 40);
      const dockDistance = mobile.matches ? 120 : 160;
      header.style.setProperty('--brand-progress', String(reduced ? 1 : Math.min(1, scrollTop / dockDistance)));
    }
    if (progress) progress.style.transform = `scaleX(${Math.min(1, scrollTop / scrollRange)})`;
    if (heroImage) {
      const shift = reduced || mobile.matches ? 0 : Math.min(50, scrollTop * 0.08);
      heroImage.style.setProperty('--hero-shift', `${shift}px`);
    }
    effectUpdates.forEach(({ effect, shift, rotation }) => {
      effect.element.style.setProperty('--scroll-shift', `${shift.toFixed(2)}px`);
      effect.element.style.setProperty('--scroll-rotate', `${rotation.toFixed(2)}deg`);
    });
  };
  const scheduleScroll = () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScroll);
  };
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  window.addEventListener('load', scheduleScroll, { once: true });
  reducedMotion.addEventListener('change', () => {
    cancelHeroTransition();
    configureMotion();
    scheduleScroll();
  });
  mobile.addEventListener('change', scheduleScroll);
  configureMotion();
  updateScroll();

  const heroSlides = [
    {
      src: '/assets/home-living.jpg',
      alt: 'A bright living room with timber beams, a stone fireplace and warm wood floors.',
      caption: 'Spaces to gather.'
    },
    {
      src: '/assets/home-kitchen.jpg',
      alt: 'A Huntington Builders kitchen with white cabinets, a wood island, black fixtures and an adjoining dining area.',
      caption: 'Details to make your own.'
    },
    {
      src: '/assets/project-11.jpg',
      alt: 'A house with a stone facade, timber accents and a landscaped front yard.',
      caption: 'A place to come home.'
    }
  ];
  const heroButtons = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const heroCaption = document.querySelector('.hero-image-caption');
  const heroCounter = document.querySelector('.hero-image-counter');
  const heroAnnouncement = document.querySelector('#hero-announcement');
  let heroIndex = 0;
  const showHeroSlide = (index, announce = true) => {
    if (!heroImage) return;
    const nextIndex = (index + heroSlides.length) % heroSlides.length;
    const animate = announce && nextIndex !== heroIndex;
    const transition = cancelHeroTransition();
    heroIndex = nextIndex;
    const slide = heroSlides[heroIndex];
    heroImage.src = slide.src;
    heroImage.alt = slide.alt;
    if (heroCaption) heroCaption.textContent = slide.caption;
    if (heroCounter) heroCounter.textContent = `${String(heroIndex + 1).padStart(2, '0')} / ${String(heroSlides.length).padStart(2, '0')}`;
    heroButtons.forEach((button) => {
      const active = Number(button.dataset.heroSlide) === heroIndex;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (heroAnnouncement && announce) heroAnnouncement.textContent = `${slide.caption} Photo ${heroIndex + 1} of ${heroSlides.length}.`;
    if (animate) animateHeroImage(transition);
  };
  if (heroImage) {
    document.querySelectorAll('[data-hero-controls], .hero-controls').forEach((controls) => { controls.hidden = false; });
    heroButtons.forEach((button) => {
      button.addEventListener('click', () => showHeroSlide(Number(button.dataset.heroSlide)));
    });
    const heroPrev = document.querySelector('[data-hero-prev]');
    const heroNext = document.querySelector('[data-hero-next]');
    if (heroPrev) heroPrev.addEventListener('click', () => showHeroSlide(heroIndex - 1));
    if (heroNext) heroNext.addEventListener('click', () => showHeroSlide(heroIndex + 1));
    showHeroSlide(0, false);
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
      if (reducedMotion.matches) {
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
  reducedMotion.addEventListener('change', settleProcessAccordions);

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  toggle.hidden = false;
  const setMenu = (open, returnFocus = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
    if (header) header.classList.toggle('is-menu-open', open);
    if (returnFocus) toggle.focus();
  };
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
    if (!expanded) document.querySelector('.gallery-controls').scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
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
  document.querySelector('#copyright-year').textContent = String(new Date().getFullYear());
})();
