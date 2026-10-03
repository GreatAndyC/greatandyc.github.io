(() => {
  const formatIndex = value => String(value + 1).padStart(2, '0');

  document.querySelectorAll('[data-work-gallery]').forEach(gallery => {
    const track = gallery.querySelector('[data-gallery-track]');
    const slides = Array.from(track.querySelectorAll('.work-gallery__slide'));
    const previous = gallery.querySelector('[data-gallery-prev]');
    const next = gallery.querySelector('[data-gallery-next]');
    const current = gallery.querySelector('[data-gallery-current]');
    const total = gallery.querySelector('[data-gallery-total]');
    let updateFrame = 0;

    if (!slides.length) return;

    total.textContent = String(slides.length).padStart(2, '0');

    const activeIndex = () => {
      const trackLeft = track.getBoundingClientRect().left;
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      slides.forEach((slide, index) => {
        const slideRect = slide.getBoundingClientRect();
        const slideLeft = slideRect.left - trackLeft + track.scrollLeft;
        const slideCenter = slideLeft + slideRect.width / 2;
        const distance = Math.abs(slideCenter - trackCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      return closestIndex;
    };

    const update = () => {
      const index = activeIndex();
      current.textContent = formatIndex(index);
      previous.disabled = index === 0;
      next.disabled = index === slides.length - 1;
    };

    const scrollToSlide = index => {
      slides[Math.max(0, Math.min(index, slides.length - 1))].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    };

    previous.addEventListener('click', () => scrollToSlide(activeIndex() - 1));
    next.addEventListener('click', () => scrollToSlide(activeIndex() + 1));

    track.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      scrollToSlide(activeIndex() + (event.key === 'ArrowRight' ? 1 : -1));
    });

    track.addEventListener('scroll', () => {
      cancelAnimationFrame(updateFrame);
      updateFrame = requestAnimationFrame(update);
    }, { passive: true });

    update();
  });
})();
