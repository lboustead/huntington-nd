(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 900px)');
  const motionReduced = () => reducedMotion.matches;
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

  const entranceTargets = Array.from(document.querySelectorAll('[data-enter]'));
  let entranceObserver = null;
  const revealEntrance = (element, immediate = false) => {
    if (!immediate && element.classList.contains('is-entered')) return;
    element.classList.toggle('enter-instant', immediate);
    element.classList.toggle('is-entering', !immediate);
    element.classList.add('is-entered');
  };
  const resetEntrance = (element, fromAbove = false) => {
    if (element.contains(document.activeElement)) return;
    element.dataset.enterEdge = fromAbove ? 'above' : 'below';
    element.classList.add('enter-instant');
    element.classList.remove('is-entered', 'is-entering');
  };
  const finishEntrance = (event) => {
    if (event.propertyName === 'transform' && event.target.matches('[data-enter]')) {
      event.target.classList.remove('is-entering');
    }
  };
  document.addEventListener('transitionend', finishEntrance);
  document.addEventListener('transitioncancel', finishEntrance);
  const observeEntrances = (elements = entranceTargets) => {
    if (!entranceObserver) return;
    for (const element of elements) {
      if (element.hidden) {
        entranceObserver.unobserve(element);
        resetEntrance(element);
      } else {
        entranceObserver.observe(element);
      }
    }
  };
  const configureEntrances = () => {
    if (entranceObserver) entranceObserver.disconnect();
    entranceObserver = null;
    for (const element of entranceTargets) element.classList.remove('is-entering');
    if (motionReduced() || !('IntersectionObserver' in window)) {
      root.classList.remove('scroll-motion');
      return;
    }
    for (const element of entranceTargets) {
      const bounds = element.getBoundingClientRect();
      if ((!element.hidden && bounds.bottom > 0 && bounds.top < window.innerHeight)
        || element.contains(document.activeElement)) {
        revealEntrance(element, true);
      } else {
        resetEntrance(element, !element.hidden && bounds.bottom <= 0);
      }
    }
    entranceObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target.hidden) continue;
        if (entry.isIntersecting) {
          revealEntrance(entry.target);
        } else if (entry.boundingClientRect.bottom <= 0
          || entry.boundingClientRect.top >= window.innerHeight) {
          resetEntrance(entry.target, entry.boundingClientRect.bottom <= 0);
        }
      }
    }, { threshold: 0 });
    root.classList.add('scroll-motion');
    observeEntrances();
  };
  let pointerEntrance = null;
  document.addEventListener('pointerdown', (event) => {
    pointerEntrance = event.target.closest('[data-enter]');
  }, true);
  const clearPointerEntrance = () => { window.setTimeout(() => { pointerEntrance = null; }, 0); };
  document.addEventListener('pointerup', clearPointerEntrance, true);
  document.addEventListener('pointercancel', clearPointerEntrance, true);
  document.addEventListener('focusin', (event) => {
    const entrance = event.target.closest('[data-enter]');
    if (entrance) revealEntrance(entrance, entrance !== pointerEntrance);
  });
  document.addEventListener('focusout', (event) => {
    const entrance = event.target.closest('[data-enter]');
    if (!entrance || !entranceObserver || entrance.contains(event.relatedTarget)) return;
    const bounds = entrance.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) {
      resetEntrance(entrance, bounds.bottom <= 0);
    }
  });

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
  const heroVisual = document.querySelector('.hero-visual');
  const heroPause = document.querySelector('[data-hero-pause]');
  let heroTimer = 0;
  let heroPaused = false;
  let heroPlayRequested = false;
  let heroInView = true;
  const canAdvanceHero = () => !heroPaused && !motionReduced() && !document.hidden
    && heroInView && (heroPlayRequested || (!heroVisual?.matches(':hover') && !heroVisual?.contains(document.activeElement)));
  const scheduleHeroAdvance = () => {
    window.clearTimeout(heroTimer);
    heroTimer = 0;
    if (!heroImage || !canAdvanceHero()) return;
    heroTimer = window.setTimeout(() => {
      heroTimer = 0;
      showHeroSlide(heroIndex + 1, 1, true).finally(scheduleHeroAdvance);
    }, 5000);
  };
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
  const showHeroSlide = async (index, direction = 0, automatic = false) => {
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
    if (automatic && !canAdvanceHero()) {
      heroIndex = heroVisibleIndex;
      return;
    }
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
    if (!automatic) heroAnnouncement.textContent = `${slide.caption} Photo ${next + 1} of ${heroSlides.length}.`;
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
    heroPause?.addEventListener('click', () => {
      heroPaused = !heroPaused;
      heroPlayRequested = !heroPaused;
      heroPause.textContent = heroPaused ? 'Play' : 'Pause';
      heroPause.setAttribute('aria-label', `${heroPaused ? 'Play' : 'Pause'} featured photo carousel`);
      scheduleHeroAdvance();
    });
    const pauseForInteraction = () => { heroPlayRequested = false; scheduleHeroAdvance(); };
    heroVisual.addEventListener('mouseenter', pauseForInteraction);
    heroVisual.addEventListener('mouseleave', pauseForInteraction);
    heroVisual.addEventListener('focusin', (event) => { if (event.target !== heroPause) pauseForInteraction(); });
    heroVisual.addEventListener('focusout', () => { heroPlayRequested = false; window.requestAnimationFrame(scheduleHeroAdvance); });
    document.addEventListener('visibilitychange', scheduleHeroAdvance);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        heroInView = entries[0].isIntersecting;
        scheduleHeroAdvance();
      }).observe(heroVisual);
    }
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
  const galleryEntrances = ['left', 'right', 'up', 'settle', 'right', 'left'];
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
    visible.forEach((card, index) => {
      card.dataset.enter = galleryEntrances[index % galleryEntrances.length];
      card.dataset.enterStep = String(index % 2);
    });
    count.textContent = `${visible.length} of ${matches.length} photos`;
    moreWrap.hidden = matches.length <= 6;
    moreButton.innerHTML = expanded ? 'Show fewer photos <span aria-hidden="true">−</span>' : `View all ${matches.length} photos <span aria-hidden="true">+</span>`;
    moreButton.setAttribute('aria-expanded', String(expanded));
    observeEntrances(cards);
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
  const form = document.querySelector('#contact-form');
  if (form) {
    const status = document.querySelector('#form-status');
    const button = form.querySelector('[type="submit"]');
    const label = button.querySelector('[data-submit-label]');
    const startedAt = form.elements.namedItem('startedAt');
    startedAt.value = String(Date.now());
    let pending = false;
    document.querySelectorAll('[data-interest]').forEach(link => link.addEventListener('click', () => {
      form.elements.namedItem('interest').value = link.dataset.interest;
    }));
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (pending) return;
      for (const name of ['name', 'email', 'phone', 'message']) {
        const field = form.elements.namedItem(name);
        if (field) field.value = field.value.trim();
      }
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const payload = Object.fromEntries(['name', 'email', 'phone', 'interest', 'message', 'website'].map(name => [name, String(data.get(name) || '').trim()]));
      payload.startedAt = Number(data.get('startedAt'));
      pending = true;
      button.disabled = true;
      form.setAttribute('aria-busy', 'true');
      label.textContent = 'Sending your message…';
      status.dataset.state = 'pending';
      status.textContent = 'Sending your message to our team…';
      try {
        const response = await fetch('/api/contact', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload), signal: AbortSignal.timeout(20000),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || result?.ok !== true) {
          throw new Error(result?.error || 'Your message could not be sent. Please try again or call or text our team.');
        }
        const unchanged = ['name', 'email', 'phone', 'interest', 'message', 'website'].every(name => String(form.elements.namedItem(name).value).trim() === payload[name]);
        if (unchanged) form.reset();
        startedAt.value = String(Date.now());
        status.dataset.state = 'success';
        status.textContent = 'Your message has been sent. Our team will be in touch soon.';
        status.focus({ preventScroll: true });
      } catch (error) {
        status.dataset.state = 'error';
        status.textContent = error.name === 'TimeoutError' || error.name === 'AbortError'
          ? 'We could not confirm your message was sent. Please try again or call or text our team. Your details are still here.'
          : `${error.name === 'TypeError' ? 'Your message could not be sent. Please try again or call or text our team.' : error.message || 'Your message could not be sent. Please try again or call or text our team.'} Your details are still here.`;
        status.focus({ preventScroll: true });
      } finally {
        pending = false;
        button.disabled = false;
        form.removeAttribute('aria-busy');
        label.textContent = 'Send your message';
      }
    });
  }

  const syncMotion = () => {
    root.classList.toggle('motion-paused', motionReduced());
    stopHeroAnimation();
    settleProcessAccordions();
    configureEntrances();
    scheduleScroll();
    scheduleHeroAdvance();
  };
  reducedMotion.addEventListener('change', syncMotion);
  syncMotion();
  document.querySelector('#copyright-year').textContent = String(new Date().getFullYear());
})();
