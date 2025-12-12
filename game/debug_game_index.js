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
        box.style.position = 'fixed';
        box.style.top = '50%';
        box.style.left = '50%';
        box.style.transform = 'translate(-50%, -50%)';
        box.style.zIndex = '11000';
        box.style.padding = '32px 64px';
        box.style.fontSize = '2.2em';
        box.style.fontWeight = 'bold';
        box.style.borderRadius = '18px';
        box.style.boxShadow = '0 2px 16px rgba(0,0,0,0.18)';
        box.style.color = '#fff';
        box.style.textAlign = 'center';
        box.style.cursor = 'pointer';
        box.style.display = 'flex';
        box.style.flexDirection = 'column';
        box.style.alignItems = 'center';
        document.body.appendChild(box);
    }
    let color = getCurrentPlayerColor();
    box.style.background = color;
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
    // Click per avanzare
    box.onclick = function() {
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
        }, 800);
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
        }, 500);
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
        }, 500);
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
        modal.style.background = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';
        document.body.appendChild(modal);
    }
    modal.innerHTML = '';

    // Crea il contenitore della domanda
    const box = document.createElement('div');
    box.style.background = '#fff';
    box.style.padding = '32px';
    box.style.borderRadius = '12px';
    box.style.boxShadow = '0 2px 16px rgba(0,0,0,0.2)';
    box.style.textAlign = 'center';
    box.style.minWidth = '260px';

    // Domanda
    const domandaEl = document.createElement('div');
    domandaEl.textContent = domanda.domanda;
    domandaEl.style.fontSize = '1.3em';
    domandaEl.style.marginBottom = '20px';
    box.appendChild(domandaEl);

    // Mescola le risposte
    let risposte = [
        { value: domanda.rispostaCorretta, isCorrect: true },
        { value: domanda.risposta1, isCorrect: false },
        { value: domanda.risposta2, isCorrect: false }
    ];
    risposte = risposte.sort(() => Math.random() - 0.5);

    // Bottoni risposte
    risposte.forEach(r => {
        const btn = document.createElement('button');
        btn.textContent = r.value;
        btn.style.margin = '8px';
        btn.style.padding = '10px 24px';
        btn.style.fontSize = '1em';
        btn.style.borderRadius = '8px';
        btn.style.border = '1px solid #888';
        btn.style.cursor = 'pointer';
        btn.onclick = () => {
            modal.style.display = 'none';
            lastBonusSteps = r.isCorrect ? 1 : 0;
            // Risolvi solo BONUS_STEP, che farà avanzare lo stato
            resolveBonusStep(playerId);
        };
        box.appendChild(btn);
    });

    modal.appendChild(box);
    modal.style.display = 'flex';
}

function resolveBonusStep(playerId){
    // Esegui il movimento bonus e solo dopo passa allo step successivo
    movePieceToPositionWithStep(playerId, lastBonusSteps).then(() => {
        lastBonusSteps = 0;
        // Dopo che l'animazione è conclusa, attendi 0.5s e poi passa a END_TURN tramite newStep
        setTimeout(() => {
            newStep();
        }, 500);
    });
}

function resolveEndTurn(playerId){
    console.log(getCurrentPlayerName()+" termina il turno.");
    // Dopo 0.5s passa automaticamente al prossimo step (nuovo turno)
    setTimeout(() => {
        newStep();
    }, 500);
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
        await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 secondi di attesa
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
        // Trova il pin del giocatore
        const pin = document.getElementById(playerId);
        if (pin) {
            // Centra il pin rispetto alla cella
            const pinWidth = pin.offsetWidth || 32;
            const pinHeight = pin.offsetHeight || 32;
            pin.style.left = (xPx - pinWidth/2) + 'px';
            pin.style.top = (yPx - pinHeight/2) + 'px';
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
