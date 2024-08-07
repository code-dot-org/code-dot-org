/** @file JavaScript run only on the applab level edit page. */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import {
  configMicrobit,
  configCircuitPlayground,
  getMakerBlocks,
} from '@cdo/apps/maker/dropletConfig';
import color from '@cdo/apps/util/color';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  $('#level_makerlab_enabled').change(function () {
    // Get the set of blocks for the Maker Category, the Circuit Category, and the Micro:bit category

    // Setting block values to null to match the expected behavior in code_functions.
    // The maker type given here sets the defaultPin in the example block. Since we are just using the function name,
    // which doesn't include a pin parameter, we could use any block type.
    const configMaker = getMakerBlocks(null);
    let makerBlocks = {};
    configMaker.forEach(block => (makerBlocks[block.func] = null));
    let microbitBlocks = {};
    configMicrobit.blocks.forEach(block => (microbitBlocks[block.func] = null));
    let circuitBlocks = {};
    configCircuitPlayground.blocks.forEach(
      block => (circuitBlocks[block.func] = null)
    );

    const editor = $('#level_code_functions')
      .siblings()
      .filter('.CodeMirror')[0].CodeMirror;
    const currentFunctions = JSON.parse(editor.getValue());
    let functionsWithMaker;
    if ($(this).val() === 'circuitPlayground') {
      // Load the circuitPlayground and maker blocks.
      functionsWithMaker = Object.assign(
        {},
        currentFunctions,
        makerBlocks,
        circuitBlocks
      );
    } else if ($(this).val() === 'microbit') {
      // Load the microbit and maker blocks
      functionsWithMaker = Object.assign(
        {},
        currentFunctions,
        makerBlocks,
        microbitBlocks
      );
    }
    editor.getDoc().setValue(JSON.stringify(functionsWithMaker, null, ' '));
  });

  const styles = {
    optgroup: {
      color: color.light_gray,
    },
    option: {
      color: color.black,
    },
  };

  const data = getScriptData('applabOptions');
  const categories = (data.dataset_library_manifest.categories || []).filter(
    category => category.published
  );
  const tableNames = data.dataset_library_manifest.tables.map(
    table => table.name
  );
  class DataLibrary extends React.Component {
    state = {
      value: data.data_library_tables
        ? data.data_library_tables.split(',')
        : [],
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
            size={20}
          >
            {categories.map(category => (
              <optgroup
                label={category.name}
                key={category.name}
                style={styles.optgroup}
              >
                {category.datasets.map(name => (
                  <option key={name} value={name} style={styles.option}>
                    {name}
                  </option>
                ))}
              </optgroup>
            ))}
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
