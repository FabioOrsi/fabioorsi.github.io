function reset_camera(viewer_id, orbit, target, fov) {
    const viewer = document.getElementById(viewer_id);
    if (viewer) {
      viewer.cameraOrbit = orbit;
      viewer.cameraTarget = target;
      viewer.fieldOfView = fov;
    }
}

function toggle_fullscreen(id, btn) {
    const viewer = document.getElementById(id);
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
    const variants = JSON.parse(card.getAttribute('data-variants'));
    let index = parseInt(card.getAttribute('data-current-index'));
    const new_index = index + direction;
    
    if (new_index < 0 || new_index >= variants.length) return;

    card.setAttribute('data-current-index', new_index);
    viewer.src = variants[new_index];
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

// window.addEventListener('load', () => {
//     document.querySelectorAll('.model-card').forEach(card => {
//         back_to_top_btn.style.display = "none";
//         const variants_attr = card.getAttribute('data-variants');
//         if (variants_attr) {
//             const variants = JSON.parse(variants_attr);
//             if (variants.length > 0) update_button_states(card, 0, variants.length);
//         }
//     });
// });

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
        if (back_to_top_btn) back_to_top_btn.style.display = "none";

        const variants_attr = card.getAttribute('data-variants');
        if (variants_attr) {
            const variants = JSON.parse(variants_attr);
            const viewer = card.querySelector('model-viewer');
            
            if (variants.length > 0) {
                if (viewer) viewer.src = variants[0];
                update_button_states(card, 0, variants.length);
            }
        }
    });
});


window.addEventListener('DOMContentLoaded', () => {
    const shared_config = {
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
        Object.assign(viewer, shared_config);
        
        if (!viewer.getAttribute('environment-image')) {
            viewer.environmentImage = "/resources/media/round_platform_1k.hdr";
        }
        if (!viewer.getAttribute('exposure')) {
            viewer.setAttribute('exposure', '3');
        }
        viewer.setAttribute('shadow-intensity', '2.0');
    });
});