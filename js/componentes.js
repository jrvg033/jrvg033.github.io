// ===========================================
// Código del Lightbox (solo se inicializa en páginas de entrada)
// ===========================================

// Envuelve todo el código del lightbox en una función
function initLightboxFunctionality() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    // **IMPORTANTE:** Verificar si los elementos HTML del lightbox existen en la página.
    // Si no existen (porque no es una página de entrada), la función termina aquí.
    if (!lightbox || !lightboxImg) {
        // console.log("Lightbox HTML no encontrado, la funcionalidad no se inicializa."); // Puedes descomentar para depuración
        return;
    }

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

    const DRAG_THRESHOLD = 5; // Recomendado, 10 es un poco alto para "clic"

    function applyTransform() {
        lightboxImg.style.transform = `scale(${currentScale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
    }

    // Haz estas funciones globales para que puedan ser llamadas desde los atributos `onclick` en el HTML
    window.openLightbox = function(src) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
        resetImageState();
    };

    window.closeLightbox = function(event) {
        if (event.target === lightbox || event.target.closest('.lightbox-close')) {
            lightbox.classList.remove('active');
            resetImageState();
        }
    };

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

    function handleZoomClick() {
        if (currentScale === 1) {
            // *** AQUÍ ESTÁ EL CAMBIO PRINCIPAL PARA MÁS ZOOM EN MÓVIL ***
            // Antes era 1.5, ahora lo subimos a 2.0 (o el valor que prefieras)
            currentScale = window.innerWidth <= 600 ? 3 : 2; // Ahora con 2.5x de zoom inicial en móvil
            lightbox.classList.add('zoomed');
            lightboxImg.style.cursor = 'grab';
        } else {
            resetImageState();
        }
        applyTransform();
    }

    // --- Manejo de eventos de MOUSE (Escritorio) ---
    lightboxImg.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;
        isClickEvent = true;
        startPointerX = e.clientX;
        startPointerY = e.clientY;
        clickStartX = e.clientX;
        clickStartY = e.clientY;
        if (currentScale > 1) {
            lightboxImg.style.cursor = 'grabbing';
        }
    });

    lightbox.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const totalDeltaX = e.clientX - clickStartX;
        const totalDeltaY = e.clientY - clickStartY;

        if (Math.abs(totalDeltaX) > DRAG_THRESHOLD || Math.abs(totalDeltaY) > DRAG_THRESHOLD) {
            isClickEvent = false;
        }

        if (currentScale > 1) {
            const dx = e.clientX - startPointerX;
            const dy = e.clientY - startPointerY;

            currentTranslateX += dx;
            currentTranslateY += dy;

            const imgDisplayWidth = lightboxImg.offsetWidth;
            const imgDisplayHeight = lightboxImg.offsetHeight;
            const currentImgWidthZoomed = imgDisplayWidth * currentScale;
            const currentImgHeightZoomed = imgDisplayHeight * currentScale;

            const containerWidth = lightbox.offsetWidth;
            const containerHeight = lightbox.offsetHeight;

            const maxTranslateX = Math.max(0, (currentImgWidthZoomed - containerWidth) / 2 / currentScale);
            const maxTranslateY = Math.max(0, (currentImgHeightZoomed - containerHeight) / 2 / currentScale);

            currentTranslateX = Math.max(Math.min(currentTranslateX, maxTranslateX), -maxTranslateX);
            currentTranslateY = Math.max(Math.min(currentTranslateY, maxTranslateY), -maxTranslateY);

            startPointerX = e.clientX;
            startPointerY = e.clientY;

            applyTransform();
        }
    });

    lightbox.addEventListener('mouseup', (e) => {
        isDragging = false;

        if (isClickEvent) {
            if (e.target === lightboxImg) {
                handleZoomClick();
            } else if (e.target === lightbox) {
                closeLightbox(e);
            }
        }

        if (currentScale > 1) {
            lightboxImg.style.cursor = 'grab';
        } else {
            lightboxImg.style.cursor = 'zoom-in';
        }
    });

    lightbox.addEventListener('mouseleave', () => {
        isDragging = false;
        if (currentScale > 1) {
            lightboxImg.style.cursor = 'grab';
        } else {
            lightboxImg.style.cursor = 'zoom-in';
        }
    });

    // --- Manejo de eventos TOUCH (Móviles) ---
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
            const totalDeltaX = e.touches[0].clientX - clickStartX;
            const totalDeltaY = e.touches[0].clientY - clickStartY;

            if (Math.abs(totalDeltaX) > DRAG_THRESHOLD || Math.abs(totalDeltaY) > DRAG_THRESHOLD) {
                isClickEvent = false;
            }

            if (currentScale > 1) {
                const dx = e.touches[0].clientX - startPointerX;
                const dy = e.touches[0].clientY - startPointerY;

                currentTranslateX += dx;
                currentTranslateY += dy;

                const imgDisplayWidth = lightboxImg.offsetWidth;
                const imgDisplayHeight = lightboxImg.offsetHeight;
                const currentImgWidthZoomed = imgDisplayWidth * currentScale;
                const currentImgHeightZoomed = imgDisplayHeight * currentScale;

                const containerWidth = lightbox.offsetWidth;
                const containerHeight = lightbox.offsetHeight;

                const maxTranslateX = Math.max(0, (currentImgWidthZoomed - containerWidth) / 2 / currentScale);
                const maxTranslateY = Math.max(0, (currentImgHeightZoomed - containerHeight) / 2 / currentScale);

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

        if (isClickEvent) {
            if (e.target === lightboxImg) {
                handleZoomClick();
            } else if (e.target === lightbox) {
                closeLightbox(e);
            }
        }

        if (currentScale > 1) {
            lightboxImg.style.cursor = 'grab';
        } else {
            lightboxImg.style.cursor = 'zoom-in';
        }
    });

    function getDistance(p1, p2) {
        const dx = p1.clientX - p2.clientX;
        const dy = p1.clientY - p2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
} // Fin de initLightboxFunctionality

// ===========================================
// Inicialización de todas las funcionalidades
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    // Aquí puedes llamar a otras funciones de inicialización que sean comunes a TODAS las páginas
    // Por ejemplo, si tu `componentes.js` tiene otras funciones que siempre se ejecutan:
    // initCommonNavigation();
    // setupGlobalSearch();

    // Inicializa la funcionalidad del lightbox SOLAMENTE si el <body> tiene el ID 'entradas'
    if (document.body.id === 'entradas') {
        initLightboxFunctionality();
    }
});
