function reset_view(element) {
    const viewer = element.closest('model-viewer');
    viewer.cameraOrbit = viewer.dataset.cameraOrbit;
    viewer.cameraTarget = viewer.dataset.cameraTarget;
    viewer.fieldOfView = viewer.dataset.fieldOfView;
    viewer.resetTurntableRotation(0)

}

function toggle_fullscreen(btn) {
    const viewer = btn.closest('model-viewer');
    const icon_path = btn.querySelector('path');
    if (!document.fullscreenElement) {
      viewer.requestFullscreen?.() || viewer.webkitRequestFullscreen?.();
      icon_path.setAttribute('d', 'M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7');
    } else {
      document.exitFullscreen?.();
      icon_path.setAttribute('d', 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7');
    }
}

async function save_poster(btn) {
    const viewer = btn.closest('model-viewer');
    btn.style.opacity = "0.5";

    const card = btn.closest('.model-card')
    const raw = card.getAttribute('data-variants');
    const variants = raw ? JSON.parse(raw.replace(/,\s*]/, ']')) : [];
    const index = parseInt(card.getAttribute('data-current-index') || 0);
    const pathParts = variants[index].split('/');
    fileName = pathParts[pathParts.length - 1];

    try {
        const blob = await viewer.toBlob({ idealAspect: true });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.png`;
        a.click();
        
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to generate poster:", error);
    } finally {
        btn.style.opacity = "1";
    }
}

function initThumbnails() {
    const cards = document.querySelectorAll('.model-card');

    cards.forEach(card => {
        const viewer = card.querySelector('model-viewer');
        if (!viewer || !(viewer.classList.contains('portfolio-viewer') || viewer.classList.contains('menu-viewer'))) {
            return;
        }

        const raw = card.getAttribute('data-variants');
        if (!raw) return;

        const variants = JSON.parse(raw.replace(/,\s*]/, ']'));
        const thumbContainer = document.createElement('div');
        thumbContainer.className = 'variant-thumbnails';

        thumbContainer.onmouseenter = () => {
            const parentCard = thumbContainer.closest('.portfolio-link') || null;
            if (parentCard) parentCard.classList.add('parent-hover-effect');
        };
        
        thumbContainer.onmouseleave = () => {
            const parentCard = thumbContainer.closest('.portfolio-link') || null;
            if (parentCard) parentCard.classList.remove('parent-hover-effect');
        };

        variants.forEach((path, index) => {
            const img = document.createElement('img');
            img.src = path + ".png";
            img.className = 'thumb-item';
            if (index === 0) img.classList.add('active');

            img.onclick = (event) => {
                event.stopPropagation();
                event.preventDefault();

                viewer.src = path + ".glb";
                update_button_states(card, index, variants.length);
                updateActiveThumbnail(card, index);
                card.setAttribute('data-current-index', index);

                const counter = card.querySelector('.variant-counter');
                if (counter) counter.textContent = `${index + 1}/${variants.length}`;
            };
            thumbContainer.appendChild(img);
        });

        if (viewer.classList.contains('portfolio-viewer')) {
            viewer.before(thumbContainer);
        } else {
            viewer.after(thumbContainer);
        }

    });
}

function updateActiveThumbnail(card, activeIndex) {
    const thumbs = card.querySelectorAll('.thumb-item');
    thumbs.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === activeIndex);
    });
}

function change_variant(btn, direction) {
    const card = btn.closest('.model-card');
    const viewer = card.querySelector('model-viewer');
    const raw = card.getAttribute('data-variants');
    const variants = raw ? JSON.parse(raw.replace(/,\s*]/, ']')) : [];

    let index = parseInt(card.getAttribute('data-current-index'));
    const new_index = index + direction;
    
    if (new_index < 0 || new_index >= variants.length) return;

    card.setAttribute('data-current-index', new_index);
    viewer.src = variants[new_index] + ".glb";
    // viewer.cameraOrbit = viewer.dataset.cameraOrbit;
    // viewer.cameraTarget = viewer.dataset.cameraTarget;
    // viewer.fieldOfView = viewer.dataset.fieldOfView;
    // viewer.resetTurntableRotation(0)
    // viewer.jumpCameraToGoal();
    update_button_states(card, new_index, variants.length);
    updateActiveThumbnail(card, new_index);
}

function update_button_states(card, index, total) {
    const prev_btn = card.querySelector('.nav-button.left');
    const next_btn = card.querySelector('.nav-button.right');
    const counter = card.querySelector('.variant-counter');

    if (prev_btn) prev_btn.disabled = (index === 0);
    if (next_btn) next_btn.disabled = (index === total - 1);

    if (counter) {
        counter.innerText = `${index + 1}/${total}`;
    }
}

let back_to_top_btn = document.getElementById("backToTopBtn");

window.addEventListener('load', () => {
    document.querySelectorAll('.model-card').forEach(card => {
        back_to_top_btn.style.display = "none";
    });
});

window.onscroll = () => {
    const scroll_top = document.body.scrollTop || document.documentElement.scrollTop;
    if (scroll_top > 300) {
        back_to_top_btn.style.display = "flex";
    } else {
        back_to_top_btn.style.display = "none";
    }
};

function top_function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('load', () => {
    document.querySelectorAll('.model-card').forEach(card => {
        const viewer = card.querySelector('model-viewer');
        const raw = card.getAttribute('data-variants');
        const variants = raw ? JSON.parse(raw.replace(/,\s*]/, ']')) : [];

        if (viewer) viewer.src = variants[0] + ".glb";
        update_button_states(card, 0, variants.length);
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const shared_config = {
        quickLookBrowsers: "safari chrome",
        autoplay: false,
        reveal: "auto",
        loading: "lazy",
        autoRotateDelay: 300,
        rotationPerSecond: "3deg",
        interactionPrompt: "none",
        powerPreference: "low-power",
        modelCacheSize: 0,
        toneMapping: "aces",
    };

    document.querySelectorAll('model-viewer').forEach(viewer => {
        Object.assign(viewer, shared_config);
        
        if (!viewer.getAttribute('environment-image'))  viewer.environmentImage = "/resources/media/round_platform_1k.hdr";
        if (!viewer.getAttribute('exposure'))           viewer.setAttribute('exposure', '3');
        if (!viewer.getAttribute('shadow-intensity'))   viewer.setAttribute('shadow-intensity', '2.0');

        const { cameraOrbit, cameraTarget, fieldOfView } = viewer.dataset;

        viewer.cameraOrbit = cameraOrbit;
        viewer.cameraTarget = cameraTarget;
        viewer.fieldOfView = fieldOfView;
        viewer.minFieldOfView = fieldOfView;
        viewer.maxFieldOfView = fieldOfView;

        const parts = cameraOrbit.trim().split(/\s+/);
        const radiusStr = parts[2];
        const radiusValue = parseFloat(radiusStr); 
        const minRadius = radiusValue + 150;
        const maxRadius = radiusValue + 10;
        viewer.minCameraOrbit = `auto auto ${minRadius}%`;
        viewer.maxCameraOrbit = `auto auto ${maxRadius}%`;
    });
});

window.addEventListener('load', initThumbnails);

window.addEventListener('load', () => {
    const devViewer = document.getElementById('development-viewer');
    const logoViewer = document.getElementById('logo-viewer');
    const menuViewers = document.querySelectorAll('.menu-viewer');

    const getOrbitParts = (viewer) => {
        if (!viewer) return null;
        const parts = viewer.cameraOrbit.trim().split(/\s+/);
        return {
            theta: parseFloat(parts[0]),
            phi: parts[1],
            radius: parts[2],
            unit: parts[0].replace(/[0-9.-]/g, '')
        };
    };

    if (devViewer) {
        const devBase = getOrbitParts(devViewer);
        const logoBase = getOrbitParts(logoViewer);
        menuViewers.forEach(mv => { mv._baseOrbit = getOrbitParts(mv); });

        const amplitude = 15;
        const frequency = 0.0003; 
        const H = window.innerHeight;

        const swing = (time) => {
            const offset = amplitude * Math.sin(time * frequency);

            logoViewer.cameraOrbit = `${logoBase.theta + (3 * offset)}${logoBase.unit} ${logoBase.phi} ${logoBase.radius}`;

            const devRect               = devViewer.getBoundingClientRect();
            const devCardLowerBound     = devRect.top + (devRect.height * 0.5) < H;
            const devCardUpperBound     = devRect.bottom - (devRect.height * 0.5) >= 110;
            if (devCardLowerBound && devCardUpperBound) {
                devViewer.cameraOrbit = `${devBase.theta + offset}${devBase.unit} ${devBase.phi} ${devBase.radius}`;
            }

            menuViewers.forEach(mv => {
                const viewerRect            = mv.getBoundingClientRect();
                const viewerCardLowerBound  = viewerRect.top + (viewerRect.height * 0.5) < H;
                const viewerCardUpperBound  = viewerRect.bottom - (viewerRect.height * 0.5) >= 110;
                if (viewerCardLowerBound && viewerCardUpperBound) {
                    mv.cameraOrbit = `${mv._baseOrbit.theta + (2 * offset)}${mv._baseOrbit.unit} ${mv._baseOrbit.phi} ${mv._baseOrbit.radius}`;
                }
            });

            requestAnimationFrame(swing);
        };

        requestAnimationFrame(swing);
    }
});

function handleAutoRotate() {
    const isFullscreen = document.fullscreenElement !== null;
    const viewers = document.querySelectorAll('.portfolio-viewer');

    viewers.forEach(viewer => {
        const rect = viewer.getBoundingClientRect();

        const lowerBound = rect.top + (rect.height * 0.5) < window.innerHeight;
        const upperBound = rect.bottom - (rect.height * 0.5) >= 110;

        if ((lowerBound && upperBound) || isFullscreen) {
            if (!viewer.hasAttribute('camera-controls')) {viewer.setAttribute('camera-controls', '');}
            // if (!viewer.hasAttribute('auto-rotate')) {viewer.setAttribute('auto-rotate', '');}
        } else {
            if (viewer.hasAttribute('camera-controls')) {viewer.removeAttribute('camera-controls');}
            // if (viewer.hasAttribute('auto-rotate')) {viewer.removeAttribute('auto-rotate');}
        }
    });
}

let isScrolling;
window.addEventListener('scroll', () => {
    window.cancelAnimationFrame(isScrolling);
    isScrolling = window.requestAnimationFrame(handleAutoRotate);
}, { passive: true });

window.addEventListener('load', handleAutoRotate);
