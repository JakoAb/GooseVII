window.addEventListener("DOMContentLoaded", function () {
    if(settings == undefined) {console.error("Settings not found!"); return;}
    loadSettings(settings);

    dropPlayerPieces(4);
    newStep();
});

function loadSettings(settings) {
  const imageContainer = document.querySelector('.image-container');
  // Svuota eventuali immagini precedenti
  while (imageContainer.firstChild) imageContainer.removeChild(imageContainer.firstChild);
  if (settings.layers && Array.isArray(settings.layers)) {
    settings.layers.forEach((base64, idx) => {
      const div = document.createElement('div');
      div.className = 'bg-image';
      div.style.backgroundImage = `url('${base64}')`;
      div.style.zIndex = 2 + idx;
      imageContainer.appendChild(div);
    });
  }

  loadState(settings.celle);
}

function loadState(celle) {
  setBoardState(celle);
  celle.forEach(cellaObj => {
    if (cellaObj && typeof cellaObj.cella !== 'undefined' && cellaObj.posizione) {
      console.log(`${cellaObj.cella} | ${cellaObj.posizione.x},${cellaObj.posizione.y}`);
    }
  });
}

function dropPlayerPieces(numPlayers){
  const imageContainer = document.querySelector('.image-container');
  // Rimuovi eventuali pin precedenti
  const oldPins = imageContainer.querySelectorAll('.player-pin');
  oldPins.forEach(pin => pin.remove());

  // Colori predefiniti per i giocatori
  const playerColors = [
    '#e53935', // rosso
    '#43a047', // verde
    '#1e88e5', // blu
    '#fbc02d', // giallo
    '#8e24aa', // viola
    '#fb8c00', // arancione
    '#00bcd4', // azzurro
    '#cddc39'  // lime
  ];

  // Recupera la posizione della cella zero dalla mappa boardState
  let pos = {x: 0, y: 0};
  if (typeof boardState !== 'undefined' && boardState.has(0)) {
    pos = boardState.get(0);
  }
  // mainContent serve per calcolare le coordinate pixel
  const mainContent = document.getElementById('main-content');
  const rect = mainContent.getBoundingClientRect();
  const xPx = (pos.x / 100) * rect.width;
  const yPx = (pos.y / 100) * rect.height;

  for(let i=0; i<numPlayers; i++){
    const pin = document.createElement('img');
    pin.src = '../assets/player_pin.png';
    pin.className = 'player-pin';
    pin.style.position = 'absolute';
    pin.style.left = (xPx - 16 + i*24) + 'px'; // offset per non sovrapporre
    pin.style.top = (yPx - 32) + 'px';
    pin.style.width = '32px';
    pin.style.height = '32px';
    pin.style.zIndex = 100 + i;
    pin.style.backgroundColor= playerColors[i % playerColors.length]; /* colore che vuoi */
    pin.setAttribute('id','pp-' + (i+1));
    pin.setAttribute('data-player', i+1);
    imageContainer.appendChild(pin);
    playerTurns.push('pp-' + (i+1));
    playerNames.push('NOME_Giocatore_' + (i+1));
    setPlayerPosition('pp-' + (i+1), 0);
  }
}