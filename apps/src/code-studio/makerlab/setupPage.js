//import './makerlabDependencies';
window.JohnnyFive = require('johnny-five');
window.PlaygroundIO = require('playground-io');
window.ChromeSerialport = require('chrome-serialport');
//import BoardController from '@cdo/apps/makerlab/BoardController';

$(function () {
  $('.maker-setup a').attr('target', '_blank');

  var isChrome = !!window.chrome;
  var gtChrome33 = isChrome && getChromeVersion() >= 33;

  function getChromeVersion() {
    var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);

    return raw ? parseInt(raw[2], 10) : false;
  }

  function isMacintosh() {
    return navigator.platform.indexOf('Mac') > -1
  }

  function isWindows() {
    return navigator.platform.indexOf('Win') > -1
  }

  if (isChrome) {
    if (gtChrome33) {
      check('#is-chrome');
    } else {
      $('#is-chrome').append("Your Chrome version is " + getChromeVersion() + ", please upgrade to at least version 33");
    }
    var CHROME_APP_ID = 'ncmmhcpckfejllekofcacodljhdhibkg';
    window.ChromeSerialport.extensionId = CHROME_APP_ID

    spin('#app-installed');
    try {
      window.ChromeSerialport.isInstalled(function (error) {
        if (error) {
          alert('fail')
          fail('#app-installed');
          return;
        }
        check('#app-installed');

        return getDevicePort().then(function(port) {
          check('#board-plug');
          spin('#board-connect');
          connectToBoard(port).then(function(board) {
            check('#board-connect');
          }).catch(function(e){fail('#board-connect', e);});
        }).catch(function(e){fail('#board-plug', e)});
      });
    } catch (e) {
      fail('#app-installed', e)
    }
  } else {
    fail('#is-chrome');
  }

  if (isWindows()) {
    $('#windows-drivers').removeClass('hidden').addClass('incomplete');
  }

});

function deviceOnPortAppearsUsable(port) {
  var comNameRegex = /usb|acm|^com/i;
  return comNameRegex.test(port.comName);
}

function getDevicePort() {
  return new Promise(function (resolve, reject) {
    window.ChromeSerialport.list(function (error, list) {
      if (error) {
        reject(error);
        return;
      }

      var prewiredBoards = list.filter(function (port) {
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
    var serialPort = new window.ChromeSerialport.SerialPort(portId, {
      bitrate: 57600
    }, true);
    var io = new PlaygroundIO({port: serialPort});
    var board = new five.Board({io: io, repl: false});
    board.once('ready', function () {
      resolve(board);
    });
    board.once('error', reject);
  }.bind(this));
}

function fail(selector, e) {
  $(selector).addClass('incomplete').removeClass('complete');
  $(selector + ' i').removeClass('fa-spinner fa-spin').addClass('fa fa-times-circle');
  if (e) {
    alert(e);
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
