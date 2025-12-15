// === CONFIGURAZIONE TEMPI DI ATTESA E ANIMAZIONI ===
// Durata animazione movimento pedina (ms)
const DURATA_ANIMAZIONE_MOVIMENTO = 500;
// Attesa dopo movimento prima di check cell (ms)
const ATTESA_POST_MOVIMENTO = 200;
// Attesa dopo check cell senza domande (ms)
const ATTESA_POST_CHECK_CELL = 200;
// Attesa dopo risposta bonus step (ms)
const ATTESA_POST_BONUS_STEP = 200;
// Attesa dopo end turn (ms)
const ATTESA_POST_END_TURN = 200;
// Attesa tra step MOVE e CHECK_CELL (ms)
const ATTESA_MOVE_TO_CHECK_CELL = 200;
// Attesa tra click risposta e bonus step (ms)
const ATTESA_RISPOSTA_TO_BONUS_STEP = 200;
// Attesa tra bonus step e end turn (ms)
const ATTESA_BONUS_TO_END_TURN = 200;
// Durata animazione dado (ms)
const DURATA_ANIMAZIONE_DADO = 800;
// Attesa dopo estrazione dado prima di chiudere box (ms)
const ATTESA_POST_DADO = 500;
// Durata countdown inizio partita (s)
const DURATA_COUNTDOWN_START = 3;

const stepGameStateBtn = document.getElementById("step-game-state-btn");
var stepAnimationInProgress = false;
var diceFaces = 6;
var lastDiceRoll = 0;
var lastBonusSteps = 0;

stepGameStateBtn.addEventListener("click", () => {
    if(currentGameTurn == 0){
        startGame();
    }else{
        newStep();
    }

});

function newStep(){
    updateStepIndicator();
    advanceGameState();
    resolveGameStateStep(getCurrentPlayer(), getCurrentTurnState());
}

function resolveGameStateStep(playerId, state){
    switch (state){
        case 'START_TURN_THROW':
            resolveStartTurn(playerId);
            break;
        case 'THROW':
            resolveThrow(playerId);
            break;
        case 'MOVE':
            resolveMove(playerId,lastDiceRoll);
            break;
        case 'CHECK_CELL':
            resolveCheckCell(playerId);
            break;
        case 'BONUS_STEP':
            resolveBonusStep(playerId,lastBonusSteps);
            break;
        case 'END_TURN':
            resolveEndTurn(playerId);
            break;
        default:
            console.log("Stato non gestito: "+state);
            break;
    }
}

function resolveStartTurn(playerId) {
    // Mostra un box colorato con il nome del giocatore e il dado
    let box = document.getElementById('turno-giocatore-box');
    if (!box) {
        box = document.createElement('div');
        box.id = 'turno-giocatore-box';
        box.className = 'turno-giocatore-box';
        box.style.position = 'fixed';
        box.style.top = '50%';
        box.style.left = '50%';
        box.style.transform = 'translate(-50%, -50%)';
        box.style.zIndex = '11000';
        box.style.padding = '32px 64px';
        box.style.fontSize = '2.2em';
        box.style.fontWeight = 'bold';
        box.style.borderRadius = '18px';
        box.style.color = '#fff';
        box.style.textAlign = 'center';
        box.style.cursor = 'pointer';
        box.style.display = 'flex';
        box.style.flexDirection = 'column';
        box.style.alignItems = 'center';
        document.body.appendChild(box);
    }
    box.className = 'turno-giocatore-box';
    let color = getCurrentPlayerColor();
    box.style.background = color;
    // Calcola una versione scurita del colore per la shadow
    function darkenColor(inputColor, percent) {
        // Supporta hex, rgb, hsl
        if(inputColor.startsWith('#')) {
            let c = inputColor.replace('#', '');
            if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
            let num = parseInt(c, 16);
            let r = Math.max(0, (num >> 16) - 255 * percent);
            let g = Math.max(0, ((num >> 8) & 0x00FF) - 255 * percent);
            let b = Math.max(0, (num & 0x0000FF) - 255 * percent);
            return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
        } else if(inputColor.startsWith('rgb')) {
            // rgb(a) string
            let rgb = inputColor.match(/\d+/g).map(Number);
            let r = Math.max(0, rgb[0] - 255 * percent);
            let g = Math.max(0, rgb[1] - 255 * percent);
            let b = Math.max(0, rgb[2] - 255 * percent);
            return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
        } else if(inputColor.startsWith('hsl')) {
            // hsl(a) string
            let hsl = inputColor.match(/\d+/g).map(Number);
            let h = hsl[0], s = hsl[1], l = hsl[2];
            l = Math.max(0, l - 20); // oscura abbassando la luminosità
            return `hsl(${h},${s}%,${l}%)`;
        }
        return inputColor;
    }
    const shadowColor = darkenColor(color, 0.25);
    box.style.boxShadow = `8px 8px 0px 0px ${shadowColor}`;
    let nome = getCurrentPlayerName ? getCurrentPlayerName() : '';
    box.innerHTML = '';
    // Titolo turno
    const title = document.createElement('div');
    title.textContent = 'Turno di ' + nome;
    title.style.marginBottom = '18px';
    box.appendChild(title);
    // Box dado
    const diceBox = document.createElement('div');
    diceBox.id = 'dice-result-value';
    diceBox.style.fontSize = '2.5em';
    diceBox.style.background = 'rgba(255,255,255,0.18)';
    diceBox.style.borderRadius = '12px';
    diceBox.style.padding = '18px 36px';
    diceBox.style.marginBottom = '10px';
    diceBox.style.userSelect = 'none';
    box.appendChild(diceBox);
    // Animazione dado
    box.setAttribute('data-rolling', 'true');
    let current = 1;
    let interval = setInterval(() => {
        diceBox.textContent = current;
        current = current % diceFaces + 1;
    }, 60);
    // Effetto pressione
    box.onmousedown = function() {
        box.classList.add('pressed');
    };
    box.onmouseup = function() {
        box.classList.remove('pressed');
    };
    box.onmouseleave = function() {
        box.classList.remove('pressed');
    };
    // Click per avanzare
    box.onclick = function(e) {
        if (box.getAttribute('data-rolling') === 'false') return;
        // Ferma animazione
        clearInterval(interval);
        // Estrai il risultato
        lastDiceRoll = rollDice();
        diceBox.textContent = lastDiceRoll;
        box.setAttribute('data-rolling', 'false');
        // Dopo 0.8s nascondi il box e passa allo step successivo
        setTimeout(() => {
            box.style.display = 'none';
            newStep();
        }, ATTESA_POST_DADO);
    };
    // Mostra il box
    box.style.display = 'flex';
    console.log(getCurrentPlayerName()+" inizia il turno.");
}

function resolveThrow(playerId){
    // Il dado è già stato animato e il risultato è già stato estratto in resolveStartTurn
    // Quindi qui non serve più animare o mostrare nulla
    console.log(getCurrentPlayerName()+" lancia un "+lastDiceRoll);
}

function resolveMove(playerId, roll) {
    var cellNumber = getPlayerPosition(playerId);
    console.log(playerId + " avanza alla cella " + (cellNumber + roll));
    // Esegui l'animazione di movimento e solo dopo passa a CHECK_CELL
    movePieceToPositionWithStep(playerId, roll).then(() => {
        lastDiceRoll = 0;
        // Dopo che l'animazione è conclusa, attendi 0.5s e poi passa a CHECK_CELL
        setTimeout(() => {
            newStep();
        }, ATTESA_POST_MOVIMENTO);
    });
}

function resolveCheckCell(playerId){
    var cellNumber = getPlayerPosition(playerId);
    var domande = getDomandeByCella(cellNumber);
    if(domande.length > 0){
        console.log("Estraggo domanda per la cella " + cellNumber);
        var domandaEstratta = domande[Math.floor(Math.random() * domande.length)];
        visualizzaDomanda(playerId, domandaEstratta);
    }else{
        console.log("Nessuna domanda per la cella "+cellNumber);
        // Se non ci sono domande, passa automaticamente allo step successivo dopo 0.5s
        setTimeout(() => {
            newStep();
        }, ATTESA_POST_CHECK_CELL);
    }
}

function visualizzaDomanda(playerId, domanda) {
    if(domanda==undefined)return;
    // Crea la modale se non esiste
    let modal = document.getElementById('domanda-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'domanda-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.18)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';
        modal.style.backdropFilter = 'blur(8px)';
        document.body.appendChild(modal);
    }
    // Effetto blur su main-content
    const mainContent = document.getElementById('main-content');
    if(mainContent) mainContent.classList.add('blurred-bg');
    modal.innerHTML = '';

    // Layout principale: griglia 2 colonne
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'minmax(180px, 220px) 1fr';
    grid.style.gridTemplateRows = '1fr';
    grid.style.width = '100vw';
    grid.style.height = '80vh';
    grid.style.overflow = 'visible';
    grid.style.background = 'none';
    grid.style.border = 'none';

    // Colonna sinistra: solo personaggio
    const leftCol = document.createElement('div');
    leftCol.style.display = 'flex';
    leftCol.style.flexDirection = 'column';
    leftCol.style.alignItems = 'center';
    leftCol.style.justifyContent = 'center';
    leftCol.style.height = '100%';
    leftCol.style.background = 'none';
    leftCol.style.padding = '0';

    // IMG personaggio
    const img = document.createElement('img');
    img.id = 'domanda-personaggio-img';
    img.src = '../assets/schema_personaggio.png';
    img.alt = 'Personaggio';
    img.style.scale = '70%';
    img.style.height = '120px';
    img.style.width = '120px';
    img.style.scale = '12.0';
    img.style.marginLeft = '230%';
    img.style.marginBottom = '-80%';
    img.style.objectFit = 'contain';
    leftCol.appendChild(img);

    // Box domanda centrato nello schermo (fuori dalla griglia)
    const domandaBox = document.createElement('div');
    domandaBox.style.position = 'fixed';
    domandaBox.style.top = '25%';
    domandaBox.style.left = '40%';
    domandaBox.style.transform = 'translate(-50%, -50%)';
    domandaBox.style.background = 'rgba(245,245,245,0.92)';
    domandaBox.style.borderRadius = '18px';
    domandaBox.style.boxShadow = '0 2px 32px rgba(0,0,0,0.18)';
    domandaBox.style.padding = '32px 48px';
    domandaBox.style.minWidth = '320px';
    domandaBox.style.maxWidth = '600px';
    domandaBox.style.zIndex = '10001';
    domandaBox.style.display = 'flex';
    domandaBox.style.flexDirection = 'column';
    domandaBox.style.alignItems = 'center';
    domandaBox.style.justifyContent = 'center';

    // Domanda
    const domandaEl = document.createElement('div');
    domandaEl.textContent = domanda.domanda;
    domandaEl.style.fontSize = '1.3em';
    domandaEl.style.fontWeight = 'bold';
    domandaEl.style.marginBottom = '12px';
    domandaEl.style.textAlign = 'center';
    domandaEl.style.color = '#222';
    domandaBox.appendChild(domandaEl);

    // Colonna destra: risposte
    const rightCol = document.createElement('div');
    rightCol.style.display = 'flex';
    rightCol.style.flexDirection = 'column';
    rightCol.style.justifyContent = 'center';
    rightCol.style.alignItems = 'flex-end';
    rightCol.style.height = '100%';
    rightCol.style.padding = '32px 5vw 32px 0';
    rightCol.style.gap = '32px';

    // Mescola le risposte
    let risposte = [
        { value: domanda.rispostaCorretta, isCorrect: true },
        { value: domanda.risposta1, isCorrect: false },
        { value: domanda.risposta2, isCorrect: false }
    ];
    risposte = risposte.sort(() => Math.random() - 0.5);

    // Calcola altezza box risposte
    const boxHeight = (Math.floor((0.75 * 60 * window.innerHeight / 100) / risposte.length)+60) + 'px';

    // Bottoni risposte grandi, verticali
    risposte.forEach(r => {
        const btn = document.createElement('button');
        btn.textContent = r.value;
        btn.style.margin = '0';
        btn.style.padding = '0 48px';
        btn.style.height = boxHeight;
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.fontSize = '1.35em';
        btn.style.fontWeight = 'bold';
        btn.style.borderRadius = '16px';
        btn.style.border = '2px solid #888';
        btn.style.background = '#fff';
        btn.style.color = '#222';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
        btn.style.transition = 'background 0.18s, color 0.18s';
        btn.style.width = '550px';
        btn.style.textAlign = 'center';
        btn.onmouseover = () => { btn.style.background = '#fbc02d'; btn.style.color = '#222'; };
        btn.onmouseout = () => { btn.style.background = '#fff'; btn.style.color = '#222'; };
        btn.onclick = () => {
            modal.style.display = 'none';
            if(mainContent) mainContent.classList.remove('blurred-bg');
            lastBonusSteps = r.isCorrect ? 1 : 0;
            // Risolvi solo BONUS_STEP, che farà avanzare lo stato
            resolveBonusStep(playerId);
        };
        rightCol.appendChild(btn);
    });

    grid.appendChild(leftCol);
    grid.appendChild(rightCol);
    modal.appendChild(grid);
    modal.appendChild(domandaBox);
    modal.style.display = 'flex';
}

function resolveBonusStep(playerId){
    // Esegui il movimento bonus e solo dopo passa allo step successivo
    movePieceToPositionWithStep(playerId, lastBonusSteps).then(() => {
        lastBonusSteps = 0;
        // Dopo che l'animazione è conclusa, attendi 0.5s e poi passa a END_TURN tramite newStep
        setTimeout(() => {
            newStep();
        }, ATTESA_POST_BONUS_STEP);
    });
}

function resolveEndTurn(playerId){
    console.log(getCurrentPlayerName()+" termina il turno.");
    // Dopo 0.5s passa automaticamente al prossimo step (nuovo turno)
    setTimeout(() => {
        newStep();
    }, ATTESA_POST_END_TURN);
}


// Rimuovi il box dado separato dalla pagina HTML
const diceResultBox = document.getElementById('dice-result-box');
if (diceResultBox) {
    diceResultBox.parentNode.removeChild(diceResultBox);
}

function rollDice(){
    return Math.floor(Math.random() * diceFaces) + 1;
}

async function movePieceToPositionWithStep(playerId, roll) {
    stepAnimationInProgress = true;

    for (let i = 0; i < roll; i++) {
        const cellNumber = getPlayerPosition(playerId);
        setPlayerPosition(playerId, cellNumber + 1);
        takeStep(playerId, cellNumber + 1);
        await new Promise(resolve => setTimeout(resolve, DURATA_ANIMAZIONE_MOVIMENTO)); // 0.5 secondi di attesa
    }

    stepAnimationInProgress = false;
}

function takeStep(playerId,cellNumber){
    // Recupera la posizione della cella dalla mappa boardState
    if (typeof boardState !== 'undefined' && boardState.has(cellNumber)) {
        const pos = boardState.get(cellNumber);
        const mainContent = document.getElementById('main-content');
        const rect = mainContent.getBoundingClientRect();
        const xPx = (pos.x / 100) * rect.width;
        const yPx = (pos.y / 100) * rect.height;
        // Trova il pinWrapper del giocatore
        const pin = document.getElementById(playerId);
        if (pin && pin.parentElement) {
            const pinWrapper = pin.parentElement;
            pinWrapper.style.left = (xPx - 16) + 'px';
            pinWrapper.style.top = (yPx - 32) + 'px';
        }
    }
}

// Aggiorna o crea il box dello stato corrente in basso a sinistra
function updateStepIndicator() {
    let indicator = document.getElementById('step-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'step-indicator';
        indicator.style.position = 'fixed';
        indicator.style.left = '16px';
        indicator.style.bottom = '16px';
        indicator.style.background = 'rgba(30,30,30,0.92)';
        indicator.style.color = '#fff';
        indicator.style.padding = '10px 18px';
        indicator.style.borderRadius = '10px';
        indicator.style.fontSize = '1.1em';
        indicator.style.zIndex = '9999';
        indicator.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
        document.body.appendChild(indicator);
    }
    let player = getCurrentPlayerName ? getCurrentPlayerName() : '';
    let state = getCurrentTurnState ? getCurrentTurnState() : '';
    indicator.textContent = `Turno: ${player} | Stato: ${state}`;
}

// Richiama updateStepIndicator ogni volta che cambia lo stato
const originalAdvanceGameState = typeof advanceGameState === 'function' ? advanceGameState : null;
function advanceGameStateWithIndicator() {
    if (originalAdvanceGameState) originalAdvanceGameState();
    updateStepIndicator();
}

// Sostituisci advanceGameState con la versione che aggiorna l'indicatore
advanceGameState = advanceGameStateWithIndicator;

// Aggiorna subito all'avvio
updateStepIndicator();
