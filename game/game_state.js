var currentGameTurn = 0;
var playerTurns = [];
var currentPlayerIndex = 0;
var turnState = ['THROW','MOVE','CHECK_FOOT','END_TURN'];
var currentTurnState = 0;

var playerNames = [];

function getCurrentPlayer(){
    return playerTurns[currentPlayerIndex];
}

function getCurrentPlayerName(){
    return playerNames[currentPlayerIndex];
}

function getCurrentTurnState(){
    return turnState[currentTurnState];
}

function advanceTurnState(){
    currentTurnState = (currentTurnState + 1) % turnState.length;
    return getCurrentTurnState();
}

function advanceToNextPlayer(){
    currentPlayerIndex = (currentPlayerIndex + 1) % playerTurns.length;
    currentTurnState = 0;
    return getCurrentPlayer();
}

function advanceGameState(){
    var turnStateInternal = currentTurnState+1;
    if(turnStateInternal > turnState.length -1){
        currentTurnState = 0;

        var currentPlayerIndexInternal = currentPlayerIndex+1;
        if(currentPlayerIndexInternal > playerTurns.length -1){
            currentPlayerIndexInternal = 0;
            currentGameTurn++;
        }
        currentPlayerIndex = currentPlayerIndexInternal
    }else{
        advanceTurnState();
    }
    return currentGameTurn + ' | ' + playerTurns[currentPlayerIndex] + ' | '+turnState[currentTurnState];
}


