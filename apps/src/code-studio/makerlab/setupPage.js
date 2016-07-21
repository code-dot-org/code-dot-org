import five from 'johnny-five';
import PlaygroundIO from 'playground-io';
import ChromeSerialport from 'chrome-serialport';
//import BoardController from '@cdo/apps/makerlab/BoardController';

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
    const CHROME_APP_ID = 'ncmmhcpckfejllekofcacodljhdhibkg';
    ChromeSerialport.extensionId = CHROME_APP_ID;

    spin('#app-installed');
    try {
     ChromeSerialport.isInstalled((error) => {
        if (error) {
          fail('#app-installed');
          return;
        }
        check('#app-installed');

        return getDevicePort().then(port => {
          check('#board-plug');
          spin('#board-connect');
          connectToBoard(port).then(board => {
            check('#board-connect');
          }).catch(e => {fail('#board-connect', e);});
        }).catch(e => {fail('#board-plug', e)});
      });
    } catch (e) {
      fail('#app-installed', e);
    }
  } else {
    fail('#is-chrome');
  }

  if (isWindows()) {
    $('#windows-drivers').removeClass('hidden').addClass('incomplete');
  }

});

function deviceOnPortAppearsUsable(port) {
  const comNameRegex = /usb|acm|^com/i;
  return comNameRegex.test(port.comName);
}

function getDevicePort() {
  return new Promise(function (resolve, reject) {
   ChromeSerialport.list(function (error, list) {
      if (error) {
        reject(error);
        return;
      }

      const prewiredBoards = list.filter(function (port) {
        return deviceOnPortAppearsUsable(port);
      });

      if (prewiredBoards.length > 0) {
        resolve(prewiredBoards[0].comName);
      } else {
        reject('Could not get device port.');
      }
    });
  }.bind(this));
}

function connectToBoard(portId) {
  return new Promise(function (resolve, reject) {
    const serialPort = new ChromeSerialport.SerialPort(portId, {
      bitrate: 57600
    }, true);
    const io = new PlaygroundIO({port: serialPort});
    const board = new five.Board({io: io, repl: false});
    board.once('ready', function () {
      // Play "Charge!"
      new five.Piezo({
        pin: '5',
        controller: PlaygroundIO.Piezo
      }).play({
        song: [
          ["G3", 100],
          ["C4", 100],
          ["E4", 100],
          ["G4", 50],
          [null, 150],
          ["E4", 75],
          ["G4", 400],
          [null, 50]
        ],
        tempo: 45000
      });
      const colorLeds = _.range(10).map(index => new five.Led.RGB({
        controller: PlaygroundIO.Pixel,
        pin: index
      }));
      colorLeds.forEach(l => l.color('green'));
      resolve(board);
    });
    board.once('error', reject);
  }.bind(this));
}

function fail(selector, e) {
  $(selector).addClass('incomplete').removeClass('complete');
  $(selector + ' i').removeClass('fa-spinner fa-spin').addClass('fa fa-times-circle');
  if (e) {
    console.error(e);
  }
}

function spin(selector) {
  $(selector).removeClass('incomplete').addClass('complete');
  $(selector + ' i').removeClass('fa-times-circle').addClass('fa-spinner fa-spin');
}

function check(selector) {
  $(selector).removeClass('incomplete').addClass('complete');
  $(selector + ' i').removeClass('fa-times-circle fa-spinner fa-spin').addClass('fa-check-circle');
}
