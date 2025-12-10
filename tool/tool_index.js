let scale = 1;
let minScale = 1;
let maxScale = 4;
let startX = 0;
let startY = 0;
let originX = 0;
let originY = 0;
let isDragging = false;
let lastX = 0;
let lastY = 0;
let isZoomActive = false;
let isPointerMode = false;
const pointerBtn = document.getElementById("toggle-pointer");
const clearPointsBtn = document.getElementById("clear-points");
const exportBtn = document.getElementById("export-points");
const importBtn = document.getElementById("import-points");
const mainContent = document.getElementById("main-content");
const pointContainer = document.getElementById("point-container");
const mainContainer = document.getElementById("main-container");
let debugDots = [];
let questionsData = [];

const map = document.getElementById("map");
const mapBackground = document.getElementById("map-background");
const importModal = document.getElementById("import-modal");
const jsonFileInput = document.getElementById("json-file-input");
const closeImportModalBtn = document.getElementById("close-import-modal");
const loadJsonPointsBtn = document.getElementById("load-json-points");
const importErrorDiv = document.getElementById("import-error");
const questionsModal = document.getElementById("questions-modal");
const closeQuestionsModalBtn = document.getElementById("close-questions-modal");
const exportAllBtn = document.getElementById("export-all-btn");
const imageContainer = document.querySelector(".image-container");

function setTransform() {
  //mainContainer.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
}

function centerMap() {
  // Centra la "mappa" (div) nel contenitore
  const containerRect = mainContent.getBoundingClientRect();
  const mapRect = map.getBoundingClientRect();
  // Usa la dimensione del contenitore per centrare la mappa
  originX = (containerRect.width - mapRect.width) / 2;
  originY = (containerRect.height - mapRect.height) / 2;
  setTransform();
}

document.addEventListener("mousemove", function (e) {});
document.addEventListener("mouseup", function () {});

// Non c'è più evento load, centra la mappa al DOMContentLoaded
window.addEventListener("DOMContentLoaded", function () {
  centerMap();
});

map.addEventListener("wheel", function (e) {
  if (!isZoomActive) return;
  e.preventDefault();
  const rect = map.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const prevScale = scale;
  if (e.deltaY < 0) {
    scale = Math.min(maxScale, scale + 0.1);
  } else {
    scale = Math.max(minScale, scale - 0.1);
  }
  // Zoom centrato sul punto del mouse
  originX -= mouseX / prevScale - mouseX / scale;
  originY -= mouseY / prevScale - mouseY / scale;
  setTransform();
  if (scale === 1) {
    centerMap();
  }
});

map.addEventListener("mousedown", function (e) {
  if (scale === 1) return;
  isDragging = true;
  map.classList.add("zooming");
  startX = e.clientX;
  startY = e.clientY;
  lastX = originX;
  lastY = originY;
});

document.addEventListener("mousemove", function (e) {
  if (!isDragging) return;
  originX = lastX + (e.clientX - startX);
  originY = lastY + (e.clientY - startY);
  setTransform();
});

document.addEventListener("mouseup", function () {
  isDragging = false;
  map.classList.remove("zooming");
});

// Imposta la posizione iniziale
// Ora gestito da DOMContentLoaded

function blurMain(isBlur) {
  if (isBlur) {
    mainContent.style.filter = "blur(3px)";
  } else {
    mainContent.style.filter = "none";
  }
}

function addDebugDot(mainContent, debugDots, x, y, cella) {
  const dot = document.createElement("div");
  dot.className = "debug-dot";
  // Calcola la percentuale rispetto alla dimensione del contenitore
  const containerRect = mainContent.getBoundingClientRect();
  const leftPercent = ((x - 12) / containerRect.width) * 100;
  const topPercent = ((y - 12) / containerRect.height) * 100;
  dot.style.left = leftPercent + "%";
  dot.style.top = topPercent + "%";
  dot.dataset.x = x;
  dot.dataset.y = y;
  dot.dataset.cella = cella;
  dot.style.width = "24px";
  dot.style.height = "24px";
  dot.style.display = "flex";
  dot.style.alignItems = "center";
  dot.style.justifyContent = "center";
  dot.style.fontWeight = "bold";
  dot.style.fontSize = "1.1em";
  dot.style.color = "#222";
  dot.innerText = cella;
  pointContainer.appendChild(dot);
  debugDots.push({ el: dot, x, y, cella });
}

function removeAllDebugDots(debugDots) {
  debugDots.forEach((dot) => dot.el.remove());
  debugDots.length = 0;
}

function removeDebugDot(debugDots, el) {
  const idx = debugDots.findIndex((d) => d.el === el);
  if (idx !== -1) {
    debugDots[idx].el.remove();
    debugDots.splice(idx, 1);
  }
}

async function importPoints(mainContent, debugDots) {
  try {
    const response = await fetch("database/celle.json");
    if (!response.ok) throw new Error("Impossibile leggere celle.json");
    const points = await response.json();
    removeAllDebugDots(debugDots);
    points.forEach((p, i) => {
      addDebugDot(mainContent, debugDots, p.x, p.y, p.cella ?? i + 1);
    });
    alert("Punti importati!");
  } catch (err) {
    alert("Errore importazione: " + err.message);
  }
}

pointerBtn.addEventListener("click", () => {
  isPointerMode = !isPointerMode;
  pointerBtn.classList.toggle("active", isPointerMode);
  mainContent.style.cursor = isPointerMode ? "crosshair" : "";
  // Nascondi/mostra i bottoni in base alla modalità
  clearPointsBtn.style.display = isPointerMode
    ? "inline-block"
    : "inline-block";
});

clearPointsBtn.addEventListener("click", function () {
  removeAllDebugDots(debugDots);
});

mainContent.addEventListener("click", function (e) {
  if (e.target.classList.contains("debug-dot")) {
    // Apri la modale domande della cella
    const cella = e.target.dataset.cella;
    openCellQuestionsModal(parseInt(cella));
    return;
  }
  if (!isPointerMode || e.button !== 0) return;
  const rect = mainContent.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  addDebugDot(mainContent, debugDots, x, y, debugDots.length + 1);
});

mainContent.addEventListener("contextmenu", function (e) {
  if (!isPointerMode) return;
  if (e.target.classList.contains("debug-dot")) {
    e.preventDefault();
    const x = e.target.dataset.x;
    const y = e.target.dataset.y;
    console.log(`Coordinate punto: x=${x}, y=${y}`);
  } else {
    e.preventDefault();
  }
});

importBtn.addEventListener("click", function () {
  importModal.style.display = "flex";
  importErrorDiv.style.display = "none";
  importErrorDiv.textContent = "";
  jsonFileInput.value = "";
});
closeImportModalBtn.addEventListener("click", function () {
  importModal.style.display = "none";
  importErrorDiv.style.display = "none";
  importErrorDiv.textContent = "";
  jsonFileInput.value = "";
});
loadJsonPointsBtn.addEventListener("click", function () {
  importErrorDiv.style.display = "none";
  importErrorDiv.textContent = "";
  const file = jsonFileInput.files[0];
  if (!file) {
    importErrorDiv.textContent = "Seleziona un file JSON.";
    importErrorDiv.style.display = "block";
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const points = JSON.parse(e.target.result);
      if (!Array.isArray(points))
        throw new Error("Il file JSON deve essere un array di punti.");
      removeAllDebugDots(debugDots);
      points.forEach((p, i) => {
        if (typeof p.x !== "number" || typeof p.y !== "number")
          throw new Error("Ogni punto deve avere x e y numerici.");
        addDebugDot(mainContent, debugDots, p.x, p.y, p.cella ?? i + 1);
      });
      importModal.style.display = "none";
      // Messaggio di caricamento rimosso
    } catch (err) {
      importErrorDiv.textContent = "Errore: " + err.message;
      importErrorDiv.style.display = "block";
    }
  };
  reader.onerror = function () {
    importErrorDiv.textContent = "Errore lettura file.";
    importErrorDiv.style.display = "block";
  };
  reader.readAsText(file);
});
closeQuestionsModalBtn.addEventListener("click", function () {
  questionsModal.style.display = "none";
});

exportBtn.addEventListener("click", function () {
  const points = debugDots.map((d) => ({
    cella: d.cella,
    x: Math.round(d.x),
    y: Math.round(d.y),
  }));
  const json = JSON.stringify(points, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "celle.json";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
});

exportAllBtn.addEventListener("click", function () {
  // Costruisci la struttura richiesta
  const database = debugDots.map((d, idx) => {
    // Trova le domande associate a questa cella
    const q = questionsData[idx] || {};
    let domande = [];
    if (q.domanda && q.rispostaCorretta) {
      domande.push({
        domanda: q.domanda,
        rispostaCorretta: q.rispostaCorretta,
        altreRisposte: [q.risposta1 || "", q.risposta2 || "", ""].filter(
          (r) => r !== ""
        ),
      });
    }
    // Se ci sono più domande, puoi estendere qui
    return {
      cella: d.cella,
      posizione: { x: Math.round(d.x), y: Math.round(d.y) },
      domande: domande,
    };
  });
  // Genera il JS
  const js = "let database = " + JSON.stringify(database, null, 2) + ";";
  const blob = new Blob([js], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "game-settings.js";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
});

window.addEventListener("DOMContentLoaded", function () {
  if (
    typeof cellePreload !== "undefined" &&
    Array.isArray(cellePreload) &&
    cellePreload.length > 0
  ) {
    importPreloadedCells(cellePreload);
  }
});

function importPreloadedCells(cells) {
  removeAllDebugDots(debugDots);
  cells.forEach((p, i) => {
    if (typeof p.x !== "number" || typeof p.y !== "number")
      throw new Error("Ogni punto deve avere x e y numerici.");
    addDebugDot(mainContent, debugDots, p.x, p.y, p.cella ?? i + 1);
  });
}

function openCellQuestionsModal(cella) {
  // Trova o crea le domande associate a questa cella
  let idx = debugDots.findIndex((d) => d.cella == cella);
  if (idx === -1) return;
  // Render modale
  const modal = document.getElementById("cell-questions-modal");
  const title = document.getElementById("cell-questions-title");
  const container = document.getElementById("cell-questions-cards-container");
  title.textContent = "Domande cella " + cella;
  container.innerHTML = "";
  // Se non esiste la struttura domande, la inizializzo
  if (questionsData[idx] != undefined) {
    if (!questionsData[idx].domande) {
      questionsData[idx].domande = [
        {
          domanda: questionsData[idx].domanda || "",
          rispostaCorretta: questionsData[idx].rispostaCorretta || "",
          risposta1: questionsData[idx].risposta1 || "",
          risposta2: questionsData[idx].risposta2 || "",
        },
      ];
    }
    // Renderizza tutte le domande per la cella
    questionsData[idx].domande.forEach((q, qIdx) => {
      const card = document.createElement("div");
      card.className = "question-card";
      card.style =
        "border:1px solid #ccc; border-radius:8px; padding:12px; background:#fafafa; position:relative; margin-bottom:8px;";
      card.innerHTML = `
                    <button type='button' data-qidx='${qIdx}' class='close-card-btn' style='position:absolute; top:8px; right:8px;'>X</button>
                    <div style=\"margin-bottom:8px;\"><label>Domanda: <input type=\"text\" value=\"${
                      q.domanda || ""
                    }\" data-field=\"domanda\" data-qidx=\"${qIdx}\" /></label></div>
                    <div style=\"margin-bottom:8px;\"><label>R. Corretta: <input type=\"text\" class=\"input-risp\" value=\"${
                      q.rispostaCorretta || ""
                    }\" data-field=\"rispostaCorretta\" data-qidx=\"${qIdx}\" /></label></div>
                    <div style=\"margin-bottom:8px;\"><label>R. Errata 1: <input type=\"text\" class=\"input-err\" value=\"${
                      q.risposta1 || ""
                    }\" data-field=\"risposta1\" data-qidx=\"${qIdx}\" /></label></div>
                    <div style=\"margin-bottom:8px;\"><label>R. Errata 2: <input type=\"text\" class=\"input-err\" value=\"${
                      q.risposta2 || ""
                    }\" data-field=\"risposta2\" data-qidx=\"${qIdx}\" /></label></div>
                `;
      container.appendChild(card);
    });
  }
  // Listener input
  container.querySelectorAll('input[type="text"]').forEach((input) => {
    input.addEventListener("input", function (e) {
      const qIdx = parseInt(e.target.getAttribute("data-qidx"));
      const field = e.target.getAttribute("data-field");
      questionsData[idx].domande[qIdx][field] = e.target.value;
    });
  });
  // Listener chiudi card
  container.querySelectorAll(".close-card-btn").forEach((btn) => {
    btn.onclick = function (e) {
      const qIdx = parseInt(e.target.getAttribute("data-qidx"));
      questionsData[idx].domande.splice(qIdx, 1);
      openCellQuestionsModal(cella);
    };
  });
  // Bottone aggiungi domanda
  let addBtn = document.getElementById("add-cell-question");
  if (!addBtn) {
    addBtn = document.createElement("button");
    addBtn.id = "add-cell-question";
    addBtn.textContent = "+";
    addBtn.style =
      "width:40px; height:40px; font-weight:bolder; font-size:1.2em; align-self:center; margin-bottom:16px;";
    container.parentNode.insertBefore(addBtn, container.nextSibling);
  }

  addBtn.onclick = function () {
    if (questionsData[idx] == undefined) {
      questionsData[idx] = {
        cella: idx,
        posizione: { x: debugDots[idx].x, y: debugDots[idx].y },
        domande: [],
      };
    }

    if (questionsData[idx] != undefined) {
      questionsData[idx].domande.push({
        domanda: "",
        rispostaCorretta: "",
        risposta1: "",
        risposta2: "",
      });
      openCellQuestionsModal(cella);
    }
  };
  // Bottone chiudi
  const closeBtn = document.getElementById("close-cell-questions-modal");
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };
  modal.style.display = "flex";
}
