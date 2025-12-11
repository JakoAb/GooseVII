const nexPlayerBtn = document.getElementById("next-player-btn");
const nexStateBtn = document.getElementById("next-state-btn");
const stepGameStateBtn = document.getElementById("step-game-state-btn");


nexPlayerBtn.addEventListener("click", () => {
    console.log("Next Player: "+advanceToNextPlayer());
});

nexStateBtn.addEventListener("click", () => {
    console.log("New State: "+advanceTurnState());
});

stepGameStateBtn.addEventListener("click", () => {
    newStep();
});

function newStep(){
    console.log(advanceGameState());
    var state = getCurrentTurnState();

    if(state === 'THROW'){
        var roll = rollDice();
        console.log(getCurrentPlayerName()+" lancia un "+roll);
        console.log("avanza dalla cella "+getPlayerPosition(getCurrentPlayer())+" alla cella "+(getPlayerPosition(getCurrentPlayer())+roll));
        movePieceToPositionWithStep(getCurrentPlayer(),roll);
    }
}

function rollDice(){
    return Math.floor(Math.random() * 6) + 1;
}

async function movePieceToPosition(playerId,roll){
    for (let i = 0; i < roll; i++) {
		const cellNumber = getPlayerPosition(playerId);
        setPlayerPosition(getCurrentPlayer(), (getPlayerPosition(getCurrentPlayer())+1));
		await takeStep(playerId,cellNumber);
    }
}

async function takeStep(playerId,cellNumber){
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
                pin.style.left = (xPx - 16) + 'px';
                pin.style.top = (yPx - 32) + 'px';
            }
        }
}