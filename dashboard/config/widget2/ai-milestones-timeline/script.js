function renderCards() {
  const grid = document.getElementById('cardGrid');
  grid.innerHTML = '';

  milestones.forEach(function(m) {
    const card = document.createElement('details');
    card.className = 'milestone-card ' + m.eraClass;
    card.dataset.category = m.category;

    card.innerHTML =
      '<summary class="card-header">' +
        '<h2 class="card-heading">' +
          '<span class="card-title">' + m.title + '</span>' +
          '<span class="card-period">' + m.period + '</span>' +
          '<span class="card-toggle" aria-hidden="true"></span>' +
        '</h2>' +
      '</summary>' +
      '<div class="card-era-badge">' + m.category + '</div>' +
      '<div class="card-drawer" id="drawer-' + m.id + '">' +
        '<section class="drawer-section">' +
          '<h3>What Happened</h3>' +
          '<div class="section-content">' + m.what + '</div>' +
        '</section>' +
        '<section class="drawer-section">' +
          '<h3>Why It Mattered</h3>' +
          '<div class="section-content">' + m.why + '</div>' +
        '</section>' +
        '<section class="drawer-section">' +
          '<h3>Connection to Today</h3>' +
          '<div class="section-content">' + m.today + '</div>' +
        '</section>' +
        '<div class="turning-point">' +
          '<div class="turning-point-label">Was this a turning point?</div>' +
          '<p>' + m.turningPoint + '</p>' +
        '</div>' +
      '</div>';

    grid.appendChild(card);
  });
}

function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(function(b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      var filter = btn.dataset.filter;
      document.querySelectorAll('.milestone-card').forEach(function(card) {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
          card.open = false;
        }
      });
    });
  });
}

renderCards();
initFilters();