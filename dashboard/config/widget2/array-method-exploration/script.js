// script.js
// Purpose: Exploration lab for Array methods

// --- State ---
const startPrices = [10.00, 25.50, 5.00, 99.99];
let originalData = []; 

// --- DOM Elements ---
const originalListEl = document.getElementById('originalList');
const resultListEl = document.getElementById('resultList');
const originalCard = document.getElementById('originalCard');
const originalStatus = document.getElementById('originalStatus');
const resultStatus = document.getElementById('resultStatus');

// Buttons
const mapBtn = document.getElementById('mapBtn');
const filterBtn = document.getElementById('filterBtn');
const loopCopyBtn = document.getElementById('loopCopyBtn');
const forEachBtn = document.getElementById('forEachBtn');
const loopBtn = document.getElementById('loopBtn');
const resetBtn = document.getElementById('resetBtn');

// --- Helper: Rendering ---
const render = (list, data) => {
  list.innerHTML = '';
  data.forEach(price => {
    const li = document.createElement('li');
    li.textContent = '$' + price.toFixed(2);
    list.appendChild(li);
  });
};

// --- Helper: Reset ---
const reset = () => {
  originalData = [...startPrices]; 
  
  render(originalListEl, originalData);
  resultListEl.innerHTML = '';
  
  originalCard.className = 'card';
  originalStatus.textContent = 'Ready';
  
  resultStatus.textContent = 'Waiting...';
  resultStatus.style.backgroundColor = '#cbd5e0';
  resultStatus.style.color = 'black';
};

// --- LOGIC: Pure Methods ---

const runMap = (list) => {
  return list.map(price => price - 1);
};

const runFilter = (list) => {
  return list.filter(price => price > 25);
};

const runLoopCopy = (list) => {
  const newList = [];
  for (let i = 0; i < list.length; i++) {
    newList.push(list[i] - 1);
  }
  return newList;
};

// --- LOGIC: Mutating Methods ---

const runForEach = (list) => {
  list.forEach((price, index) => {
    list[index] = price - 1; 
  });
};

const runLoopMutate = (list) => {
  for (let i = 0; i < list.length; i++) {
    list[i] = list[i] - 1;
  }
};

// --- Main Handler ---

const handleAction = (actionFn, isPure) => {
  // Snapshot for comparison
  const beforeSnapshot = JSON.stringify(originalData);

  // Run function
  const returnedValue = actionFn(originalData);

  // Check for changes
  const afterSnapshot = JSON.stringify(originalData);
  const wasMutated = beforeSnapshot !== afterSnapshot;

  // Update Input Display
  render(originalListEl, originalData);
  if (wasMutated) {
    originalCard.className = 'card mutated'; 
    originalStatus.textContent = 'Original Modified';
  } else {
    originalCard.className = 'card safe';
    originalStatus.textContent = 'Unchanged';
  }

  // Update Output Display
  if (isPure && returnedValue) {
    render(resultListEl, returnedValue);
    resultStatus.textContent = 'New Array Returned';
    resultStatus.style.backgroundColor = '#38b2ac';
    resultStatus.style.color = 'white';
  } else {
    resultListEl.innerHTML = '<li>(undefined)</li>';
    resultStatus.textContent = 'No Return Value';
    resultStatus.style.backgroundColor = '#cbd5e0';
    resultStatus.style.color = 'black';
  }
};

// --- Event Listeners ---

mapBtn.addEventListener('click', () => handleAction(runMap, true));
filterBtn.addEventListener('click', () => handleAction(runFilter, true));
loopCopyBtn.addEventListener('click', () => handleAction(runLoopCopy, true));

forEachBtn.addEventListener('click', () => handleAction(runForEach, false));
loopBtn.addEventListener('click', () => handleAction(runLoopMutate, false));

resetBtn.addEventListener('click', reset);

// Initialize
reset();