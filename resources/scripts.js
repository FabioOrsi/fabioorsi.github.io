function reset_view(element) {
    const viewer = element.closest('model-viewer');

    if (viewer.classList.contains('development-viewer')) viewer.removeAttribute('camera-controls');

    viewer.cameraOrbit = viewer.dataset.cameraOrbit;
    viewer.cameraTarget = viewer.dataset.cameraTarget;
    viewer.fieldOfView = viewer.dataset.fieldOfView;

    viewer.resetTurntableRotation(0)

    viewer.dataset.toggleAutoRotate = 'true';
    if (viewer.classList.contains('portfolio-viewer')) viewer.setAttribute('auto-rotate', '');

    const autoRotateButton = viewer.querySelector('.auto-rotate-button');
    if (!autoRotateButton.classList.contains('active')) autoRotateButton.classList.add('active');
}

async function toggleFullscreen(button) {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    const viewer = button.closest('model-viewer');

    if (!document.fullscreenElement) {
        viewer.disableZoom = false;
        viewer.requestFullscreen?.() || viewer.webkitRequestFullscreen?.();
    } else {
        viewer.disableZoom = true;
        await document.exitFullscreen?.();
    }
    await delay(1000);
    handleAutoRotate();
}

async function savePoster(button) {
    const galleryTitle  = document.querySelector('.gallery-title').textContent.replace(/\s+/g, '');

    const viewer        = button.closest('model-viewer');
    const card          = button.closest('.model-card');
    const cardTitle     = card.querySelector('.card-title').textContent.replace(/\s+/g, ''); 
    const index         = parseInt(viewer.getAttribute('data-current-index') || 0);

    const blob = await viewer.toBlob({ idealAspect: false });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `Fabio_Orsi_Portfolio_${galleryTitle}_${cardTitle}_0${index + 1}.png`;
    a.click();
    
    URL.revokeObjectURL(url);

}

function initThumbnails() {
    const cards = document.querySelectorAll('.model-card');

    cards.forEach(card => {
        const viewer = card.querySelector('model-viewer');
        if (!viewer || !(viewer.classList.contains('portfolio-viewer') || viewer.classList.contains('menu-viewer'))) {
            return;
        }

        const raw = viewer.getAttribute('data-variants');
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
                viewer.setAttribute('data-current-index', index);

                const counter = card.querySelector('.variant-counter');
                if (counter) counter.textContent = `${index + 1}/${variants.length}`;
            };
            thumbContainer.appendChild(img);
        });
        viewer.after(thumbContainer);
    });
}

function updateActiveThumbnail(card, activeIndex) {
    const thumbs = card.querySelectorAll('.thumb-item');
    thumbs.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === activeIndex);
    });
}

function change_variant(button, direction) {
    const card = button.closest('.model-card');
    const viewer = card.querySelector('model-viewer');
    const raw = viewer.getAttribute('data-variants');
    const variants = raw ? JSON.parse(raw.replace(/,\s*]/, ']')) : [];

    let index = parseInt(viewer.getAttribute('data-current-index'));
    const new_index = index + direction;
    
    if (new_index < 0 || new_index >= variants.length) return;

    viewer.setAttribute('data-current-index', new_index);
    viewer.src = variants[new_index] + ".glb";
    update_button_states(card, new_index, variants.length);
    updateActiveThumbnail(card, new_index);
}

function update_button_states(card, index, total) {
    const prev_button = card.querySelector('.nav-button.left');
    const next_button = card.querySelector('.nav-button.right');
    const counter = card.querySelector('.variant-counter');

    if (prev_button) prev_button.disabled = (index === 0);
    if (next_button) next_button.disabled = (index === total - 1);

    if (counter) {
        counter.innerText = `${index + 1}/${total}`;
    }
}

let topButton = document.getElementById("top-button");

window.addEventListener('load', () => {
    document.querySelectorAll('.model-card').forEach(card => {
        topButton.style.display = "none";
    });
});

window.onscroll = () => {
    const scroll_top = document.body.scrollTop || document.documentElement.scrollTop;
    if (scroll_top > 300) {
        topButton.style.display = "flex";
    } else {
        topButton.style.display = "none";
    }
};

function go_to_top() {
    console.log("Scrolling to top...");
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('load', () => {
    document.querySelectorAll('.model-card').forEach(card => {
        const viewer = card.querySelector('model-viewer') || null;
        if (!viewer) return;
        
        const raw = viewer.getAttribute('data-variants');
        const variants = raw ? JSON.parse(raw.replace(/,\s*]/, ']')) : [];

        viewer.src = variants[0] + ".glb";
        update_button_states(card, 0, variants.length);
    });
});

function adjust_zoom(button, direction) {
    const viewer = button.closest('model-viewer');
    
    const dataCameraOrbit = viewer.getAttribute('data-camera-orbit').trim().split(/\s+/);
    const maxRadius = parseFloat(dataCameraOrbit[2]) + 20;
    const minRadius = parseFloat(dataCameraOrbit[2]) - 20;

    const defaultCameraOrbit = viewer.cameraOrbit.trim().split(/\s+/);
    let newRadius = parseFloat(defaultCameraOrbit[2]) + (direction * 10);
    newRadius = Math.min(Math.max(newRadius, minRadius), maxRadius);
    
    const currentCameraOrbit = viewer.getCameraOrbit().toString().trim().split(/\s+/);
    const unit = defaultCameraOrbit[2].replace(/[0-9.]/g, '') || '%';
    viewer.cameraOrbit = `${currentCameraOrbit[0]} ${currentCameraOrbit[1]} ${newRadius}${unit}`;
}

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
        disableZoom: true,
    };

    const isMobile = window.matchMedia("(pointer: coarse)").matches;

    document.querySelectorAll('model-viewer').forEach(viewer => {
        Object.assign(viewer, shared_config);

        if (isMobile) {
            console.log("Applying mobile optimizations...");
            const effectComposer = viewer.querySelector('effect-composer');
            if (effectComposer) {
                viewer.removeChild(effectComposer);
                viewer.msaa = 4;
            }
        }

        if (!viewer.getAttribute('environment-image'))  viewer.environmentImage = "/resources/media/hdri/round_platform_1k.hdr";
        if (!viewer.getAttribute('exposure'))           viewer.setAttribute('exposure', '3');
        if (!viewer.getAttribute('shadow-intensity'))   viewer.setAttribute('shadow-intensity', '2.0');

        const { cameraOrbit, cameraTarget, fieldOfView } = viewer.dataset;

        viewer.cameraOrbit = cameraOrbit;
        viewer.cameraTarget = cameraTarget;
        viewer.fieldOfView = fieldOfView;
        viewer.minFieldOfView = fieldOfView;
        viewer.maxFieldOfView = fieldOfView;

        viewer._baseOrbit = cameraOrbit;

        const parts = cameraOrbit.trim().split(/\s+/);
        const radiusStr = parts[2];
        const radiusValue = parseFloat(radiusStr); 
        const minRadius = radiusValue + 160;
        const maxRadius = radiusValue + 20;
        if (viewer.classList.contains('portfolio-viewer') || viewer.classList.contains('development-viewer')) {
            viewer.minCameraOrbit = `auto auto ${minRadius}%`;
            viewer.maxCameraOrbit = `auto auto ${maxRadius}%`;

            viewer.setAttribute("data-toggle-auto-rotate", "true");

            const navControls = document.createElement('div');
            navControls.className = 'viewer-nav-controls';
            navControls.innerHTML = `
                <button class="nav-button left" onclick="change_variant(this, -1)">&#10094;</button>
                <span class="variant-counter">1/1</span>
                <button class="nav-button right" onclick="change_variant(this, 1)">&#10095;</button>
            `;

            const deadzoneTop           = document.createElement('div');
            const deadzoneBottom        = document.createElement('div');
            const deadzoneLeft          = document.createElement('div');
            const deadzoneRight         = document.createElement('div');
            deadzoneTop.className       = 'viewer-deadzone';
            deadzoneBottom.className    = 'viewer-deadzone';
            deadzoneLeft.className      = 'viewer-deadzone';
            deadzoneRight.className     = 'viewer-deadzone';
            deadzoneTop.classList.add('deadzone-top');
            deadzoneBottom.classList.add('deadzone-bottom');
            deadzoneLeft.classList.add('deadzone-left');
            deadzoneRight.classList.add('deadzone-right');

            const zoomInButton          = document.createElement('button');
            zoomInButton.className      = 'zoom-button-in';
            zoomInButton.title          = ' Zoom In ';
            zoomInButton.innerHTML      = '<div class="icon-viewer-zoom-in"></div>';
            zoomInButton.setAttribute('onclick', 'adjust_zoom(this, -1)');

            const zoomOutButton         = document.createElement('button');
            zoomOutButton.className     = 'zoom-button-out';
            zoomOutButton.title         = ' Zoom Out ';
            zoomOutButton.innerHTML     = '<div class="icon-viewer-zoom-out"></div>';
            zoomOutButton.setAttribute('onclick', 'adjust_zoom(this, 1)');

            const zoomControls          = document.createElement('div');
            zoomControls.className      = 'zoom-controls';
            zoomControls.appendChild(zoomInButton);
            zoomControls.appendChild(zoomOutButton);
            zoomControls.classList.add('bottom-right');

            const fullscreenbutton      = document.createElement('button');
            fullscreenbutton.className  = 'fullscreen-button';
            fullscreenbutton.title      = ' Fullscreen ';
            fullscreenbutton.innerHTML  = '<div class="icon-viewer-fullscreen-in"></div>';
            fullscreenbutton.classList.add('top-right');
            fullscreenbutton.setAttribute('onclick', 'toggleFullscreen(this)');

            const resetbutton = document.createElement('button');
            resetbutton.className = 'reset-button';
            resetbutton.title = ' Reset View ';
            resetbutton.innerHTML = '<div class="icon-viewer-home"></div>';
            resetbutton.style.visibility = "hidden";
            resetbutton.classList.add('top-left');
            resetbutton.setAttribute('onclick', 'reset_view(this)');

            const sidebarContainer = document.createElement('div');
            sidebarContainer.className = 'sidebar-container';
            sidebarContainer.classList.add('open');
            sidebarContainer.classList.add('top-left');
            sidebarContainer.innerHTML = `
                <div class="sidebar-content">
                    <button class="auto-rotate-button active" onclick="toggleAutoRotate(this)"> Auto Rotate </button>
                    <div class="align-view-list">
                        <div style="padding-bottom: 5px; font-size: 0.7rem;"> Align View : </div>
                        <button class="align-view-button" onclick="reset_view(this)" style="margin-bottom: 10px;"> DEFAULT </button>
                        <button class="align-view-button" onclick="setView('Top', this)"> TOP </button>
                        <button class="align-view-button" onclick="setView('Bottom', this)"> BOTTOM </button>
                        <button class="align-view-button" onclick="setView('Left', this)"> LEFT </button>
                        <button class="align-view-button" onclick="setView('Right', this)"> RIGHT </button>
                        <button class="align-view-button" onclick="setView('Front', this)"> FRONT </button>
                        <button class="align-view-button" onclick="setView('Back', this)"> BACK </button>
                    </div>
                </div>`;
            viewer.appendChild(sidebarContainer);

            const svgNS = "http://www.w3.org/2000/svg";

            const photoButton          = document.createElement('button');
            photoButton.className      = 'photo-button';
            // photoButton.title          = ' Save Image ';
            photoButton.setAttribute('onclick', 'savePoster(this)');
            photoButton.setAttribute('onmouseenter', 'showBoundingBox(this)');
            photoButton.setAttribute('onmouseleave', 'hideBoundingBox(this)');

            const photoIconCircle = document.createElementNS(svgNS,`circle`);
            photoIconCircle.setAttribute('cx', '12');
            photoIconCircle.setAttribute('cy', '13');
            photoIconCircle.setAttribute('r', '4');

            const photoIconPath = document.createElementNS(svgNS,`path`);
            photoIconPath.setAttribute('d', 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z');

            const photoIcon = document.createElementNS(svgNS,`svg`);
            photoIcon.setAttribute('viewBox', '0 0 24 24');
            photoIcon.setAttribute('width', 'calc(24 * var(--px))');
            photoIcon.setAttribute('height', 'calc(24 * var(--px))');
            photoIcon.setAttribute('stroke', 'currentColor');
            photoIcon.setAttribute('opacity', '0.55');
            photoIcon.setAttribute('stroke-width', '2');
            photoIcon.setAttribute('fill', 'none');

            photoIcon.appendChild(photoIconCircle);
            photoIcon.appendChild(photoIconPath);

            photoButton.appendChild(photoIcon);
            photoButton.classList.add('bottom-left');

            const posterBoundingBox = document.createElement('div');
            posterBoundingBox.className = 'poster-bounding-box';
            viewer.appendChild(posterBoundingBox);

            viewer.appendChild(deadzoneTop);
            viewer.appendChild(deadzoneBottom);
            viewer.appendChild(deadzoneLeft);
            viewer.appendChild(deadzoneRight);
            viewer.appendChild(fullscreenbutton);
            viewer.appendChild(zoomControls);

            // if (viewer.classList.contains('portfolio-viewer')) {
                viewer.appendChild(navControls);
                viewer.appendChild(resetbutton);
                viewer.appendChild(photoButton);
            // }

        }
    });

    const currentPath = window.location.pathname;
    const dropdownLinks = document.querySelectorAll('.menu-content a');

    dropdownLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath === linkPath || (linkPath !== '/' && currentPath.startsWith(linkPath))) link.classList.add('active');
    });
});

window.addEventListener('load', initThumbnails);

window.addEventListener('load', () => {
    const devViewers = document.querySelectorAll('.menu-viewer-development');
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

    if (devViewers) {
        const logoBase = getOrbitParts(logoViewer);
        menuViewers.forEach(menuViewer => { menuViewer._baseOrbit = getOrbitParts(menuViewer); });
        devViewers.forEach(devViewer => { devViewer._baseOrbit = getOrbitParts(devViewer); });

        const amplitude = 15;
        const frequency = 0.0003; 

        const swing = (time) => {
            const offset = amplitude * Math.sin(time * frequency);

            if (logoViewer) {
                logoViewer.cameraOrbit = `${logoBase.theta + (3 * offset)}${logoBase.unit} ${logoBase.phi} ${logoBase.radius}`;
            }

            devViewers.forEach(devViewer => {
                if (devViewer.dataset.toggleAutoRotate === 'false') return;

                const currentCameraOrbit    = devViewer.cameraOrbit.trim().split(/\s+/);

                const devCard               = devViewer.closest('.model-card');
                const devRect               = devCard.getBoundingClientRect();
                const devCardLowerBound     = devRect.top < window.innerHeight / 1;
                const devCardUpperBound     = devRect.bottom >= window.innerHeight / 2;
                if ((devCardLowerBound && devCardUpperBound) || devViewer.classList.contains('always-on')) {
                    devViewer.cameraOrbit = `${devViewer._baseOrbit.theta + offset}${devViewer._baseOrbit.unit} ${devViewer._baseOrbit.phi} ${currentCameraOrbit[2]}`;
                    if (!devViewer.classList.contains('reveal-viewer')) devViewer.classList.add('reveal-viewer');
                } else {
                    if (devViewer.classList.contains('reveal-viewer')) devViewer.classList.remove('reveal-viewer');
                }
            });

            menuViewers.forEach(menuViewer => {
                const viewerCard            = menuViewer.closest('.model-card');
                const variantThumbnails     = viewerCard.querySelector('.variant-thumbnails') || null; 
                const viewerRect            = viewerCard.getBoundingClientRect(); 
                const viewerCardLowerBound  = viewerRect.top < window.innerHeight / 2;
                const viewerCardUpperBound  = viewerRect.bottom >= window.innerHeight / 2;
                if (viewerCardLowerBound && viewerCardUpperBound) {
                    menuViewer.cameraOrbit = `${menuViewer._baseOrbit.theta + (2 * offset)}${menuViewer._baseOrbit.unit} ${menuViewer._baseOrbit.phi} ${menuViewer._baseOrbit.radius}`;
                    if (variantThumbnails) variantThumbnails.style.opacity = "1";
                    menuViewer.classList.add('reveal-viewer');
                } else {
                    if (variantThumbnails) variantThumbnails.style.opacity = "0.2";
                    menuViewer.classList.remove('reveal-viewer');
                }
            });
            requestAnimationFrame(swing);
        };
        requestAnimationFrame(swing);
    }
});

function toggleSidebar(button) {
    const container = button.closest('.sidebar-container');
    container.classList.toggle('open');
    const arrow = container.querySelector('.sidebar-arrow');
    arrow.innerHTML = container.classList.contains('open') ? '&#10094;' : '&#10095;';
}

function setView (view, button) {
    const viewer = button.closest('model-viewer');
    viewer.dataset.toggleAutoRotate = 'false';
    viewer.removeAttribute('auto-rotate');
    if (!viewer.hasAttribute('camera-controls')) {viewer.setAttribute('camera-controls', '');}

    const autoRotateButton = viewer.querySelector('.auto-rotate-button');
    if (autoRotateButton.classList.contains('active')) autoRotateButton.classList.remove('active');

    switch(view) {
        case 'Top':
            viewer.cameraOrbit = "0deg 0deg 100%"; break;
        case 'Bottom':
            viewer.cameraOrbit = "0deg 180deg 100%"; break;
        case 'Left':
            viewer.cameraOrbit = "-90deg 85deg 100%"; break;
        case 'Right':
            viewer.cameraOrbit = "90deg 85deg 100%"; break;
        case 'Front':
            viewer.cameraOrbit = "0deg 85deg 100%"; break;
        case 'Back':
            viewer.cameraOrbit = "180deg 85deg 100%"; break;
        default:
            viewer.cameraOrbit = viewer.dataset.cameraOrbit; break;
    }
    viewer.cameraTarget = viewer.dataset.cameraTarget;
    viewer.fieldOfView = viewer.dataset.fieldOfView;
    viewer.resetTurntableRotation(0)
}

function showBoundingBox(button) {
    const posterBoundingBox = button.closest('model-viewer').querySelector('.poster-bounding-box');
    posterBoundingBox.style.visibility = "visible";
    posterBoundingBox.style.border = "1px dashed rgba(127, 127, 127, 0.3)";
}

function hideBoundingBox(button) {
    const posterBoundingBox = button.closest('model-viewer').querySelector('.poster-bounding-box');
    posterBoundingBox.style.visibility = "hidden";
    posterBoundingBox.style.border = "1px dashed rgba(127, 127, 127, 0.0)";
}

function toggleAutoRotate(button) {
    const viewer = button.closest('model-viewer');
    if (!button.classList.contains('active')) {
        button.classList.add('active');
        viewer.dataset.toggleAutoRotate = 'true';
        if (viewer.classList.contains('portfolio-viewer')) viewer.setAttribute('auto-rotate', '');
        if (viewer.classList.contains('development-viewer')) reset_view(button);
    } else {
        button.classList.remove('active');
        viewer.dataset.toggleAutoRotate = 'false';
        if (viewer.classList.contains('portfolio-viewer')) viewer.removeAttribute('auto-rotate');
        if (viewer.classList.contains('development-viewer')) viewer.setAttribute('camera-controls', '');
    }
}

function handleAutoRotate() {
    const isFullscreen = document.fullscreenElement !== null;
    const viewers = document.querySelectorAll('.portfolio-viewer');

    viewers.forEach(viewer => {
        const card = viewer.closest('.model-card');
        const rect = card.getBoundingClientRect();
        const lowerBound = rect.top < window.innerHeight / 2;
        const upperBound = rect.bottom >= window.innerHeight / 2;

        const variantThumbnails = card.querySelector('.variant-thumbnails') || null; 
        const cardTitle = card.querySelector('.card-title') || null; 

        if ((lowerBound && upperBound) || isFullscreen) {
            if (viewer.dataset.toggleAutoRotate == 'true' && !viewer.hasAttribute('auto-rotate')) viewer.setAttribute('auto-rotate', '');
            if (!viewer.hasAttribute('camera-controls')) {viewer.setAttribute('camera-controls', '');}
            if (variantThumbnails) variantThumbnails.style.opacity = "1";
            if (cardTitle) cardTitle.style.color = "#ccc";
            if (!viewer.classList.contains('reveal-viewer')) viewer.classList.add('reveal-viewer');
        } else {
            if (viewer.hasAttribute('camera-controls')) {viewer.removeAttribute('camera-controls');}
            if (viewer.hasAttribute('auto-rotate')) {viewer.removeAttribute('auto-rotate');}
            if (variantThumbnails) variantThumbnails.style.opacity = "0.2";
            if (cardTitle) cardTitle.style.color = "#333";
            if (viewer.classList.contains('reveal-viewer')) viewer.classList.remove('reveal-viewer');
        }
    });
}

let isScrolling;
window.addEventListener('scroll', () => {
    window.cancelAnimationFrame(isScrolling);
    isScrolling = window.requestAnimationFrame(handleAutoRotate);
}, { passive: true });

window.addEventListener('load', handleAutoRotate);

document.querySelectorAll('.tooltip-trigger').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.tooltip-trigger').forEach(el => el.classList.remove('active'));
        if (!isActive) item.classList.add('active');
    });
});

window.addEventListener('click', () => {
    document.querySelectorAll('.tooltip-trigger').forEach(el => el.classList.remove('active'));
});

document.addEventListener('DOMContentLoaded', () => {
    const emailElement = document.querySelector('.footer-contact') || null;
    if (!emailElement) return;

    emailElement.addEventListener('click', () => {
        const email = emailElement.innerText.trim();
        
        navigator.clipboard.writeText(email).then(() => {
            const originalText = emailElement.innerText;
            emailElement.innerText = "Copied!";
            emailElement.style.color = "#00d1ff";
            
            setTimeout(() => {
                emailElement.innerText = originalText;
                emailElement.style.color = "";
            }, 1500);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });
});

const modelViewerAnimated = document.getElementById("video-viewer") || null;

if (modelViewerAnimated) {
    modelViewerAnimated.addEventListener("load", async () => {
        videoTexture = modelViewerAnimated.createVideoTexture("/development/XR.mp4");
        const material      = modelViewerAnimated.model.materials.find(m => m.name === "XR Video Material");
        const { baseColorTexture } = material.pbrMetallicRoughness;
        baseColorTexture.setTexture(videoTexture);
    });

    modelViewerAnimated.addEventListener("load", async () => {
        videoTexture = modelViewerAnimated.createVideoTexture("/development/XR.mp4");
        const material      = modelViewerAnimated.model.materials.find(m => m.name === "XR Video Material Alpha");
        const { baseColorTexture } = material.pbrMetallicRoughness;
        baseColorTexture.setTexture(videoTexture);
    });
}


