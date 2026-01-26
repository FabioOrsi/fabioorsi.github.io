function resetCamera(viewerId, orbit, target, fov) {
    const viewer = document.getElementById(viewerId);
    if (viewer) {
      viewer.cameraOrbit = orbit;
      viewer.cameraTarget = target;
      viewer.fieldOfView = fov;
    }
}

function toggleFullscreen(id, btn) {
    const viewer = document.getElementById(id);
    const iconPath = btn.querySelector('path');
    if (!document.fullscreenElement) {
      viewer.requestFullscreen?.() || viewer.webkitRequestFullscreen?.();
      iconPath.setAttribute('d', 'M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7');
    } else {
      document.exitFullscreen?.();
      iconPath.setAttribute('d', 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7');
    }
}

function changeVariant(btn, direction) {
    const card = btn.closest('.model-card');
    const viewer = card.querySelector('model-viewer');
    const variants = JSON.parse(card.getAttribute('data-variants'));
    let index = parseInt(card.getAttribute('data-current-index'));
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= variants.length) return;

    card.setAttribute('data-current-index', newIndex);
    viewer.src = variants[newIndex];
    updateButtonStates(card, newIndex, variants.length);
}

function updateButtonStates(card, index, total) {
    const prevBtn = card.querySelector('.nav-button.left');
    const nextBtn = card.querySelector('.nav-button.right');
    if (prevBtn) prevBtn.disabled = (index === 0);
    if (nextBtn) nextBtn.disabled = (index === total - 1);
}

let backToTopBtn = document.getElementById("backToTopBtn");

window.addEventListener('load', () => {
    document.querySelectorAll('.model-card').forEach(card => {
        backToTopBtn.style.display = "none";
        const variantsAttr = card.getAttribute('data-variants');
        if (variantsAttr) {
            const variants = JSON.parse(variantsAttr);
            if (variants.length > 0) updateButtonStates(card, 0, variants.length);
        }
    });
});

window.onscroll = () => {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        backToTopBtn.style.display = "flex";
    } else {
        backToTopBtn.style.display = "none";
    }
};

function topFunction() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateButtonStates(card, index, total) {
    const prevBtn = card.querySelector('.nav-button.left');
    const nextBtn = card.querySelector('.nav-button.right');
    const counter = card.querySelector('.variant-counter');

    if (prevBtn) prevBtn.disabled = (index === 0);
    if (nextBtn) nextBtn.disabled = (index === total - 1);

    if (counter) {
        counter.innerText = `${index + 1}/${total}`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const sharedConfig = {
        quickLookBrowsers: "safari chrome",
        ar: true,
        cameraControls: true,

        autoplay: false,
        reveal: "auto",
        loading: "lazy",
        powerPreference: "low-power",
        modelCacheSize: 0,

        toneMapping: "aces",
        minFieldOfView: "10deg",
        maxFieldOfView: "22deg"
    };

    document.querySelectorAll('model-viewer').forEach(viewer => {
        Object.assign(viewer, sharedConfig);
        if (!viewer.getAttribute('environment-image')) {
            viewer.environmentImage = "/resources/media/round_platform_1k.hdr";
        }
        if (!viewer.getAttribute('exposure')) {
            viewer.setAttribute('exposure', '3');
        }
        viewer.setAttribute('shadow-intensity', '2.0');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const viewer = entry.target;
            if (entry.isIntersecting) {
                // Restore the source when it enters the screen
                if (viewer.dataset.src) viewer.src = viewer.dataset.src;
            } else {
                // Remove the source when it leaves the screen to free GPU RAM
                if (viewer.src) {
                    viewer.dataset.src = viewer.src;
                    viewer.src = ""; 
                }
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('model-viewer').forEach(viewer => observer.observe(viewer));
});