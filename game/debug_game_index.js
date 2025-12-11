const nexPlayerBtn = document.getElementById("next-player-btn");
const nexStateBtn = document.getElementById("next-state-btn");
const stepGameStateBtn = document.getElementById("step-game-state-btn");
var stepAnimationInProgress = false;
var diceFaces = 6;
var lastDiceRoll = 0;
var lastBonusSteps = 0;

nexPlayerBtn.addEventListener("click", () => {
    console.log("Next Player: "+advanceToNextPlayer());
});

nexStateBtn.addEventListener("click", () => {
    console.log("New State: "+advanceTurnState());
});

stepGameStateBtn.addEventListener("click", () => {
    newStep();
});

function showDiceResult(roll) {
    const box = document.getElementById('dice-result-box');
    const valueSpan = document.getElementById('dice-result-value');
    if (box && valueSpan) {
        valueSpan.textContent = roll;
        box.style.display = 'block';
        setTimeout(() => {
            box.style.display = 'none';
        }, 1500);
    }
}

function newStep(){
    if(stepAnimationInProgress)return;
    advanceGameState()
    resolveGameStateStep(getCurrentPlayer(), getCurrentTurnState());
}

function resolveGameStateStep(playerId, state){
    switch (state){
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

function resolveThrow(playerId){
        lastDiceRoll = rollDice();
        showDiceResult(lastDiceRoll);
        console.log(getCurrentPlayerName()+" lancia un "+lastDiceRoll);
}

function resolveMove(playerId,roll){
    var cellNumber = getPlayerPosition(playerId);
    console.log(playerId+" avanza alla cella "+(cellNumber+roll));
    movePieceToPositionWithStep(playerId,roll);
    lastDiceRoll = 0;
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
            newStep();
        };
        box.appendChild(btn);
    });

    modal.appendChild(box);
    modal.style.display = 'flex';
}

function resolveBonusStep(playerId){
    resolveMove(playerId,lastBonusSteps);
    lastBonusSteps = 0;
}

function resolveEndTurn(playerId){
    console.log(getCurrentPlayerName()+" termina il turno.");
    newStep();
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
            pin.style.left = (xPx - pinWidth/3) + 'px';
            pin.style.top = (yPx - pinHeight*2) + 'px';
        }
    }
}