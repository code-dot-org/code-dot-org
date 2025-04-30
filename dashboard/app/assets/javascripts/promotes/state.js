var showStatsBtn = document.getElementById('show-ap-stats');
var hideStatsBtn = document.getElementById('hide-ap-stats');

showStatsBtn.addEventListener('click', function () {
    showStatsBtn.style.setProperty('display', 'none');
    hideStatsBtn.style.removeProperty('display');
});

hideStatsBtn.addEventListener('click', function () {
    hideStatsBtn.style.setProperty('display', 'none');
    showStatsBtn.style.removeProperty('display');
});
