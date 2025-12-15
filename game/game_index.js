// Variabili globali per nomi, colori e turni giocatori
window.playerNames = window.playerNames || [];
window.playerColors = window.playerColors || [];
window.playerTurns = window.playerTurns || [];

window.addEventListener("DOMContentLoaded", function () {
    // Overlay start game
    const overlay = document.getElementById("start-game-overlay");
    const playersRow = document.getElementById("start-game-players-row");
    const startBtn = document.getElementById("start-game-btn");
    const MAX_PLAYERS = 50;
    // Palette random per tutti i giocatori
    const playerColorPalette = [];
    function getRandomColor() {
      // Colore HSL vivace
      const h = Math.floor(Math.random() * 360);
      const s = 70 + Math.floor(Math.random() * 20); // 70-90%
      const l = 45 + Math.floor(Math.random() * 15); // 45-60%
      return `hsl(${h},${s}%,${l}%)`;
    }
    // Genera palette random per tutti i giocatori
    for(let i=0; i<MAX_PLAYERS; i++) {
      playerColorPalette[i] = getRandomColor();
    }
    // Stato locale
    let localPlayerNames = Array(MAX_PLAYERS).fill(null);
    // Genera le card
    playersRow.innerHTML = '';
    for(let i=0; i<MAX_PLAYERS; i++) {
      const card = document.createElement('div');
      card.className = 'player-card';
      card.dataset.player = i;
      card.style.background = playerColorPalette[i];
      // Bottone +
      const addBtn = document.createElement('button');
      addBtn.className = 'add-player-btn';
      addBtn.textContent = '+';
      // Bottone colore
      const colorBtn = document.createElement('button');
      colorBtn.className = 'color-player-btn';
      colorBtn.textContent = '🎨';
      colorBtn.style.marginTop = '8px';
      colorBtn.style.width = '48px';
      colorBtn.style.height = '32px';
      colorBtn.style.borderRadius = '8px';
      colorBtn.style.fontSize = '1.2em';
      colorBtn.style.background = 'rgba(0,0,0,0.10)';
      colorBtn.style.border = 'none';
      colorBtn.style.cursor = 'pointer';
      colorBtn.title = 'Cambia colore';
      // Cambia colore card e palette locale
      colorBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const newColor = getRandomColor();
        card.style.background = newColor;
        playerColorPalette[i] = newColor;
      });
      // Input e bottone -
      const inputDiv = document.createElement('div');
      inputDiv.className = 'player-inputs';
      inputDiv.style.display = 'none';
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'player-name-input';
      nameInput.placeholder = `Nome giocatore ${i+1}`;
      nameInput.maxLength = 16;
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-player-btn';
      removeBtn.textContent = '-';
      inputDiv.appendChild(nameInput);
      inputDiv.appendChild(removeBtn);
      card.appendChild(addBtn);
      card.appendChild(colorBtn);
      card.appendChild(inputDiv);
      playersRow.appendChild(card);
      // Eventi
      addBtn.addEventListener('click', () => {
        addBtn.style.display = 'none';
        inputDiv.style.display = 'flex';
        nameInput.focus();
        nameInput.value = '';
        localPlayerNames[i] = '';
        checkStartBtn();
      });
      removeBtn.addEventListener('click', () => {
        addBtn.style.display = 'flex';
        inputDiv.style.display = 'none';
        nameInput.value = '';
        localPlayerNames[i] = null;
        checkStartBtn();
      });
      nameInput.addEventListener('input', () => {
        localPlayerNames[i] = nameInput.value.trim();
        checkStartBtn();
      });
    }
    function checkStartBtn() {
      // Permetti solo se almeno 1 giocatore
      const valid = localPlayerNames.filter(n => n && n.length > 0);
      startBtn.disabled = valid.length < 1;
    }
    startBtn.addEventListener('click', () => {
      // Popola array globale nomi e colori
      if (typeof playerNames !== 'undefined') playerNames.length = 0;
      if (typeof playerColors !== 'undefined') playerColors.length = 0;
      const names = localPlayerNames.map((n, i) => n && n.length > 0 ? n : null).filter(n => n);
      // Recupera i colori effettivi delle card attive
      const cards = playersRow.querySelectorAll('.player-card');
      const colors = [];
      cards.forEach((card, i) => {
        const name = localPlayerNames[i];
        if (name && name.length > 0) {
          // Usa il colore di background effettivo della card
          const style = window.getComputedStyle(card);
          colors.push(style.backgroundColor);
        }
      });
      if (typeof playerNames !== 'undefined') names.forEach(n => playerNames.push(n));
      if (typeof playerColors !== 'undefined') colors.forEach(c => playerColors.push(c));
      // Avvia partita con countdown animato
      let countdown = DURATA_COUNTDOWN_START;
      startBtn.disabled = true;
      const originalText = startBtn.textContent;
      startBtn.textContent = `Inizio tra ${countdown}...`;
      startBtn.classList.add('countdown');
      const interval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          startBtn.textContent = `Inizio tra ${countdown}...`;
        } else {
          clearInterval(interval);
          startBtn.textContent = originalText;
          startBtn.classList.remove('countdown');
          overlay.style.display = 'none';
          dropPlayerPieces(playerNames.length);
          startGame();
        }
      }, 1000);
    });

    if(settings == undefined) {console.error("Settings not found!"); return;}
    loadSettings(settings);

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
}

function dropPlayerPieces(numPlayers){
  const imageContainer = document.querySelector('.image-container');
  // Rimuovi eventuali pin precedenti
  const oldPins = imageContainer.querySelectorAll('.player-pin');
  oldPins.forEach(pin => pin.remove());

  // Colori predefiniti per i giocatori
  const playerColorPalette = [
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
    const pinWrapper = document.createElement('div');
    pinWrapper.className = 'pin-wrapper';
    pinWrapper.style.position = 'absolute';
    pinWrapper.style.left = (xPx - 16 + i*24) + 'px';
    pinWrapper.style.top = (yPx - 32) + 'px';
    pinWrapper.style.width = '32px';
    pinWrapper.style.height = '48px';
    pinWrapper.style.zIndex = 100 + i;
    pinWrapper.setAttribute('data-player', i+1);
    // Pin
    const pin = document.createElement('img');
    pin.src = '../assets/player_pin.png';
    pin.className = 'player-pin';
    pin.style.width = '32px';
    pin.style.height = '32px';
    let playerColor = window.playerColors && window.playerColors[i] ? window.playerColors[i] : playerColorPalette[i % playerColorPalette.length];
    pin.style.backgroundColor = playerColor;
    pin.setAttribute('id','pp-' + (i+1));
    pinWrapper.appendChild(pin);
    // Box nome sotto il pin
    if (window.playerNames && window.playerNames[i]) {
      const nameBox = document.createElement('div');
      nameBox.className = 'player-pin-name-box';
      nameBox.textContent = window.playerNames[i];
      nameBox.style.position = 'absolute';
      nameBox.style.left = '0px';
      nameBox.style.top = '34px';
      nameBox.style.minWidth = '32px';
      nameBox.style.maxWidth = '80px';
      nameBox.style.padding = '2px 8px';
      nameBox.style.background = 'rgba(30,30,30,0.75)';
      nameBox.style.borderRadius = '8px';
      nameBox.style.fontSize = '0.95em';
      nameBox.style.fontWeight = 'bold';
      nameBox.style.color = playerColor;
      nameBox.style.textAlign = 'center';
      nameBox.style.zIndex = 101 + i;
      nameBox.style.pointerEvents = 'none';
      nameBox.style.whiteSpace = 'nowrap';
      nameBox.style.overflow = 'hidden';
      nameBox.style.textOverflow = 'ellipsis';
      pinWrapper.appendChild(nameBox);
    }
    imageContainer.appendChild(pinWrapper);
    playerTurns.push('pp-' + (i+1));
    setPlayerPosition('pp-' + (i+1), 0);
  }
}