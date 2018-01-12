/** @file JavaScript run only on the applab level edit page. */
import $ from 'jquery';

$(document).ready(function () {
  const makerBlocks = {
    "pinMode": null,
    "digitalWrite": null,
    "digitalRead": null,
    "analogWrite": null,
    "analogRead": null,
    "on": null,
    "off": null,
    "toggle": null,
    "blink": null,
    "stop": null,
    "color": null,
    "intensity": null,
    "led.on": null,
    "led.off": null,
    "led.blink": null,
    "led.toggle": null,
    "led.pulse": null,
    "buzzer.frequency": null,
    "buzzer.note": null,
    "buzzer.off": null,
    "buzzer.stop": null,
    "buzzer.playNotes": null,
    "buzzer.playSong": null,
    "accelerometer.getOrientation": null,
    "accelerometer.getAcceleration": null,
    "isPressed": null,
    "holdtime": null,
    "soundSensor.value": null,
    "soundSensor.getAveragedValue": null,
    "soundSensor.setScale": null,
    "soundSensor.threshold": null,
    "lightSensor.value": null,
    "lightSensor.getAveragedValue": null,
    "lightSensor.setScale": null,
    "lightSensor.threshold": null,
    "tempSensor.F": null,
    "tempSensor.C": null,
    "toggleSwitch.isOpen": null,
    "onBoardEvent": null
  };
  $('#level_makerlab_enabled').change(function () {
    if ($(this).is(':checked')) {
      const editor = $('#level_code_functions').siblings().filter('.CodeMirror')[0].CodeMirror;
      const currentFunctions = JSON.parse(editor.getValue());
      const functionsWithMaker = Object.assign({}, currentFunctions, makerBlocks);
      editor.getDoc().setValue(JSON.stringify(functionsWithMaker, null, ' '));
    }
  });
});
