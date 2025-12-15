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
let isDragMode = false;
let isDeleteMode = false;
let draggedDot = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
const pointerBtn = document.getElementById("toggle-pointer");
const dragBtn = document.getElementById("toggle-drag");
const deleteBtn = document.getElementById("toggle-delete");
const clearPointsBtn = document.getElementById("clear-points");
const exportBtn = document.getElementById("export-points");
const importBtn = document.getElementById("import-points");
const loadImgBtn = document.getElementById("load-img-btn");
const imgUploadModal = document.getElementById("img-upload-modal");
const imgUploadCardsContainer = document.getElementById("img-upload-cards-container");
const addImgUploadCardBtn = document.getElementById("add-img-upload-card");
const uploadImgBtn = document.getElementById("upload-img-btn");
const closeImgUploadModalBtn = document.getElementById("close-img-upload-modal");
const imgUploadError = document.getElementById("img-upload-error");
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
let imageLayersBase64 = [];

document.addEventListener("mousemove", function (e) {});
document.addEventListener("mouseup", function () {});

// Non c'è più evento load, centra la mappa al DOMContentLoaded
window.addEventListener("DOMContentLoaded", function () {
  const imgUploadModal = document.getElementById("img-upload-modal");
  const imgUploadCardsContainer = document.getElementById("img-upload-cards-container");
  const addImgUploadCardBtn = document.getElementById("add-img-upload-card");
  const uploadImgBtn = document.getElementById("upload-img-btn");
  const closeImgUploadModalBtn = document.getElementById("close-img-upload-modal");
  const imgUploadError = document.getElementById("img-upload-error");
  const imageContainer = document.querySelector(".image-container");

  function createImgUploadCard(idx) {
    const card = document.createElement("div");
    card.className = "img-upload-card";
    card.style = "display:flex; align-items:center; gap:8px;";
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style = "flex:1;";
    input.setAttribute("data-layer-idx", idx);
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "x";
    removeBtn.title = "Rimuovi layer";
    removeBtn.onclick = function () {
      card.remove();
      updateLayerIndices();
    };
    card.appendChild(input);
    card.appendChild(removeBtn);
    return card;
  }

  function updateLayerIndices() {
    Array.from(imgUploadCardsContainer.children).forEach((card, idx) => {
      const input = card.querySelector('input[type="file"]');
      if (input) input.setAttribute("data-layer-idx", idx);
    });
  }

  function resetImgUploadModal() {
    imgUploadCardsContainer.innerHTML = "";
    imgUploadError.style.display = "none";
    imgUploadError.textContent = "";
    // Aggiungi almeno una card
    imgUploadCardsContainer.appendChild(createImgUploadCard(0));
  }

  if (loadImgBtn) {
    loadImgBtn.addEventListener("click", function () {
      imgUploadModal.style.display = "flex";
      resetImgUploadModal();
    });
  }
  if (closeImgUploadModalBtn) {
    closeImgUploadModalBtn.addEventListener("click", function () {
      imgUploadModal.style.display = "none";
      resetImgUploadModal();
    });
  }
  if (addImgUploadCardBtn) {
    addImgUploadCardBtn.addEventListener("click", function () {
      const idx = imgUploadCardsContainer.children.length;
      imgUploadCardsContainer.appendChild(createImgUploadCard(idx));
    });
  }
  if (uploadImgBtn) {
    uploadImgBtn.addEventListener("click", function () {
      imgUploadError.style.display = "none";
      imgUploadError.textContent = "";
      // Svuota image-container
      while (imageContainer.firstChild) imageContainer.removeChild(imageContainer.firstChild);
      // Svuota array base64 globale
      imageLayersBase64 = [];
      // Carica i layer in ordine
      const cards = Array.from(imgUploadCardsContainer.children);
      let loaded = 0;
      let toLoad = cards.length;
      if (toLoad === 0) {
        imgUploadError.textContent = "Aggiungi almeno un layer.";
        imgUploadError.style.display = "block";
        return;
      }
      cards.forEach((card, idx) => {
        const input = card.querySelector('input[type="file"]');
        if (!input || !input.files || !input.files[0]) {
          // Salta layer vuoti
          imageLayersBase64[idx] = null;
          loaded++;
          if (loaded === toLoad) {
            imgUploadModal.style.display = "none";
            resetImgUploadModal();
            // Rimuovi eventuali null
            imageLayersBase64 = imageLayersBase64.filter(x => x);
          }
          return;
        }
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
          const url = e.target.result;
          const div = document.createElement("div");
          div.className = "bg-image";
          div.style.backgroundImage = `url('${url}')`;
          div.style.zIndex = 2 + idx;
          imageContainer.appendChild(div);
          imageLayersBase64[idx] = url;
          loaded++;
          if (loaded === toLoad) {
            imgUploadModal.style.display = "none";
            resetImgUploadModal();
            // Rimuovi eventuali null
            imageLayersBase64 = imageLayersBase64.filter(x => x);
          }
        };
        reader.onerror = function () {
          imgUploadError.textContent = `Errore caricamento immagine layer ${idx + 1}`;
          imgUploadError.style.display = "block";
          imageLayersBase64[idx] = null;
          loaded++;
          if (loaded === toLoad) {
            imgUploadModal.style.display = "none";
            resetImgUploadModal();
            imageLayersBase64 = imageLayersBase64.filter(x => x);
          }
        };
        reader.readAsDataURL(file);
      });
    });
  }
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

function deactivateAllModes() {
  isPointerMode = false;
  isDragMode = false;
  isDeleteMode = false;
  pointerBtn.classList.remove("active");
  dragBtn.classList.remove("active");
  deleteBtn.classList.remove("active");
  mainContent.style.cursor = "";
}

pointerBtn.addEventListener("click", () => {
  if (isPointerMode) {
    deactivateAllModes();
    return;
  }
  deactivateAllModes();
  isPointerMode = true;
  pointerBtn.classList.add("active");
  mainContent.style.cursor = "crosshair";
});

dragBtn.addEventListener("click", () => {
  if (isDragMode) {
    deactivateAllModes();
    return;
  }
  deactivateAllModes();
  isDragMode = true;
  dragBtn.classList.add("active");
  mainContent.style.cursor = "grab";
});

deleteBtn.addEventListener("click", () => {
  if (isDeleteMode) {
    deactivateAllModes();
    return;
  }
  deactivateAllModes();
  isDeleteMode = true;
  deleteBtn.classList.add("active");
  mainContent.style.cursor = "not-allowed";
});

clearPointsBtn.addEventListener("click", function () {
  if (confirm("Sei sicuro di voler cancellare tutti i punti?")) {
    removeAllDebugDots(debugDots);
  }
});

mainContent.addEventListener("click", function (e) {
  if (e.target.classList.contains("debug-dot")) {
    if (isDeleteMode) {
      // Cancella punto
      removeDebugDot(debugDots, e.target);
      return;
    }
    // NIENTE apertura modale domande con click sinistro
  }
  if (!isPointerMode || e.button !== 0) return;
  const rect = mainContent.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  addDebugDot(mainContent, debugDots, x, y, debugDots.length + 1);
});

mainContent.addEventListener("contextmenu", function (e) {
  if (e.target.classList.contains("debug-dot")) {
    e.preventDefault();
    if (!isDeleteMode && !isDragMode) {
      const cella = e.target.dataset.cella;
      openCellQuestionsModal(parseInt(cella));
    }
    return;
  }
  if (!isPointerMode) return;
  e.preventDefault();
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
        const px = getPixelCoords(p.x, p.y);
        addDebugDot(mainContent, debugDots, px.x, px.y, p.cella ?? i + 1);
      });
      importModal.style.display = "none";
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

exportAllBtn.addEventListener("click", function () {
  const celle = debugDots.map((d, idx) => {
    const perc = getPercentCoords(d.x, d.y);
    let domande = [];
    if (questionsData[idx] && Array.isArray(questionsData[idx].domande)) {
      domande = questionsData[idx].domande.map(q => ({
        domanda: q.domanda || "",
        rispostaCorretta: q.rispostaCorretta || "",
        risposta1: q.risposta1 || "",
        risposta2: q.risposta2 || "",
        bonus_points: q.bonus_points || 0
      }));
    }
    return {
      cella: d.cella,
      posizione: { x: perc.x, y: perc.y },
      domande: domande,
    };
  });
  const exportObj = {
    celle: celle,
    layers: imageLayersBase64.slice()
  };
  const js = "var settings = " + JSON.stringify(exportObj, null, 2) + ";";
  const blob = new Blob([js], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "content.js";
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
                    <div style="margin-bottom:8px;"><label>Bonus Points: <input type="number" min="0" max="99" value="${q.bonus_points || 0}" data-field="bonus_points" data-qidx="${qIdx}" style="width:60px;" /></label></div>
                `;
      container.appendChild(card);
    });
  }
  // Listener input
  container.querySelectorAll('input[type="text"],input[type="number"]').forEach((input) => {
    input.addEventListener("input", function (e) {
      const qIdx = parseInt(e.target.getAttribute("data-qidx"));
      const field = e.target.getAttribute("data-field");
      if(field === 'bonus_points') {
        questionsData[idx].domande[qIdx][field] = parseInt(e.target.value) || 0;
      } else {
        questionsData[idx].domande[qIdx][field] = e.target.value;
      }
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
        bonus_points: 0
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

// Gestione drag & drop dei punti
pointContainer.addEventListener("mousedown", function (e) {
  if (!isDragMode) return;
  if (!e.target.classList.contains("debug-dot")) return;
  draggedDot = e.target;
  const rect = pointContainer.getBoundingClientRect();
  // Calcola offset rispetto al centro del punto
  dragOffsetX = e.clientX - rect.left - (draggedDot.offsetLeft + draggedDot.offsetWidth / 2);
  dragOffsetY = e.clientY - rect.top - (draggedDot.offsetTop + draggedDot.offsetHeight / 2);
  document.body.style.cursor = "grabbing";
});

document.addEventListener("mousemove", function (e) {
  if (!isDragMode || !draggedDot) return;
  let rect = pointContainer.getBoundingClientRect();
  // Se l'altezza è zero, la imposta come quella di mainContent
  if (rect.height === 0) {
    pointContainer.style.height = mainContent.offsetHeight + "px";
    rect = pointContainer.getBoundingClientRect();
  }
  // Nuova posizione centro punto
  let x = e.clientX - rect.left - dragOffsetX;
  let y = e.clientY - rect.top - dragOffsetY;
  // Limita il centro del punto all'interno del contenitore
  x = Math.max(draggedDot.offsetWidth / 2, Math.min(x, rect.width - draggedDot.offsetWidth / 2));
  y = Math.max(draggedDot.offsetHeight / 2, Math.min(y, rect.height - draggedDot.offsetHeight / 2));
  // Aggiorna posizione
  draggedDot.style.left = ((x - draggedDot.offsetWidth / 2) / rect.width * 100) + "%";
  draggedDot.style.top = ((y - draggedDot.offsetHeight / 2) / rect.height * 100) + "%";
});

document.addEventListener("mouseup", function (e) {
  if (!isDragMode || !draggedDot) return;
  const rect = pointContainer.getBoundingClientRect();
  let x = e.clientX - rect.left - dragOffsetX;
  let y = e.clientY - rect.top - dragOffsetY;
  x = Math.max(draggedDot.offsetWidth / 2, Math.min(x, rect.width - draggedDot.offsetWidth / 2));
  y = Math.max(draggedDot.offsetHeight / 2, Math.min(y, rect.height - draggedDot.offsetHeight / 2));
  // Aggiorna dataset e array debugDots
  draggedDot.dataset.x = Math.round(x);
  draggedDot.dataset.y = Math.round(y);
  const cella = draggedDot.dataset.cella;
  const idx = debugDots.findIndex((d) => d.cella == cella);
  if (idx !== -1) {
    debugDots[idx].x = Math.round(x);
    debugDots[idx].y = Math.round(y);
  }
  draggedDot = null;
  document.body.style.cursor = "";
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    const modal = document.getElementById("cell-questions-modal");
    if (modal && modal.style.display === "flex") {
      const closeBtn = document.getElementById("close-cell-questions-modal");
      if (closeBtn) closeBtn.click();
    }
  }
});

function getPercentCoords(x, y) {
  const rect = mainContent.getBoundingClientRect();
  return {
    x: Math.round((x / rect.width) * 10000) / 100, // due decimali
    y: Math.round((y / rect.height) * 10000) / 100
  };
}
function getPixelCoords(xPerc, yPerc) {
  const rect = mainContent.getBoundingClientRect();
  return {
    x: (xPerc / 100) * rect.width,
    y: (yPerc / 100) * rect.height
  };
}

uploadImgBtn.addEventListener("click", function () {
  imgUploadError.style.display = "none";
  imgUploadError.textContent = "";
  const files = Array.from(imgFileInput.files);
  if (!files.length) {
    imgUploadError.textContent = "Seleziona almeno un'immagine.";
    imgUploadError.style.display = "block";
    return;
  }
  // Carica tutte le immagini in ordine
  const imageContainer = document.querySelector(".image-container");
  let loaded = 0;
  files.forEach((file, idx) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const url = e.target.result;
      const div = document.createElement("div");
      div.className = "bg-image";
      div.style.backgroundImage = `url('${url}')`;
      div.style.zIndex = 2 + idx; // z-index progressivo
      imageContainer.appendChild(div);
      loaded++;
      if (loaded === files.length) {
        imgUploadModal.style.display = "none";
        imgFileInput.value = "";
      }
    };
    reader.onerror = function () {
      imgUploadError.textContent = `Errore caricamento immagine ${file.name}`;
      imgUploadError.style.display = "block";
    };
    reader.readAsDataURL(file);
  });
});

// Gestione importazione tutto
const importAllBtn = document.getElementById("import-all-btn");
if (importAllBtn) {
  importAllBtn.addEventListener("click", function () {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".js";
    input.style.display = "none";
    document.body.appendChild(input);
    input.addEventListener("change", function () {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (ev) {
        let settings = null;
        try {
          // Esegue il file JS in sandbox per estrarre la variabile settings
          const text = ev.target.result;
          const sandbox = {};
          (function() { eval(text); Object.assign(sandbox, typeof settings !== 'undefined' ? {settings} : {}); })();
          if (!sandbox.settings) throw new Error("File non valido: manca la variabile settings");
          settings = sandbox.settings;
        } catch (err) {
          alert("Errore importazione: " + err.message);
          document.body.removeChild(input);
          return;
        }
        // Valida struttura
        if (!Array.isArray(settings.celle) || !Array.isArray(settings.layers)) {
          alert("File non valido: struttura mancante");
          document.body.removeChild(input);
          return;
        }
        // Svuota punti, domande e immagini
        removeAllDebugDots(debugDots);
        questionsData.length = 0;
        while (imageContainer.firstChild) imageContainer.removeChild(imageContainer.firstChild);
        imageLayersBase64 = [];
        // Popola celle e domande
        settings.celle.forEach((c, idx) => {
          const pos = getPixelCoords(c.posizione.x, c.posizione.y);
          addDebugDot(mainContent, debugDots, pos.x, pos.y, c.cella);
          if (Array.isArray(c.domande)) {
            questionsData[idx] = { cella: c.cella, posizione: c.posizione, domande: c.domande };
          } else {
            questionsData[idx] = { cella: c.cella, posizione: c.posizione, domande: [] };
          }
        });
        // Popola immagini di sfondo
        settings.layers.forEach((url, idx) => {
          if (!url) return;
          const div = document.createElement("div");
          div.className = "bg-image";
          div.style.backgroundImage = `url('${url}')`;
          div.style.zIndex = 2 + idx;
          imageContainer.appendChild(div);
          imageLayersBase64[idx] = url;
        });
        alert("Importazione completata!");
        document.body.removeChild(input);
      };
      reader.readAsText(file);
    });
    input.click();
  });
}
