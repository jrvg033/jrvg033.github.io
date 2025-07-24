document.addEventListener('DOMContentLoaded', () => {
  if (document.body.id === 'entradas') {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');

  let currentScale = 1;
  let currentTranslateX = 0;
  let currentTranslateY = 0;
  let isDragging = false;
  let startPointerX = 0;
  let startPointerY = 0;

  let isClickEvent = true;
  let clickStartX, clickStartY;

  let initialPinchDistance = null;
  let lastPinchScale = 1;

  const DRAG_THRESHOLD = 10;

  function applyTransform() {
    lightboxImg.style.transform = `scale(${currentScale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
  }

  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add('active');
    resetImageState();
  }

  // Solo se cierra si se hace clic en la X
  function closeLightbox(event) {
    if (event.target.closest('.lightbox-close')) {
      lightbox.classList.remove('active');
      resetImageState();
    }
  }

  function resetImageState() {
    currentScale = 1;
    currentTranslateX = 0;
    currentTranslateY = 0;
    isDragging = false;
    isClickEvent = true;
    initialPinchDistance = null;
    lastPinchScale = 1;
    applyTransform();
    lightbox.classList.remove('zoomed');
    lightboxImg.style.cursor = 'zoom-in';
  }

  // 📍 Zoom centrado en la posición del clic o toque
  function handleZoomClick(clientX, clientY) {
    const rect = lightboxImg.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    if (currentScale === 1) {
      currentScale = window.innerWidth <= 600 ? 1.5 : 2;
      lightbox.classList.add('zoomed');
      lightboxImg.style.cursor = 'grab';

      currentTranslateX = (centerX - offsetX) / currentScale;
      currentTranslateY = (centerY - offsetY) / currentScale;
    } else {
      resetImageState();
    }

    applyTransform();
  }

  // --- MOUSE ---

  lightboxImg.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    isClickEvent = true;
    startPointerX = e.clientX;
    startPointerY = e.clientY;
    clickStartX = e.clientX;
    clickStartY = e.clientY;
    if (currentScale > 1) lightboxImg.style.cursor = 'grabbing';
  });

  lightbox.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startPointerX;
    const deltaY = e.clientY - startPointerY;

    if (Math.abs(e.clientX - clickStartX) > DRAG_THRESHOLD || Math.abs(e.clientY - clickStartY) > DRAG_THRESHOLD) {
      isClickEvent = false;
    }

    if (currentScale > 1) {
      currentTranslateX += deltaX;
      currentTranslateY += deltaY;

      const imgDisplayWidth = lightboxImg.offsetWidth;
      const imgDisplayHeight = lightboxImg.offsetHeight;
      const containerWidth = lightbox.offsetWidth;
      const containerHeight = lightbox.offsetHeight;

      const maxTranslateX = Math.max(0, (imgDisplayWidth * currentScale - containerWidth) / 2 / currentScale);
      const maxTranslateY = Math.max(0, (imgDisplayHeight * currentScale - containerHeight) / 2 / currentScale);

      currentTranslateX = Math.max(Math.min(currentTranslateX, maxTranslateX), -maxTranslateX);
      currentTranslateY = Math.max(Math.min(currentTranslateY, maxTranslateY), -maxTranslateY);

      startPointerX = e.clientX;
      startPointerY = e.clientY;

      applyTransform();
    }
  });

  lightbox.addEventListener('mouseup', (e) => {
    isDragging = false;
    if (isClickEvent && e.target === lightboxImg) {
      handleZoomClick(e.clientX, e.clientY);
    }
    lightboxImg.style.cursor = currentScale > 1 ? 'grab' : 'zoom-in';
  });

  lightbox.addEventListener('mouseleave', () => {
    isDragging = false;
    lightboxImg.style.cursor = currentScale > 1 ? 'grab' : 'zoom-in';
  });

  // --- TOUCH ---

  lightboxImg.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isClickEvent = true;
    clickStartX = e.touches[0].clientX;
    clickStartY = e.touches[0].clientY;

    if (e.touches.length === 1) {
      isDragging = true;
      startPointerX = e.touches[0].clientX;
      startPointerY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      isDragging = false;
      initialPinchDistance = getDistance(e.touches[0], e.touches[1]);
      lastPinchScale = currentScale;
    }
  });

  lightbox.addEventListener('touchmove', (e) => {
    e.preventDefault();

    if (e.touches.length === 1 && isDragging) {
      const deltaX = e.touches[0].clientX - startPointerX;
      const deltaY = e.touches[0].clientY - startPointerY;

      if (Math.abs(e.touches[0].clientX - clickStartX) > DRAG_THRESHOLD || Math.abs(e.touches[0].clientY - clickStartY) > DRAG_THRESHOLD) {
        isClickEvent = false;
      }

      if (currentScale > 1) {
        currentTranslateX += deltaX;
        currentTranslateY += deltaY;

        const imgDisplayWidth = lightboxImg.offsetWidth;
        const imgDisplayHeight = lightboxImg.offsetHeight;
        const containerWidth = lightbox.offsetWidth;
        const containerHeight = lightbox.offsetHeight;

        const maxTranslateX = Math.max(0, (imgDisplayWidth * currentScale - containerWidth) / 2 / currentScale);
        const maxTranslateY = Math.max(0, (imgDisplayHeight * currentScale - containerHeight) / 2 / currentScale);

        currentTranslateX = Math.max(Math.min(currentTranslateX, maxTranslateX), -maxTranslateX);
        currentTranslateY = Math.max(Math.min(currentTranslateY, maxTranslateY), -maxTranslateY);

        startPointerX = e.touches[0].clientX;
        startPointerY = e.touches[0].clientY;

        applyTransform();
      }
    } else if (e.touches.length === 2 && initialPinchDistance) {
      isClickEvent = false;
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      currentScale = lastPinchScale * (currentDistance / initialPinchDistance);
      currentScale = Math.max(1, Math.min(currentScale, 4));

      if (currentScale > 1) {
        lightbox.classList.add('zoomed');
        currentTranslateX = 0;
        currentTranslateY = 0;
      } else {
        resetImageState();
      }

      applyTransform();
    }
  });

  lightbox.addEventListener('touchend', (e) => {
    isDragging = false;
    initialPinchDistance = null;

    if (isClickEvent && e.target === lightboxImg) {
      const touch = e.changedTouches[0];
      handleZoomClick(touch.clientX, touch.clientY);
    }

    lightboxImg.style.cursor = currentScale > 1 ? 'grab' : 'zoom-in';
  });

  function getDistance(p1, p2) {
    const dx = p1.clientX - p2.clientX;
    const dy = p1.clientY - p2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
    // Escuchar cierre por botón
    lightbox.addEventListener('click', closeLightbox);
  }
});
