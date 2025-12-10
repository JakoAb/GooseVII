let scale = 1;
let minScale = 1;
let maxScale = 4;
let startX = 0;
let startY = 0;
let originX = 0;
let originY = 0;
let isDragging = false;
let lastX = 0;
let lastY = 0;
let isZoomActive = false;
let isPointerMode = false;
const pointerBtn = document.getElementById('toggle-pointer');
const blurBtn = document.getElementById('toggle-blur');
const exportBtn = document.getElementById('export-points');
const importBtn = document.getElementById('import-points');
const mainContent = document.getElementById('main-content');
let debugDots = [];

const map = document.getElementById('map');

function setTransform() {
    map.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
}

function centerMap() {
    // Centra la mappa nel contenitore
    const containerRect = mainContent.getBoundingClientRect();
    const mapRect = map.getBoundingClientRect();
    // Calcola la posizione per centrare l'immagine
    originX = (containerRect.width - map.naturalWidth) / 2;
    originY = (containerRect.height - map.naturalHeight) / 2;
    setTransform();
}

map.addEventListener('load', function() {
    centerMap();
});

map.addEventListener('wheel', function(e) {
    if (!isZoomActive) return;
    e.preventDefault();
    const rect = map.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const prevScale = scale;
    if (e.deltaY < 0) {
        scale = Math.min(maxScale, scale + 0.1);
    } else {
        scale = Math.max(minScale, scale - 0.1);
    }
    // Zoom centrato sul punto del mouse
    originX -= (mouseX / prevScale - mouseX / scale);
    originY -= (mouseY / prevScale - mouseY / scale);
    setTransform();
    if (scale === 1) {
        centerMap();
    }
});

map.addEventListener('mousedown', function(e) {
    if (scale === 1) return;
    isDragging = true;
    map.classList.add('zooming');
    startX = e.clientX;
    startY = e.clientY;
    lastX = originX;
    lastY = originY;
});

document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    originX = lastX + (e.clientX - startX);
    originY = lastY + (e.clientY - startY);
    setTransform();
});

document.addEventListener('mouseup', function() {
    isDragging = false;
    map.classList.remove('zooming');
});

// Imposta la posizione iniziale
if (map.complete) {
    centerMap();
} else {
    map.addEventListener('load', centerMap);
}

function blurMain(isBlur) {
    if (isBlur) {
        mainContent.style.filter = 'blur(3px)';
    } else {
        mainContent.style.filter = 'none';
    }
}

blurBtn.addEventListener('click', () => {
    blurBtn.classList.toggle('active');
    blurMain(blurBtn.classList.contains('active'));
});

function addDebugDot(mainContent, debugDots, x, y, cella) {
    const dot = document.createElement('div');
    dot.className = 'debug-dot';
    dot.style.left = (x - 6) + 'px';
    dot.style.top = (y - 6) + 'px';
    dot.dataset.x = x;
    dot.dataset.y = y;
    dot.dataset.cella = cella;
    mainContent.appendChild(dot);
    debugDots.push({el: dot, x, y, cella});
}

function removeAllDebugDots(debugDots) {
    debugDots.forEach(dot => dot.el.remove());
    debugDots.length = 0;
}

function removeDebugDot(debugDots, el) {
    const idx = debugDots.findIndex(d => d.el === el);
    if (idx !== -1) {
        debugDots[idx].el.remove();
        debugDots.splice(idx, 1);
    }
}

async function importPoints(mainContent, debugDots) {
    try {
        const response = await fetch('database/celle.json');
        if (!response.ok) throw new Error('Impossibile leggere celle.json');
        const points = await response.json();
        removeAllDebugDots(debugDots);
        points.forEach((p, i) => {
            addDebugDot(mainContent, debugDots, p.x, p.y, p.cella ?? (i+1));
        });
        alert('Punti importati!');
    } catch (err) {
        alert('Errore importazione: ' + err.message);
    }
}

function exportPoints(debugDots) {
    const points = debugDots.map(d => ({cella: d.cella, x: Math.round(d.x), y: Math.round(d.y)}));
    const json = JSON.stringify(points, null, 2);
    console.log('Esporta punti:', json);
    alert(json);
}

// Sostituisco le chiamate agli import con le funzioni locali
pointerBtn.addEventListener('click', () => {
    isPointerMode = !isPointerMode;
    pointerBtn.classList.toggle('active', isPointerMode);
    mainContent.style.cursor = isPointerMode ? 'crosshair' : '';
    document.getElementById('export-points').style.display = isPointerMode ? 'inline-block' : 'none';
    document.getElementById('import-points').style.display = isPointerMode ? 'inline-block' : 'none';
    if (!isPointerMode) {
        removeAllDebugDots(debugDots);
    }
});

mainContent.addEventListener('click', function(e) {
    if (!isPointerMode || e.button !== 0) return;
    const rect = mainContent.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    console.log('Click su main-content:', x, y);
    addDebugDot(mainContent, debugDots, x, y, debugDots.length + 1);
});

mainContent.addEventListener('contextmenu', function(e) {
    if (!isPointerMode) return;
    if (e.target.classList.contains('debug-dot')) {
        e.preventDefault();
        removeDebugDot(debugDots, e.target);
    } else {
        e.preventDefault();
    }
});

importBtn.addEventListener('click', async function() {
    try {
            const response = await fetch('database/celle.json');
            if (!response.ok) throw new Error('Impossibile leggere celle.json');
            const points = await response.json();
            removeAllDebugDots(debugDots);
            points.forEach((p, i) => {
                addDebugDot(mainContent, debugDots, p.x, p.y, p.cella ?? (i+1));
            });
            alert('Punti importati!');
        } catch (err) {
            alert('Errore importazione: ' + err.message);
        }
});

exportBtn.addEventListener('click', function() {
    const points = debugDots.map(d => ({cella: d.cella, x: Math.round(d.x), y: Math.round(d.y)}));
        const json = JSON.stringify(points, null, 2);
        console.log('Esporta punti:', json);
        alert(json);
});