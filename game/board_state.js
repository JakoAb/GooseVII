// Mappa globale delle celle
var boardState = new Map();
var playerPosition = new Map();

function setBoardState(celle) {
  boardState.clear();
  celle.forEach(cellaObj => {
    if (cellaObj && typeof cellaObj.cella !== 'undefined' && cellaObj.posizione) {
      boardState.set(cellaObj.cella - 1, {
        x: cellaObj.posizione.x,
        y: cellaObj.posizione.y
      });
    }
  });
}

function setPlayerPosition(playerId, cellNumber) {
  if (boardState.has(cellNumber)) {
    playerPosition.set(playerId, cellNumber);
  } else {
    console.warn(`Cella ${cellNumber} non trovata in boardState.`);
  }
}

function getPlayerPosition(playerId) {
  return playerPosition.get(playerId);
}


