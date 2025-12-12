// Mappa globale delle celle
var boardState = new Map();

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
