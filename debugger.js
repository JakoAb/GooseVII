export function addDebugDot(mainContent, debugDots, x, y, cella) {
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

export function removeAllDebugDots(debugDots) {
    debugDots.forEach(dot => dot.el.remove());
    debugDots.length = 0;
}

export function removeDebugDot(debugDots, el) {
    const idx = debugDots.findIndex(d => d.el === el);
    if (idx !== -1) {
        debugDots[idx].el.remove();
        debugDots.splice(idx, 1);
    }
}

export async function importPoints(mainContent, debugDots, addDebugDot) {
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

export function exportPoints(debugDots) {
    const points = debugDots.map(d => ({cella: d.cella, x: Math.round(d.x), y: Math.round(d.y)}));
    const json = JSON.stringify(points, null, 2);
    console.log('Esporta punti:', json);
    alert(json);
}
