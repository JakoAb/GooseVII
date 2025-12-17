var boardState = new Map();
var playerPosition = new Map();

function setBoardState(celle) {
  boardState.clear();
  celle.forEach(cellaObj => {
    if (cellaObj && typeof cellaObj.cella !== 'undefined' && cellaObj.posizione) {
      boardState.set(cellaObj.cella - 1, {
        x: cellaObj.posizione.x,
        y: cellaObj.posizione.y,
        domande: cellaObj.domande || [],
        categoria: cellaObj.categoria || ''
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

function getDomandeByCella(cellNumber) {
  // Recupera la posizione della cella dalla mappa boardState
  if (typeof boardState !== 'undefined' && boardState.has(cellNumber)) {
    const pos = boardState.get(cellNumber);
    return pos.domande || [];
  } else {
    console.warn(`Cella ${cellNumber} non trovata in boardState.`);
    return [];
  }
}

function getCategoriaByCella(cellNumber) {
  if (typeof boardState !== 'undefined' && boardState.has(cellNumber)) {
    const pos = boardState.get(cellNumber);
    return pos.categoria || '';
  } else {
    console.warn(`Cella ${cellNumber} non trovata in boardState.`);
    return '';
  }
}
