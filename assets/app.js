(() => {
  'use strict';
  document.documentElement.classList.add('js');

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const mobile = window.matchMedia('(max-width: 900px)');
  toggle.hidden = false;
  const setMenu = (open, returnFocus = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
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
    count.textContent = `${visible.length} of ${matches.length} photos`;
    moreWrap.hidden = matches.length <= 6;
    moreButton.innerHTML = expanded ? 'Show fewer photos <span aria-hidden="true">−</span>' : `View all ${matches.length} photos <span aria-hidden="true">+</span>`;
    moreButton.setAttribute('aria-expanded', String(expanded));
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
    if (!expanded) document.querySelector('.gallery-controls').scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
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
