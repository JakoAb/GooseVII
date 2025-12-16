//const stepGameStateBtn = document.getElementById("step-game-state-btn");
var stepAnimationInProgress = false;
var lastDiceRoll = 0;
var lastBonusSteps = 0;

//stepGameStateBtn.addEventListener("click", () => {
//    if(currentGameTurn == 0){
//        startGame();
//    }else{
//        newStep();
//    }
//
//});

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
            resolveBonusStep(playerId);
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
        box.className = 'turno-giocatore-box';
        box.style.position = 'fixed';
        box.style.top = '50%';
        box.style.left = '50%';
        box.style.transform = 'translate(-50%, -50%)';
        box.style.zIndex = '11000';
        box.style.padding = '32px 64px';
        box.style.fontSize = '2.2em';
        box.style.fontWeight = 'bold';
        box.style.borderRadius = '18px';
        box.style.color = '#fff';
        box.style.textAlign = 'center';
        box.style.cursor = 'pointer';
        box.style.display = 'flex';
        box.style.flexDirection = 'column';
        box.style.alignItems = 'center';
        box.style.textShadow = 'rgba(0, 0, 0, 0.35) 0px 5px 0px';
        document.body.appendChild(box);
    }
    box.className = 'turno-giocatore-box';
    let color = getCurrentPlayerColor();
    box.style.background = color;
    // Calcola una versione scurita del colore per la shadow
    function darkenColor(inputColor, percent) {
        // Supporta hex, rgb, hsl
        if(inputColor.startsWith('#')) {
            let c = inputColor.replace('#', '');
            if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
            let num = parseInt(c, 16);
            let r = Math.max(0, (num >> 16) - 255 * percent);
            let g = Math.max(0, ((num >> 8) & 0x00FF) - 255 * percent);
            let b = Math.max(0, (num & 0x0000FF) - 255 * percent);
            return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
        } else if(inputColor.startsWith('rgb')) {
            // rgb(a) string
            let rgb = inputColor.match(/\d+/g).map(Number);
            let r = Math.max(0, rgb[0] - 255 * percent);
            let g = Math.max(0, rgb[1] - 255 * percent);
            let b = Math.max(0, rgb[2] - 255 * percent);
            return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
        } else if(inputColor.startsWith('hsl')) {
            // hsl(a) string
            let hsl = inputColor.match(/\d+/g).map(Number);
            let h = hsl[0], s = hsl[1], l = hsl[2];
            l = Math.max(0, l - 20); // oscura abbassando la luminosità
            return `hsl(${h},${s}%,${l}%)`;
        }
        return inputColor;
    }
    const shadowColor = darkenColor(color, 0.25);
    box.style.boxShadow = `0px 35px 0px 0px ${shadowColor}`;
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
    diceBox.style.minWidth = '100px';
    box.appendChild(diceBox);
    // Animazione dado
    box.setAttribute('data-rolling', 'true');
    let current = 1;
    let interval = setInterval(() => {
        diceBox.textContent = current;
        current = current % diceFaces + 1;
    }, 60);
    // Effetto pressione
    box.onmousedown = function() {
        box.classList.add('pressed');
    };
    box.onmouseup = function() {
        box.classList.remove('pressed');
    };
    box.onmouseleave = function() {
        box.classList.remove('pressed');
    };
    // Click per avanzare
    box.onclick = function(e) {
        if (box.getAttribute('data-rolling') === 'false') return;
        clearInterval(interval);
        lastDiceRoll = rollDice();
        diceBox.textContent = lastDiceRoll;
        box.setAttribute('data-rolling', 'false');
        // Esplosione di numeri
        explodeDiceNumbers(lastDiceRoll, box);
        // Animazione: sposta top di 10px e riduci la shadow
        box.style.transition = 'top 0.2s, box-shadow 0.2s';
        box.style.top = 'calc(50% + 10px)';
        box.style.boxShadow = `0px 10px 0px 0px ${shadowColor}`;
        setTimeout(() => {
            // Riporta il box alla posizione originale (animato)
            box.style.top = '50%';
            box.style.boxShadow = `0px 35px 0px 0px ${shadowColor}`;
            // Dopo 0.5s nascondi il box e avanza
            setTimeout(() => {
                box.style.display = 'none';
                newStep();
            }, 500);
        }, 100);
    };
    // Mostra il box
    box.style.display = 'flex';
    console.log(getCurrentPlayerName()+" inizia il turno.");
}

// Abilita lancio dado anche con SPAZIO o INVIO
window.addEventListener('keydown', function(e) {
    const box = document.getElementById('turno-giocatore-box');
    if (!box || box.style.display === 'none') return;
    if (box.getAttribute('data-rolling') !== 'true') return;
    if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        box.click();
    }
});

function resolveThrow(playerId){
    // Il dado è già stato animato e il risultato è già stato estratto in resolveStartTurn
    // Quindi qui non serve più animare o mostrare nulla
    console.log(getCurrentPlayerName()+" lancia un "+lastDiceRoll);
}

function resolveMove(playerId, roll) {
    // Nascondi il turno-giocatore-box se presente
    let box = document.getElementById('turno-giocatore-box');
    if (box) box.style.display = 'none';
    var cellNumber = getPlayerPosition(playerId);
    console.log(playerId + " avanza alla cella " + (cellNumber + roll));
    // Esegui l'animazione di movimento e solo dopo passa a CHECK_CELL
    movePieceToPositionWithStep(playerId, roll, false).then(() => {
        lastDiceRoll = 0;
        // Dopo che l'animazione è conclusa, attendi 0.5s e poi passa a CHECK_CELL
        setTimeout(() => {
            newStep();
        }, ATTESA_POST_MOVIMENTO);
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
        }, ATTESA_POST_CHECK_CELL);
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
        modal.style.background = 'rgba(76, 0, 140, 0.37);';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';
        modal.style.backdropFilter = 'blur(8px)';
        document.body.appendChild(modal);
    }
    // Effetto blur su main-content
    const mainContent = document.getElementById('main-content');
    if(mainContent) mainContent.classList.add('blurred-bg');
    modal.innerHTML = '';

    // Layout principale: griglia 2 colonne
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'minmax(180px, 220px) 1fr';
    grid.style.gridTemplateRows = '1fr';
    grid.style.width = '100vw';
    grid.style.height = '80vh';
    grid.style.overflow = 'visible';
    grid.style.background = 'none';
    grid.style.border = 'none';

    // Colonna sinistra: solo personaggio
    const leftCol = document.createElement('div');
    leftCol.style.position = 'relative';
    // IMG personaggio -> ora div con background-image
    const personaggioDiv = document.createElement('div');
    personaggioDiv.id = 'domanda-personaggio-img';
    personaggioDiv.style.position = 'fixed';
    personaggioDiv.style.left = '-80%';
    personaggioDiv.style.right = '0';
    personaggioDiv.style.bottom = '-10%';
    personaggioDiv.style.margin = '0 auto';
    personaggioDiv.style.width = '1600px';
    personaggioDiv.style.height = '1065px';
    personaggioDiv.style.backgroundImage = `url('${showArtworkGrid ? '../assets/schema_personaggio.png' : '../assets/personaggio.png'}')`;
    personaggioDiv.style.backgroundSize = 'contain';
    personaggioDiv.style.backgroundRepeat = 'no-repeat';
    personaggioDiv.style.backgroundPosition = 'center bottom';
    personaggioDiv.style.zIndex = '10000';
    // Animazione: parte nascosto sotto lo schermo
    personaggioDiv.style.transform = 'translateY(150%)';
    personaggioDiv.style.transition = 'transform 0.5s cubic-bezier(0.4,1.4,0.6,1)';
    leftCol.appendChild(personaggioDiv);
    // Dopo breve delay, porta il personaggio in posizione
    setTimeout(() => {
        personaggioDiv.style.transform = 'translateY(0)';
        // Dopo l'entrata, inizia movimento "idle" leggero
        setTimeout(() => {
            let t = 0;
            function idleAnim() {
                t += 0.04;
                const dx = Math.sin(t*1.2)*4;
                const dy = Math.cos(t*1.7)*3;
                personaggioDiv.style.transform = `translateY(0) translate(${dx}px, ${dy}px)`;
                personaggioDiv._idleAnimFrame = requestAnimationFrame(idleAnim);
            }
            idleAnim();
        }, 500);
    }, 50);
    // Quando la modale viene chiusa, ferma l'animazione
    modal.addEventListener('transitionend', () => {
        if (modal.style.display === 'none' && personaggioDiv._idleAnimFrame) {
            cancelAnimationFrame(personaggioDiv._idleAnimFrame);
        }
    });

    // Box domanda centrato nello schermo (fuori dalla griglia)
    const domandaBox = document.createElement('div');
    domandaBox.style.position = 'fixed';
    domandaBox.style.top = '25%';
    domandaBox.style.left = '40%';
    domandaBox.style.transform = 'translate(-50%, -50%)';
    domandaBox.style.background = 'rgba(245,245,245,0.92)';
    domandaBox.style.borderRadius = '18px';
    domandaBox.style.boxShadow = 'none';
    domandaBox.style.padding = '32px 48px';
    domandaBox.style.minWidth = '20%';
    domandaBox.style.maxWidth = '45%';
    domandaBox.style.minHeight = '300px';
    domandaBox.style.zIndex = '10001';
    domandaBox.style.display = 'flex';
    domandaBox.style.flexDirection = 'column';
    domandaBox.style.alignItems = 'center';
    domandaBox.style.justifyContent = 'center';

    // Domanda
    const domandaEl = document.createElement('div');
    domandaEl.textContent = domanda.domanda;
    domandaEl.style.fontSize = '1.3em';
    domandaEl.style.fontWeight = 'bold';
    domandaEl.style.marginBottom = '12px';
    domandaEl.style.textAlign = 'center';
    domandaEl.style.color = '#222';
    domandaBox.appendChild(domandaEl);

    // Colonna destra: risposte
    const rightCol = document.createElement('div');
    rightCol.style.display = 'flex';
    rightCol.style.flexDirection = 'column';
    rightCol.style.justifyContent = 'center';
    rightCol.style.alignItems = 'flex-end';
    rightCol.style.height = '100%';
    rightCol.style.padding = '32px 5vw 32px 0';
    rightCol.style.gap = '100px';

    // Mescola le risposte
    let risposte = [
        { value: domanda.rispostaCorretta, isCorrect: true },
        { value: domanda.risposta1, isCorrect: false },
        { value: domanda.risposta2, isCorrect: false }
    ];
    risposte = risposte.sort(() => Math.random() - 0.5);

    // Calcola altezza box risposte
    const boxHeight = (Math.floor((0.75 * 60 * window.innerHeight / 100) / risposte.length)+60) + 'px';

    // Bottoni risposte grandi, verticali
    risposte.forEach(r => {
        const btn = document.createElement('button');
        btn.textContent = r.value;
        btn.style.margin = '0';
        btn.style.padding = '0 48px';
        btn.style.height = boxHeight;
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.fontSize = '1.35em';
        btn.style.fontWeight = 'bold';
        btn.style.borderRadius = '16px';
        btn.style.border = 'none';
        btn.style.background = 'rgb(35, 201, 209)'; // grigio 25% più scuro del bianco
        btn.style.color = '#FFF';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = 'rgb(0, 131, 145) 0px 35px 0px 0px';
        btn.style.transition = 'background 0.18s, color 0.18s, transform 0.18s, box-shadow 0.18s';
        btn.style.width = '550px';
        btn.style.textAlign = 'center';
        btn.style.textShadow = 'rgba(0, 0, 0, 0.35) 0px 5px 0px';
        btn.style.fontSize = '4em';

        // Effetto pressione su hover/click
        btn.onmouseover = () => {
            btn.style.background = 'rgb(35, 201, 209)';
            btn.style.transform = 'translateY(10px)';
            btn.style.boxShadow = 'rgb(0, 131, 145) 0px 15px 0px 0px';
        };
        btn.onmouseout = () => {
            btn.style.background = 'rgb(35, 201, 209)';
            btn.style.transform = 'none';
            btn.style.boxShadow = 'rgb(0, 131, 145) 0px 35px 0px 0px';
        };

        btn.onclick = () => {
            if (r.isCorrect) {
                // Animazione corretta: verde + salto doppio
                btn.style.background = '#27ae60';
                btn.style.color = '#fff';
                btn.style.boxShadow = '#1e864a 0px 15px 0px 0px';
                btn.style.transition = 'background 0.18s, color 0.18s';
                // Definisci animazione salto se non esiste
                if (!document.getElementById('jump-twice-style')) {
                    const style = document.createElement('style');
                    style.id = 'jump-twice-style';
                    style.innerHTML = `@keyframes jump-twice {
                        0% { transform: none; }
                        10% { transform: translateY(-18px); }
                        20% { transform: none; }
                        30% { transform: translateY(-14px); }
                        40% { transform: none; }
                        100% { transform: none; }
                    }`;
                    document.head.appendChild(style);
                }
                btn.style.animation = 'jump-twice 0.5s cubic-bezier(.36,1.5,.19,.97)';
                // Anima anche il personaggio
                const personaggioDiv = document.getElementById('domanda-personaggio-img');
                if (personaggioDiv) {
                    personaggioDiv.style.animation = 'jump-twice 0.5s cubic-bezier(.36,1.5,.19,.97)';
                }
                setTimeout(() => {
                    btn.style.animation = '';
                    if (personaggioDiv) personaggioDiv.style.animation = '';
                    modal.style.display = 'none';
                    if(mainContent) mainContent.classList.remove('blurred-bg');
                    setTimeout(() => {
                        lastBonusSteps = r.isCorrect ? (domanda.bonus_points ? domanda.bonus_points : defaultBonusPoints) : wrongAnswerPenality;
                        newStep();
                    }, 500);
                }, 500);
            } else {
                // Animazione errore: rosso + tremolio
                btn.style.background = '#e74c3c';
                btn.style.color = '#fff';
                btn.style.transition = 'background 0.18s, color 0.18s';
                btn.style.boxShadow = '#aa382c 0px 15px 0px 0px';
                btn.style.animation = 'shake-horizontal 0.5s cubic-bezier(.36,.07,.19,.97) both';
                // Definisci l'animazione shake se non esiste
                if (!document.getElementById('shake-horizontal-style')) {
                    const style = document.createElement('style');
                    style.id = 'shake-horizontal-style';
                    style.innerHTML = `@keyframes shake-horizontal {
                        10%, 90% { transform: translateX(-2px); }
                        20%, 80% { transform: translateX(4px); }
                        30%, 50%, 70% { transform: translateX(-8px); }
                        40%, 60% { transform: translateX(8px); }
                        100% { transform: none; }
                    }`;
                    document.head.appendChild(style);
                }
                // Ruota il personaggio di 35 gradi verso destra in contemporanea
                const personaggioDiv = document.getElementById('domanda-personaggio-img');
                if (personaggioDiv) {
                    // Sospendi idle
                    if (personaggioDiv._idleAnimFrame) {
                        cancelAnimationFrame(personaggioDiv._idleAnimFrame);
                        personaggioDiv._idleAnimFrame = null;
                    }
                    // Salva la trasformazione corrente
                    const idleTransform = personaggioDiv.style.transform || '';
                    personaggioDiv._oldTransform = idleTransform;
                    personaggioDiv.style.transition = 'transform 0.18s cubic-bezier(.36,.07,.19,.97)';
                    // Applica rotazione combinata
                    let baseTransform = idleTransform.replace(/rotate\([^)]*\)/, '');
                    personaggioDiv.style.transform = baseTransform + ' rotate(25deg)';
                }
                setTimeout(() => {
                    modal.style.display = 'none';
                    if(mainContent) mainContent.classList.remove('blurred-bg');
                    lastBonusSteps = 0;
                    // Ripristina la rotazione e idle dopo la chiusura
                    if (personaggioDiv) {
                        personaggioDiv.style.transition = 'transform 0.18s';
                        personaggioDiv.style.transform = personaggioDiv._oldTransform || '';
                        // Riavvia idle
                        setTimeout(() => {
                            let t = 0;
                            function idleAnim() {
                                t += 0.04;
                                const dx = Math.sin(t*1.2)*4;
                                const dy = Math.cos(t*1.7)*3;
                                personaggioDiv.style.transform = `translateY(0) translate(${dx}px, ${dy}px)`;
                                personaggioDiv._idleAnimFrame = requestAnimationFrame(idleAnim);
                            }
                            idleAnim();
                        }, 200);
                    }
                    newStep();
                }, 500);
            }
        };
        rightCol.appendChild(btn);
    });

    grid.appendChild(leftCol);
    grid.appendChild(rightCol);
    modal.appendChild(grid);
    modal.appendChild(domandaBox);
    modal.style.display = 'flex';
}

// Pioggia di emoji festa
function rainPartyEmojis() {
    const emoji = '🎉';
    const count = 32;
    for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        span.textContent = emoji;
        span.style.position = 'fixed';
        span.style.left = Math.random() * 100 + 'vw';
        span.style.top = '-48px';
        span.style.fontSize = (32 + Math.random() * 32) + 'px';
        span.style.pointerEvents = 'none';
        span.style.zIndex = 99999;
        span.style.transition = 'transform 1.1s linear, opacity 0.4s linear';
        document.body.appendChild(span);
        setTimeout(() => {
            span.style.transform = `translateY(${window.innerHeight + 80}px) rotate(${Math.random()*360}deg)`;
            span.style.opacity = '0.7';
        }, 10 + Math.random()*200);
        setTimeout(() => {
            span.remove();
        }, 1400 + Math.random()*400);
    }
}

function resolveBonusStep(playerId){
    console.log("bonus steps "+lastBonusSteps);
    // Esegui il movimento bonus e solo dopo passa allo step successivo
    movePieceToPositionWithStep(playerId, lastBonusSteps, true).then(() => {
        lastBonusSteps = 0;
        // Dopo che l'animazione è conclusa, attendi 0.5s e poi passa a END_TURN tramite newStep
        setTimeout(() => {
            newStep();
        }, ATTESA_POST_BONUS_STEP);
    });
}

function resolveEndTurn(playerId){
    console.log(getCurrentPlayerName()+" termina il turno.");
    // Dopo 0.5s passa automaticamente al prossimo step (nuovo turno)
    setTimeout(() => {
        newStep();
    }, ATTESA_POST_END_TURN);
}


// Rimuovi il box dado separato dalla pagina HTML
const diceResultBox = document.getElementById('dice-result-box');
if (diceResultBox) {
    diceResultBox.parentNode.removeChild(diceResultBox);
}

function rollDice(){
    return Math.floor(Math.random() * diceFaces) + 1;
}

async function movePieceToPositionWithStep(playerId, roll, isBonusStep) {
    stepAnimationInProgress = true;

    const direction = roll >= 0 ? 1 : -1;
    roll = Math.abs(roll);

    for (let i = 0; i < roll; i++) {
        const cellNumber = getPlayerPosition(playerId);
        setPlayerPosition(playerId, cellNumber + direction);
        takeStep(playerId, cellNumber + direction);
        // Pioggia di emoji solo nella fase bonus step
        if (isBonusStep) {
            rainPartyEmojis();
        }
        await new Promise(resolve => setTimeout(resolve, DURATA_ANIMAZIONE_MOVIMENTO)); // 0.5 secondi di attesa
    }

    stepAnimationInProgress = false;
}

function takeStep(playerId, cellNumber) {
    // Recupera la posizione della cella dalla mappa boardState
    if (typeof boardState !== 'undefined' && boardState.has(cellNumber)) {
        const pos = boardState.get(cellNumber);
        const mainContent = document.getElementById('main-content');
        const rect = mainContent.getBoundingClientRect();
        const xBase = (pos.x / 100) * rect.width;
        const yBase = (pos.y / 100) * rect.height;
        // Calcola quanti giocatori sono sulla stessa cella
        let playersOnCell = [];
        if (typeof getAllPlayers === 'function') {
            const allPlayers = getAllPlayers();
            for (let pid of allPlayers) {
                if (getPlayerPosition(pid) === cellNumber) {
                    playersOnCell.push(pid);
                }
            }
        } else if (typeof playerPositions === 'object') {
            // fallback se non c'è getAllPlayers
            for (let pid in playerPositions) {
                if (playerPositions[pid] === cellNumber) {
                    playersOnCell.push(pid);
                }
            }
        }
        // Se c'è solo un giocatore sulla cella, aggiorna la sua posizione normalmente
        if (playersOnCell.length <= 1) {
            const pin = document.getElementById(playerId);
            if (pin && pin.parentElement) {
                const pinWrapper = pin.parentElement;
                pinWrapper.style.left = (xBase - 16) + 'px';
                pinWrapper.style.top = (yBase - 32) + 'px';
            }
        } else {
            // Calcola offset per ogni giocatore sulla stessa cella
            const offsetRadius = 18; // px, distanza dal centro
            const angleStep = (Math.PI * 2) / playersOnCell.length;
            playersOnCell.forEach((pid, idx) => {
                const angle = idx * angleStep;
                const xOffset = Math.cos(angle) * offsetRadius;
                const yOffset = Math.sin(angle) * offsetRadius;
                const pin = document.getElementById(pid);
                if (pin && pin.parentElement) {
                    const pinWrapper = pin.parentElement;
                    pinWrapper.style.left = (xBase - 16 + xOffset) + 'px';
                    pinWrapper.style.top = (yBase - 32 + yOffset) + 'px';
                }
            });
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
    let text = `Turno: ${player} | Stato: ${state}`;
    if (state === 'BONUS_STEP') {
        text += ` | Bonus Points: ${lastBonusSteps}`;
    }
    indicator.textContent = text;
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

// DEBUG BAR
(function(){
    let debugBar = document.getElementById('debug-bar');
    if (!debugBar) {
        debugBar = document.createElement('div');
        debugBar.id = 'debug-bar';
        debugBar.style.position = 'fixed';
        debugBar.style.top = '0';
        debugBar.style.left = '0';
        debugBar.style.background = 'rgba(0,0,0,0.7)';
        debugBar.style.color = '#fff';
        debugBar.style.padding = '6px 18px';
        debugBar.style.zIndex = '12000';
        debugBar.style.fontSize = '1em';
        debugBar.style.display = 'flex';
        debugBar.style.gap = '12px';
        debugBar.style.alignItems = 'center';
        document.body.appendChild(debugBar);
    }
    // Bottone domanda placeholder
    let btn = document.getElementById('debug-domanda-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'debug-domanda-btn';
        btn.textContent = 'Domanda placeholder';
        btn.style.fontSize = '1em';
        btn.style.padding = '4px 12px';
        btn.style.borderRadius = '6px';
        btn.style.border = 'none';
        btn.style.background = '#eee';
        btn.style.color = '#222';
        btn.style.cursor = 'pointer';
        btn.onclick = function() {
            visualizzaDomanda('debug', {
                domanda: 'Quanto fa 0+0?',
                rispostaCorretta: '0',
                risposta1: '1',
                risposta2: '2',
                bonus_points: 1
            });
        };
        debugBar.appendChild(btn);
    }
})();

// ---
// Esplosione animata di numeri del dado
function explodeDiceNumbers(result, parentBox) {
    const rect = parentBox.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const count = 18;
    for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        span.textContent = result;
        span.style.position = 'fixed';
        span.style.left = centerX + 'px';
        span.style.top = centerY + 'px';
        span.style.fontSize = (32 + Math.random() * 32) + 'px';
        span.style.fontWeight = 'bold';
        span.style.color = '#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
        span.style.pointerEvents = 'none';
        span.style.zIndex = 12001;
        span.style.opacity = '1';
        span.style.transition = 'transform 0.7s cubic-bezier(.36,1.5,.19,.97), opacity 0.7s linear';
        document.body.appendChild(span);
        // Direzione random
        const angle = Math.random() * 2 * Math.PI;
        const distance = 120 + Math.random() * 80;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        setTimeout(() => {
            span.style.transform = `translate(${dx}px, ${dy}px) scale(${0.7 + Math.random()*0.7}) rotate(${Math.random()*360}deg)`;
            span.style.opacity = '0';
        }, 10);
        setTimeout(() => {
            span.remove();
        }, 800);
    }
}
