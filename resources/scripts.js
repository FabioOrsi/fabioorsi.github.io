function reset_view(element) {
    const viewer = element.closest('model-viewer');
    viewer.cameraOrbit = viewer.dataset.cameraOrbit;
    viewer.cameraTarget = viewer.dataset.cameraTarget;
    viewer.fieldOfView = viewer.dataset.fieldOfView;
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

function change_variant(btn, direction) {
    const card = btn.closest('.model-card');
    const viewer = card.querySelector('model-viewer');
    // const variants = JSON.parse(card.getAttribute('data-variants'));
    const raw = card.getAttribute('data-variants');
    const variants = raw ? JSON.parse(raw.replace(/,\s*]/, ']')) : [];

    let index = parseInt(card.getAttribute('data-current-index'));
    const new_index = index + direction;
    
    if (new_index < 0 || new_index >= variants.length) return;

    card.setAttribute('data-current-index', new_index);
    viewer.src = variants[new_index];
    viewer.cameraOrbit = viewer.dataset.cameraOrbit;
    viewer.cameraTarget = viewer.dataset.cameraTarget;
    viewer.fieldOfView = viewer.dataset.fieldOfView;
    viewer.jumpCameraToGoal();
    update_button_states(card, new_index, variants.length);
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

        if (viewer) viewer.src = variants[0];
        update_button_states(card, 0, variants.length);
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const shared_config = {
        quickLookBrowsers: "safari chrome",
        autoplay: false,
        reveal: "auto",
        loading: "lazy",
        powerPreference: "low-power",
        modelCacheSize: 0,
        toneMapping: "aces",
    };

    document.querySelectorAll('model-viewer').forEach(viewer => {
        Object.assign(viewer, shared_config);
        
        if (!viewer.getAttribute('environment-image'))  viewer.environmentImage = "/resources/media/round_platform_1k.hdr";
        if (!viewer.getAttribute('exposure'))           viewer.setAttribute('exposure', '3');
        if (!viewer.getAttribute('min-field-of-view'))  viewer.setAttribute('min-field-of-view', '10deg');
        if (!viewer.getAttribute('max-field-of-view'))  viewer.setAttribute('max-field-of-view', '22deg');
        if (!viewer.getAttribute('shadow-intensity'))   viewer.setAttribute('shadow-intensity', '2.0');

        const { cameraOrbit, cameraTarget, fieldOfView } = viewer.dataset;

        viewer.cameraOrbit = cameraOrbit;
        viewer.cameraTarget = cameraTarget;
        viewer.fieldOfView = fieldOfView;
        viewer.minFieldOfView = fieldOfView;

        const parts = cameraOrbit.trim().split(/\s+/);
        const radiusStr = parts[2];
        const radiusValue = parseFloat(radiusStr); 
        const minRadius = radiusValue + 80;
        const maxRadius = radiusValue + 5;
        const unit = radiusStr.replace(/[0-9.]/g, '');
        viewer.minCameraOrbit = `auto auto ${minRadius}${unit}`;
        viewer.maxCameraOrbit = `auto auto ${maxRadius}${unit}`;
    });
});

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

        const swing = (time) => {
            const offset = amplitude * Math.sin(time * frequency);
            
            devViewer.cameraOrbit = `${devBase.theta + offset}${devBase.unit} ${devBase.phi} ${devBase.radius}`;
            logoViewer.cameraOrbit = `${logoBase.theta + (3 * offset)}${logoBase.unit} ${logoBase.phi} ${logoBase.radius}`;
            menuViewers.forEach(mv => {
                mv.cameraOrbit = `${mv._baseOrbit.theta + (4 * offset)}${mv._baseOrbit.unit} ${mv._baseOrbit.phi} ${mv._baseOrbit.radius}`;
            });

            requestAnimationFrame(swing);
        };

        requestAnimationFrame(swing);
    }
});