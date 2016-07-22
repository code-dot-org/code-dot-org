import BoardController from '@cdo/apps/makerlab/BoardController';

$(function () {
  $('.maker-setup a').attr('target', '_blank');

  const isChrome = !!window.chrome;
  const gtChrome33 = isChrome && getChromeVersion() >= 33;

  function getChromeVersion() {
    const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);

    return raw ? parseInt(raw[2], 10) : false;
  }

  function isMacintosh() {
    return navigator.platform.indexOf('Mac') > -1;
  }

  function isWindows() {
    return navigator.platform.indexOf('Win') > -1;
  }

  if (isChrome) {
    if (gtChrome33) {
      check('#is-chrome');
    } else {
      $('#is-chrome').append("Your Chrome version is " + getChromeVersion() + ", please upgrade to at least version 33");
    }

    const bc = new BoardController();
    Promise.resolve().then(() => {
      return Promise.resolve()
          .then(() => spin('#app-installed'))
          .then(bc.ensureAppInstalled.bind(bc))
          .then(() => check('#app-installed'))
          .catch((error) => fail('#app-installed'));
    }).then(() => {
      return Promise.resolve()
          .then(() => spin('#board-plug'))
          .then(BoardController.getDevicePort)
          .then(() => check('#board-plug'))
          .catch((error) => fail('#board-plug'));
    }).then(() => {
      return Promise.resolve()
          .then(() => spin('#board-connect'))
          .then(bc.ensureBoardConnected.bind(bc))
          .then(() => check('#board-connect'))
          .catch((error) => fail('#board-connect'));
    }).then(() => {
      return Promise.resolve()
          .then(() => spin('#board-components'))
          .then(bc.connectWithComponents.bind(bc))
          .then(() => thumb('#board-components'))
          .then(() => {
            bc.prewiredComponents.buzzer.play({
              song: [
                ["G3", 100], ["C4", 100], ["E4", 100], ["G4", 50],
                [null, 150], ["E4", 75], ["G4", 400]
              ], tempo: 45000
            });
            bc.prewiredComponents.colorLeds.forEach(l => l.color('green'));
          })
          .then(() => new Promise((resolve) => {
            setTimeout(resolve, 1600)
          }))
          .then(() => {
            bc.prewiredComponents.colorLeds.forEach(l => l.off());
            bc.prewiredComponents.buzzer.play({
              song: [["C4", 100]],
              tempo: 45000
            });
          })
          .then(() => check('#board-components'))
          .catch((error) => fail('#board-components'));
    });
  } else {
    fail('#is-chrome');
  }

  if (isWindows()) {
    $('#windows-drivers').removeClass('hidden').addClass('incomplete');
  }

});

function fail(selector, e) {
  $(selector).addClass('incomplete').removeClass('complete waiting');
  $(selector + ' i').removeClass('fa-spinner fa-spin').addClass('fa fa-times-circle');
  if (e) {
    console.error(e);
  }
}

function spin(selector) {
  $(selector).removeClass('waiting').addClass('complete');
  $(selector + ' i').removeClass('fa-times-circle fa-clock-o').addClass('fa-spinner fa-spin');
}

function check(selector) {
  $(selector).removeClass('waiting').addClass('complete');
  $(selector + ' i').removeClass('fa-times-circle fa-clock-o fa-spinner fa-thumbs-o-up fa-spin').addClass('fa-check-circle');
}

function thumb(selector) {
  $(selector).removeClass('waiting').addClass('complete');
  $(selector + ' i').removeClass('fa-times-circle fa-clock-o fa-spinner fa-spin').addClass('fa-thumbs-o-up');
}
