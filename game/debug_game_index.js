const nexPlayerBtn = document.getElementById("next-player-btn");
const nexStateBtn = document.getElementById("next-state-btn");
const stepGameStateBtn = document.getElementById("step-game-state-btn");
var stepAnimationInProgress = false;

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

    console.log(advanceGameState());
    var state = getCurrentTurnState();

    if(state === 'THROW'){
        var roll = rollDice();
        showDiceResult(roll);
        console.log(getCurrentPlayerName()+" lancia un "+roll);
        console.log("avanza dalla cella "+getPlayerPosition(getCurrentPlayer())+" alla cella "+(getPlayerPosition(getCurrentPlayer())+roll));
        movePieceToPositionWithStep(getCurrentPlayer(),roll);
    }
}

function rollDice(){
    return Math.floor(Math.random() * 6) + 1;
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