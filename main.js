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
const clearPointsBtn = document.getElementById('clear-points');
const questionsBtn = document.getElementById('questions-btn');
const exportBtn = document.getElementById('export-points');
const importBtn = document.getElementById('import-points');
const mainContent = document.getElementById('main-content');
let debugDots = [];
let questionsData = [];

const map = document.getElementById('map');
const importModal = document.getElementById('import-modal');
const jsonFileInput = document.getElementById('json-file-input');
const closeImportModalBtn = document.getElementById('close-import-modal');
const loadJsonPointsBtn = document.getElementById('load-json-points');
const importErrorDiv = document.getElementById('import-error');
const questionsModal = document.getElementById('questions-modal');
const closeQuestionsModalBtn = document.getElementById('close-questions-modal');
const exportAllBtn = document.getElementById('export-all-btn');

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
    dot.style.left = (x - 12) + 'px'; // centrato rispetto a 24px
    dot.style.top = (y - 12) + 'px';
    dot.dataset.x = x;
    dot.dataset.y = y;
    dot.dataset.cella = cella;
    dot.style.width = '24px';
    dot.style.height = '24px';
    dot.style.display = 'flex';
    dot.style.alignItems = 'center';
    dot.style.justifyContent = 'center';
    dot.style.fontWeight = 'bold';
    dot.style.fontSize = '1.1em';
    dot.style.color = '#222';
    dot.innerText = cella;
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

pointerBtn.addEventListener('click', () => {
    isPointerMode = !isPointerMode;
    pointerBtn.classList.toggle('active', isPointerMode);
    mainContent.style.cursor = isPointerMode ? 'crosshair' : '';
    // Nascondi/mostra i bottoni in base alla modalità
    clearPointsBtn.style.display = isPointerMode ? 'inline-block' : 'inline-block';
});

clearPointsBtn.addEventListener('click', function() {
    removeAllDebugDots(debugDots);
});

mainContent.addEventListener('click', function(e) {
    if (e.target.classList.contains('debug-dot')) {
        // Stampa in console il numero della cella
        console.log('Cella:', e.target.dataset.cella);
        return;
    }
    if (!isPointerMode || e.button !== 0) return;
    const rect = mainContent.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addDebugDot(mainContent, debugDots, x, y, debugDots.length + 1);
});

mainContent.addEventListener('contextmenu', function(e) {
    if (!isPointerMode) return;
    if (e.target.classList.contains('debug-dot')) {
        e.preventDefault();
        const x = e.target.dataset.x;
        const y = e.target.dataset.y;
        console.log(`Coordinate punto: x=${x}, y=${y}`);
    } else {
        e.preventDefault();
    }
});

importBtn.addEventListener('click', function() {
    importModal.style.display = 'flex';
    importErrorDiv.style.display = 'none';
    importErrorDiv.textContent = '';
    jsonFileInput.value = '';
});
closeImportModalBtn.addEventListener('click', function() {
    importModal.style.display = 'none';
    importErrorDiv.style.display = 'none';
    importErrorDiv.textContent = '';
    jsonFileInput.value = '';
});
loadJsonPointsBtn.addEventListener('click', function() {
    importErrorDiv.style.display = 'none';
    importErrorDiv.textContent = '';
    const file = jsonFileInput.files[0];
    if (!file) {
        importErrorDiv.textContent = 'Seleziona un file JSON.';
        importErrorDiv.style.display = 'block';
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const points = JSON.parse(e.target.result);
            if (!Array.isArray(points)) throw new Error('Il file JSON deve essere un array di punti.');
            removeAllDebugDots(debugDots);
            points.forEach((p, i) => {
                if (typeof p.x !== 'number' || typeof p.y !== 'number') throw new Error('Ogni punto deve avere x e y numerici.');
                addDebugDot(mainContent, debugDots, p.x, p.y, p.cella ?? (i+1));
            });
            importModal.style.display = 'none';
            // Messaggio di caricamento rimosso
        } catch (err) {
            importErrorDiv.textContent = 'Errore: ' + err.message;
            importErrorDiv.style.display = 'block';
        }
    };
    reader.onerror = function() {
        importErrorDiv.textContent = 'Errore lettura file.';
        importErrorDiv.style.display = 'block';
    };
    reader.readAsText(file);
});

questionsBtn.addEventListener('click', function() {
    // Sincronizza questionsData con i punti
    if (questionsData.length !== debugDots.length) {
        questionsData = debugDots.map((dot, i) => {
            return questionsData[i] || {
                cella: dot.cella,
                domanda: '',
                rispostaCorretta: '',
                risposta1: '',
                risposta2: '',
                collapsed: false // tutte aperte all'apertura
            };
        });
    } else {
        // Se già esiste, apri tutte le card
        questionsData.forEach(q => q.collapsed = false);
    }
    const container = document.getElementById('questions-cards-container');
    container.innerHTML = '';
    questionsData.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.style = 'border:1px solid #ccc; border-radius:8px; padding:12px; background:#fafafa; position:relative;';
        if (q.collapsed) {
            card.innerHTML = `<div style='display:flex; align-items:center; justify-content:space-between;'>
                <span><b>${q.cella}</b> | ${q.domanda}</span>
                <button type='button' data-idx='${idx}' class='open-card-btn'>Apri</button>
            </div>`;
        } else {
            card.innerHTML = `
                <button type='button' data-idx='${idx}' class='close-card-btn' style='position:absolute; top:8px; right:8px;'>Chiudi</button>
                <div style=\"margin-bottom:8px;\"><label>Numero cella: <input type=\"text\" value=\"${q.cella}\" readonly style=\"background:#eee; width:60px;\" /></label></div>
                <div style=\"margin-bottom:8px;\"><label>Dom: <input type=\"text\" value=\"${q.domanda}\" data-field=\"domanda\" data-idx=\"${idx}\" /></label></div>
                <div style=\"margin-bottom:8px;\"><label>Risp: <input type=\"text\" value=\"${q.rispostaCorretta}\" data-field=\"rispostaCorretta\" data-idx=\"${idx}\" class=\"input-risp\" /></label></div>
                <div style=\"margin-bottom:8px;\"><label>Err1: <input type=\"text\" value=\"${q.risposta1}\" data-field=\"risposta1\" data-idx=\"${idx}\" class=\"input-err\" /></label></div>
                <div style=\"margin-bottom:8px;\"><label>Err2: <input type=\"text\" value=\"${q.risposta2}\" data-field=\"risposta2\" data-idx=\"${idx}\" class=\"input-err\" /></label></div>
            `;
        }
        container.appendChild(card);
    });
    // Listener per aggiornare questionsData
    container.querySelectorAll('input[type="text"]').forEach(input => {
        if (input.hasAttribute('readonly')) return;
        input.addEventListener('input', function(e) {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            const field = e.target.getAttribute('data-field');
            questionsData[idx][field] = e.target.value;
        });
    });
    // Listener per chiudere/aprire card
    container.querySelectorAll('.close-card-btn').forEach(btn => {
        btn.onclick = function(e) {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            questionsData[idx].collapsed = true;
            questionsBtn.click();
        };
    });
    container.querySelectorAll('.open-card-btn').forEach(btn => {
        btn.onclick = function(e) {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            questionsData[idx].collapsed = false;
            questionsBtn.click();
        };
    });
    questionsModal.style.display = 'flex';
});
closeQuestionsModalBtn.addEventListener('click', function() {
    questionsModal.style.display = 'none';
});

exportBtn.addEventListener('click', function() {
    const points = debugDots.map(d => ({
        cella: d.cella,
        x: Math.round(d.x),
        y: Math.round(d.y)
    }));
    const json = JSON.stringify(points, null, 2);
    const blob = new Blob([json], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'celle.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
});

exportAllBtn.addEventListener('click', function() {
    // Costruisci la struttura richiesta
    const database = debugDots.map((d, idx) => {
        // Trova le domande associate a questa cella
        const q = questionsData[idx] || {};
        let domande = [];
        if (q.domanda && q.rispostaCorretta) {
            domande.push({
                domanda: q.domanda,
                rispostaCorretta: q.rispostaCorretta,
                altreRisposte: [q.risposta1 || '', q.risposta2 || '', '']
                    .filter(r => r !== '')
            });
        }
        // Se ci sono più domande, puoi estendere qui
        return {
            cella: d.cella,
            posizione: { x: Math.round(d.x), y: Math.round(d.y) },
            domande: domande
        };
    });
    // Genera il JS
    const js = 'let database = ' + JSON.stringify(database, null, 2) + ';';
    const blob = new Blob([js], {type: 'application/javascript'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-settings.js';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
});

window.addEventListener('DOMContentLoaded', function() {
        if (typeof cellePreload !== 'undefined' && Array.isArray(cellePreload) && cellePreload.length > 0) {
            importPreloadedCells(cellePreload);
        }
    });

function importPreloadedCells(cells) {
    removeAllDebugDots(debugDots);
    cells.forEach((p, i) => {
        if (typeof p.x !== 'number' || typeof p.y !== 'number') throw new Error('Ogni punto deve avere x e y numerici.');
        addDebugDot(mainContent, debugDots, p.x, p.y, p.cella ?? (i+1));
    });
}