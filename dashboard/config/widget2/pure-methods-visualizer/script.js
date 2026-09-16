const BASE = ['tutoring', 'mentoring', 'coding', 'art', 'music'];

const ITEM_STAGGER_MS = 60;
const ITEM_DELAY_MS = 30;
const VERDICT_FADE_MS = 20;
// Clearing first, then setting on a later tick, is what makes a repeat run announce
// again — an unchanged live region says nothing.
const ANNOUNCE_RESET_MS = 50;

const liveRegion = document.getElementById('aria-live');

function announce(message) {
  liveRegion.textContent = '';
  setTimeout(() => {
    liveRegion.textContent = message;
  }, ANNOUNCE_RESET_MS);
}

function makeItems(containerId, items, classes) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach((value, index) => {
    const element = document.createElement('span');
    element.className = 'item ' + (classes[index] || '');
    element.textContent = '"' + value + '"';
    element.setAttribute('role', 'listitem');
    container.appendChild(element);
    setTimeout(
      () => element.classList.add('visible'),
      index * ITEM_STAGGER_MS + ITEM_DELAY_MS
    );
  });
}

function showVerdict(verdictId, type) {
  const verdict = document.getElementById(verdictId);
  verdict.className = 'verdict ' + type;
  verdict.style.display = 'block';
  setTimeout(() => {
    verdict.style.opacity = '1';
  }, VERDICT_FADE_MS);
}

const runners = {
  filter() {
    const result = BASE.filter(role => role !== 'art');
    makeItems('filter-orig', [...BASE], BASE.map(() => 'same'));
    makeItems('filter-result', result, result.map(() => 'new'));
    showVerdict('filter-verdict', 'pure');
    announce(
      '.filter() ran. Original array is unchanged: ' +
        BASE.join(', ') +
        '. Result is a new array: ' +
        result.join(', ') +
        '. This is a pure method.'
    );
  },

  map() {
    const result = BASE.map(role => role.toUpperCase());
    makeItems('map-orig', [...BASE], BASE.map(() => 'same'));
    makeItems('map-result', result, result.map(() => 'new'));
    showVerdict('map-verdict', 'pure');
    announce(
      '.map() ran. Original array is unchanged: ' +
        BASE.join(', ') +
        '. Result is a new array: ' +
        result.join(', ') +
        '. This is a pure method.'
    );
  },

  forEach() {
    const mutated = [...BASE];
    mutated.forEach((role, index) => {
      mutated[index] = role.toUpperCase();
    });
    makeItems('foreach-before', [...BASE], BASE.map(() => ''));
    makeItems('foreach-after', mutated, mutated.map(() => 'changed'));
    showVerdict('foreach-verdict', 'mutated');
    announce(
      '.forEach() ran. The original array was mutated. After: ' +
        mutated.join(', ') +
        '. This is a side effect.'
    );
  },

  for() {
    const mutated = [...BASE];
    for (let index = 0; index < mutated.length; index++) {
      mutated[index] = mutated[index].toUpperCase();
    }
    makeItems('for-before', [...BASE], BASE.map(() => ''));
    makeItems('for-after', mutated, mutated.map(() => 'changed'));
    showVerdict('for-verdict', 'mutated');
    announce(
      'The for loop ran. The original array was mutated. After: ' +
        mutated.join(', ') +
        '. This is a side effect.'
    );
  },

  shift() {
    const mutated = [...BASE];
    mutated.shift();
    makeItems(
      'shift-before',
      [...BASE],
      BASE.map((value, index) => (index === 0 ? 'removed' : ''))
    );
    makeItems('shift-after', mutated, mutated.map(() => 'changed'));
    showVerdict('shift-verdict', 'mutated');
    announce(
      '.shift() ran. The first item, tutoring, was removed from the original array. Remaining items: ' +
        mutated.join(', ') +
        '. This is a side effect.'
    );
  },
};

const ITEM_CONTAINER_IDS = [
  'filter-orig',
  'filter-result',
  'map-orig',
  'map-result',
  'foreach-before',
  'foreach-after',
  'for-before',
  'for-after',
  'shift-before',
  'shift-after',
];

const VERDICT_IDS = [
  'filter-verdict',
  'map-verdict',
  'foreach-verdict',
  'for-verdict',
  'shift-verdict',
];

function resetAll() {
  ITEM_CONTAINER_IDS.forEach(id => {
    document.getElementById(id).innerHTML =
      '<span class="empty-msg">not run yet</span>';
  });
  VERDICT_IDS.forEach(id => {
    const verdict = document.getElementById(id);
    verdict.style.display = 'none';
    verdict.style.opacity = '0';
  });
  announce('Visualizer reset. All examples ready to run again.');
}

document.querySelectorAll('[data-run]').forEach(button => {
  button.addEventListener('click', () => runners[button.dataset.run]());
});

document.querySelector('[data-reset]').addEventListener('click', resetAll);
