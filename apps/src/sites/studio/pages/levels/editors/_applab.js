/** @file JavaScript run only on the applab level edit page. */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import datasets from '@cdo/apps/storage/dataBrowser/datasetManifest.json';

$(document).ready(function() {
  const makerBlocks = {
    pinMode: null,
    digitalWrite: null,
    digitalRead: null,
    analogWrite: null,
    analogRead: null,
    on: null,
    off: null,
    toggle: null,
    blink: null,
    pulse: null,
    stop: null,
    color: null,
    intensity: null,
    'led.on': null,
    'led.off': null,
    'led.blink': null,
    'led.toggle': null,
    'led.pulse': null,
    'buzzer.frequency': null,
    'buzzer.note': null,
    'buzzer.off': null,
    'buzzer.stop': null,
    'buzzer.playNotes': null,
    'buzzer.playSong': null,
    'accelerometer.getOrientation': null,
    'accelerometer.getAcceleration': null,
    isPressed: null,
    holdtime: null,
    'soundSensor.value': null,
    'soundSensor.getAveragedValue': null,
    'soundSensor.setScale': null,
    'soundSensor.threshold': null,
    'lightSensor.value': null,
    'lightSensor.getAveragedValue': null,
    'lightSensor.setScale': null,
    'lightSensor.threshold': null,
    'tempSensor.F': null,
    'tempSensor.C': null,
    'toggleSwitch.isOpen': null,
    onBoardEvent: null
  };
  $('#level_makerlab_enabled').change(function() {
    if ($(this).is(':checked')) {
      const editor = $('#level_code_functions')
        .siblings()
        .filter('.CodeMirror')[0].CodeMirror;
      const currentFunctions = JSON.parse(editor.getValue());
      const functionsWithMaker = Object.assign(
        {},
        currentFunctions,
        makerBlocks
      );
      editor.getDoc().setValue(JSON.stringify(functionsWithMaker, null, ' '));
    }
  });

  const data = getScriptData('applabOptions');
  const tableNames = datasets.tables.map(table => table.name);
  class DataLibrary extends React.Component {
    state = {
      value: data.data_library_tables ? data.data_library_tables.split(',') : []
    };

    handleChange = event => {
      let options = event.target.options;
      let value = [];
      for (var i = 0; i < options.length; i++) {
        if (options[i].selected) {
          value.push(options[i].value);
        }
      }
      this.setValue(value);
    };

    selectAll = event => {
      event.preventDefault();
      this.setValue(tableNames);
    };

    clearAll = event => {
      event.preventDefault();
      this.setValue([]);
    };

    setValue = value => {
      this.setState({value: value});
      $('#level_data_library_tables').val(value);
    };

    render() {
      return (
        <div>
          <div>(shift-click or cmd-click to select multiple)</div>
          <div>
            <a href="#" onClick={this.selectAll}>
              Select All
            </a>
            <span> | </span>
            <a href="#" onClick={this.clearAll}>
              Select None
            </a>
          </div>
          <select
            value={this.state.value}
            multiple={true}
            onChange={this.handleChange}
          >
            {tableNames.map(name => {
              return (
                <option key={name} value={name}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>
      );
    }
  }

  ReactDOM.render(
    <DataLibrary />,
    $('<div></div>')
      .insertAfter(`label[for="level_data_library_tables"]`)
      .get(0)
  );
});
