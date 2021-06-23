/* global dashboard */
import $ from 'jquery';
import * as api from './api';
import dontMarshalApi from '../dontMarshalApi';
import {dropletStringBlocks, dropletArrayBlocks} from '../dropletUtils';
import consoleApi from '../consoleApi';
import * as audioApi from '@cdo/apps/lib/util/audioApi';
import audioApiDropletConfig from '@cdo/apps/lib/util/audioApiDropletConfig';
import * as timeoutApi from '@cdo/apps/lib/util/timeoutApi';
import * as makerApi from '@cdo/apps/lib/kits/maker/api';
import color from '../util/color';
import getAssetDropdown from '../assetManagement/getAssetDropdown';
import {getTables, getColumns} from '@cdo/apps/storage/getColumnDropdown';
import ChartApi from './ChartApi';
import * as elementUtils from './designElements/elementUtils';
import {
  setPropertyDropdown,
  setPropertyValueSelector
} from './setPropertyDropdown';
import {getStore} from '../redux';
import * as applabConstants from './constants';
import experiments from '../util/experiments';

var DEFAULT_WIDTH = applabConstants.APP_WIDTH.toString();
var DEFAULT_HEIGHT = (
  applabConstants.APP_HEIGHT - applabConstants.FOOTER_HEIGHT
).toString();

// Flip the argument order so we can bind `typeFilter`.
function chooseAsset(typeFilter, callback) {
  dashboard.assets.showAssetManager(callback, typeFilter, null, {
    showUnderageWarning: !getStore().getState().pageConstants.is13Plus
  });
}

// Configure shared APIs for App Lab
// We wrap this because it runs before window.Applab exists
function applabExecuteCmd(...args) {
  return Applab.executeCmd.call(Applab, ...args);
}
audioApi.injectExecuteCmd(applabExecuteCmd);
timeoutApi.injectExecuteCmd(applabExecuteCmd);
makerApi.injectExecuteCmd(applabExecuteCmd);

/**
 * Generate a list of screen ids for our setScreen dropdown
 */
function getScreenIds() {
  var ret = elementUtils.getScreens().map(function() {
    return '"' + elementUtils.getId(this) + '"';
  });

  // Convert from jQuery's array-like object to a true array
  return $.makeArray(ret);
}

/**
 * @param {string?} selector Filters to ids on elements that match selector, or
 *   all elements if undefined
 * @returns {function} Dropdown function that returns a list of ids for the selector
 */
function idDropdownWithSelector(selector) {
  return function() {
    return Applab.getIdDropdown(selector);
  };
}

// Basic dropdown that shows ids for all DOM elements in the applab app.
var ID_DROPDOWN_PARAM_0 = {
  0: idDropdownWithSelector()
};

// NOTE : format of blocks detailed at top of apps/src/dropletUtils.js

export var blocks = [
  {
    func: 'onEvent',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id', 'type', 'callback'],
    params: ['"id"', '"click"', 'function( ) {\n  \n}'],
    allowFunctionDrop: {2: true},
    dropdown: {
      0: idDropdownWithSelector(),
      1: [
        '"click"',
        '"change"',
        '"keyup"',
        '"keydown"',
        '"keypress"',
        '"mousemove"',
        '"mousedown"',
        '"mouseup"',
        '"mouseover"',
        '"mouseout"',
        '"input"'
      ]
    }
  },
  {
    func: 'button',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id', 'text'],
    params: ['"id"', '"text"']
  },
  {
    func: 'textInput',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id', 'text'],
    params: ['"id"', '"text"']
  },
  {
    func: 'textLabel',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id', 'text'],
    params: ['"id"', '"text"']
  },
  {
    func: 'dropdown',
    parent: api,
    category: 'UI controls',
    paramButtons: {minArgs: 1},
    paletteParams: ['id', 'option1', 'etc'],
    params: ['"id"', '"option1"', '"etc"']
  },
  {
    func: 'getText',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id'],
    params: ['"id"'],
    dropdown: ID_DROPDOWN_PARAM_0,
    type: 'value'
  },
  {
    func: 'setText',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id', 'text'],
    params: ['"id"', '"text"'],
    dropdown: ID_DROPDOWN_PARAM_0
  },
  {
    func: 'getNumber',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id'],
    params: ['"id"'],
    dropdown: ID_DROPDOWN_PARAM_0,
    type: 'value'
  },
  {
    func: 'setNumber',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id', 'number'],
    params: ['"id"', '0'],
    dropdown: ID_DROPDOWN_PARAM_0
  },
  {
    func: 'checkbox',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id', 'checked'],
    params: ['"id"', 'false'],
    dropdown: {1: ['true', 'false']}
  },
  {
    func: 'radioButton',
    parent: api,
    category: 'UI controls',
    paramButtons: {minArgs: 2, maxArgs: 3},
    paletteParams: ['id', 'checked'],
    params: ['"id"', 'false', '"group"'],
    dropdown: {1: ['true', 'false']}
  },
  {
    func: 'getChecked',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id'],
    params: ['"id"'],
    type: 'value'
  },
  {
    func: 'setChecked',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id', 'checked'],
    params: ['"id"', 'true'],
    dropdown: {1: ['true', 'false']}
  },
  {
    func: 'image',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id', 'url'],
    params: ['"id"', '"https://code.org/images/logo.png"'],
    dropdown: {
      1: function() {
        return getAssetDropdown('image');
      }
    },
    assetTooltip: {1: chooseAsset.bind(null, 'image')}
  },
  {
    func: 'getImageURL',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id'],
    params: ['"id"'],
    dropdown: {
      0: function() {
        return [
          ...idDropdownWithSelector('img')(),
          ...idDropdownWithSelector('.img-upload')()
        ];
      }
    },
    type: 'value'
  },
  {
    func: 'setImageURL',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id', 'url'],
    params: ['"id"', '"https://code.org/images/logo.png"'],
    dropdown: {
      0: idDropdownWithSelector('img'),
      1: () => {
        return getAssetDropdown('image');
      }
    },
    assetTooltip: {1: chooseAsset.bind(null, 'image')}
  },
  {...audioApiDropletConfig.playSound, category: 'UI controls'},
  {...audioApiDropletConfig.stopSound, category: 'UI controls'},
  {...audioApiDropletConfig.playSpeech, category: 'UI controls'},
  {
    func: 'showElement',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id'],
    params: ['"id"'],
    dropdown: ID_DROPDOWN_PARAM_0
  },
  {
    func: 'hideElement',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id'],
    params: ['"id"'],
    dropdown: ID_DROPDOWN_PARAM_0
  },
  {
    func: 'deleteElement',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id'],
    params: ['"id"'],
    dropdown: ID_DROPDOWN_PARAM_0
  },
  {
    func: 'setPosition',
    parent: api,
    category: 'UI controls',
    paramButtons: {minArgs: 3, maxArgs: 5},
    paletteParams: ['id', 'x', 'y', 'width', 'height'],
    params: ['"id"', '0', '0', '100', '100'],
    dropdown: ID_DROPDOWN_PARAM_0
  },
  {
    func: 'setSize',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id', 'width', 'height'],
    params: ['"id"', '100', '100'],
    dropdown: ID_DROPDOWN_PARAM_0
  },
  {
    func: 'setProperty',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id', 'property', 'value'],
    params: ['"id"', '"width"', '100'],
    dropdown: {
      0: idDropdownWithSelector(),
      1: setPropertyDropdown(true),
      2: setPropertyValueSelector()
    }
  },
  {
    func: 'getProperty',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id', 'property'],
    params: ['"id"', '"width"'],
    dropdown: {0: idDropdownWithSelector(), 1: setPropertyDropdown(false)},
    type: 'value'
  },
  {
    func: 'write',
    parent: api,
    category: 'UI controls',
    paletteParams: ['text'],
    params: ['"text"']
  },
  {
    func: 'getXPosition',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id'],
    params: ['"id"'],
    dropdown: ID_DROPDOWN_PARAM_0,
    type: 'value'
  },
  {
    func: 'getYPosition',
    parent: api,
    category: 'UI controls',
    paletteParams: ['id'],
    params: ['"id"'],
    dropdown: ID_DROPDOWN_PARAM_0,
    type: 'value'
  },
  {
    func: 'setScreen',
    parent: api,
    category: 'UI controls',
    paletteParams: ['screenId'],
    params: ['"screen1"'],
    dropdown: {0: getScreenIds}
  },
  {
    func: 'rgb',
    parent: api,
    category: 'UI controls',
    paramButtons: {minArgs: 3, maxArgs: 4},
    paletteParams: ['r', 'g', 'b', 'a'],
    params: ['250', '0', '75', '0.5'],
    type: 'value'
  },
  {
    func: 'open',
    parent: api,
    category: 'UI controls',
    paletteParams: ['url'],
    params: ['"https://code.org"']
  },

  {
    func: 'createCanvas',
    parent: api,
    category: 'Canvas',
    paramButtons: {minArgs: 1, maxArgs: 3},
    paletteParams: ['id', 'width', 'height'],
    params: ['"id"', DEFAULT_WIDTH, DEFAULT_HEIGHT]
  },
  {
    func: 'setActiveCanvas',
    parent: api,
    category: 'Canvas',
    paletteParams: ['id'],
    params: ['"id"'],
    dropdown: {0: idDropdownWithSelector('canvas')}
  },
  {
    func: 'line',
    parent: api,
    category: 'Canvas',
    paletteParams: ['x1', 'y1', 'x2', 'y2'],
    params: ['0', '0', DEFAULT_WIDTH / 2, DEFAULT_HEIGHT / 2]
  },
  {
    func: 'circle',
    parent: api,
    category: 'Canvas',
    paletteParams: ['x', 'y', 'radius'],
    params: [DEFAULT_WIDTH / 2, DEFAULT_HEIGHT / 2, '100']
  },
  {
    func: 'rect',
    parent: api,
    category: 'Canvas',
    paletteParams: ['x', 'y', 'width', 'height'],
    params: ['80', '120', DEFAULT_WIDTH / 2, DEFAULT_HEIGHT / 2]
  },
  {
    func: 'setStrokeWidth',
    parent: api,
    category: 'Canvas',
    paletteParams: ['width'],
    params: ['3']
  },
  {
    func: 'setStrokeColor',
    parent: api,
    category: 'Canvas',
    paletteParams: ['color'],
    params: ['"red"'],
    dropdown: {0: ['"red"', 'rgb(255,0,0)', 'rgb(255,0,0,0.5)', '"#FF0000"']}
  },
  {
    func: 'setFillColor',
    parent: api,
    category: 'Canvas',
    paletteParams: ['color'],
    params: ['"yellow"'],
    dropdown: {
      0: ['"yellow"', 'rgb(255,255,0)', 'rgb(255,255,0,0.5)', '"#FFFF00"']
    }
  },
  // drawImage has been deprecated in favor of drawImageURL
  {
    func: 'drawImage',
    parent: api,
    category: 'Canvas',
    paletteParams: ['id', 'x', 'y'],
    params: ['"id"', '0', '0'],
    dropdown: {0: idDropdownWithSelector('img')},
    noAutocomplete: true
  },
  {
    func: 'drawImageURL',
    parent: api,
    category: 'Canvas',
    paramButtons: {minArgs: 1, maxArgs: 6},
    paletteParams: ['url'],
    params: ['"https://code.org/images/logo.png"'],
    allowFunctionDrop: {1: true, 5: true}
  },
  {
    func: 'getImageData',
    parent: api,
    category: 'Canvas',
    paletteParams: ['x', 'y', 'width', 'height'],
    params: ['0', '0', DEFAULT_WIDTH, DEFAULT_HEIGHT],
    type: 'value'
  },
  {
    func: 'putImageData',
    parent: api,
    category: 'Canvas',
    paletteParams: ['imgData', 'x', 'y'],
    params: ['imgData', '0', '0']
  },
  {func: 'clearCanvas', parent: api, category: 'Canvas'},
  {
    func: 'getRed',
    parent: dontMarshalApi,
    category: 'Canvas',
    paletteParams: ['imgData', 'x', 'y'],
    params: ['imgData', '0', '0'],
    type: 'value',
    dontMarshal: true
  },
  {
    func: 'getGreen',
    parent: dontMarshalApi,
    category: 'Canvas',
    paletteParams: ['imgData', 'x', 'y'],
    params: ['imgData', '0', '0'],
    type: 'value',
    dontMarshal: true
  },
  {
    func: 'getBlue',
    parent: dontMarshalApi,
    category: 'Canvas',
    paletteParams: ['imgData', 'x', 'y'],
    params: ['imgData', '0', '0'],
    type: 'value',
    dontMarshal: true
  },
  {
    func: 'getAlpha',
    parent: dontMarshalApi,
    category: 'Canvas',
    paletteParams: ['imgData', 'x', 'y'],
    params: ['imgData', '0', '0'],
    type: 'value',
    dontMarshal: true
  },
  {
    func: 'setRed',
    parent: dontMarshalApi,
    category: 'Canvas',
    paletteParams: ['imgData', 'x', 'y', 'r'],
    params: ['imgData', '0', '0', '255'],
    dontMarshal: true
  },
  {
    func: 'setGreen',
    parent: dontMarshalApi,
    category: 'Canvas',
    paletteParams: ['imgData', 'x', 'y', 'g'],
    params: ['imgData', '0', '0', '255'],
    dontMarshal: true
  },
  {
    func: 'setBlue',
    parent: dontMarshalApi,
    category: 'Canvas',
    paletteParams: ['imgData', 'x', 'y', 'b'],
    params: ['imgData', '0', '0', '255'],
    dontMarshal: true
  },
  {
    func: 'setAlpha',
    parent: dontMarshalApi,
    category: 'Canvas',
    paletteParams: ['imgData', 'x', 'y', 'a'],
    params: ['imgData', '0', '0', '255'],
    dontMarshal: true
  },
  {
    func: 'setRGB',
    parent: dontMarshalApi,
    category: 'Canvas',
    paramButtons: {minArgs: 6, maxArgs: 7},
    paletteParams: ['imgData', 'x', 'y', 'r', 'g', 'b'],
    params: ['imgData', '0', '0', '255', '255', '255'],
    dontMarshal: true
  },
  {
    func: 'getColumn',
    parent: api,
    category: 'Data',
    paletteParams: ['table', 'column'],
    params: ['"mytable"', '"mycolumn"'],
    nativeIsAsync: true,
    type: 'value',
    dropdown: {
      0: getTables(),
      1: getColumns()
    }
  },
  {
    func: 'startWebRequest',
    parent: api,
    category: 'Data',
    paletteParams: ['url', 'callback'],
    params: [
      '"https://en.wikipedia.org/w/api.php?origin=*&action=parse&format=json&prop=text&page=computer&section=1&disablelimitreport=true"',
      'function(status, type, content) {\n  \n}'
    ],
    allowFunctionDrop: {1: true}
  },
  {
    func: 'startWebRequestSync',
    parent: api,
    category: 'Data',
    paletteParams: ['url'],
    params: [
      '"https://en.wikipedia.org/w/api.php?origin=*&action=parse&format=json&prop=text&page=computer&section=1&disablelimitreport=true"'
    ],
    nativeIsAsync: true,
    noAutocomplete: true
  },
  {
    func: 'setKeyValue',
    parent: api,
    category: 'Data',
    paletteParams: ['key', 'value', 'callback'],
    params: ['"key"', '"value"', 'function () {\n  \n}'],
    allowFunctionDrop: {2: true, 3: true}
  },
  {
    func: 'setKeyValueSync',
    parent: api,
    category: 'Data',
    paletteParams: ['key', 'value'],
    params: ['"key"', '"value"'],
    nativeIsAsync: true,
    noAutocomplete: true
  },
  {
    func: 'getKeyValue',
    parent: api,
    category: 'Data',
    paletteParams: ['key', 'callback'],
    params: ['"key"', 'function (value) {\n  \n}'],
    allowFunctionDrop: {1: true, 2: true}
  },
  {
    func: 'getKeyValueSync',
    parent: api,
    category: 'Data',
    paletteParams: ['key'],
    params: ['"key"'],
    type: 'value',
    nativeIsAsync: true,
    noAutocomplete: true
  },
  {
    func: 'createRecord',
    parent: api,
    category: 'Data',
    paletteParams: ['table', 'record', 'callback'],
    params: ['"mytable"', "{name:'Alice'}", 'function(record) {\n  \n}'],
    allowFunctionDrop: {2: true, 3: true}
  },
  {
    func: 'createRecordSync',
    parent: api,
    category: 'Data',
    paletteParams: ['table', 'record'],
    params: ['"mytable"', "{name:'Alice'}"],
    allowFunctionDrop: {2: true},
    nativeIsAsync: true,
    type: 'either'
  },
  {
    func: 'readRecords',
    parent: api,
    category: 'Data',
    paletteParams: ['table', 'terms', 'callback'],
    params: [
      '"mytable"',
      '{}',
      "function(records) {\n  for (var i =0; i < records.length; i++) {\n    console.log(records[i].id + ': ' + records[i].name);\n  }\n}"
    ],
    allowFunctionDrop: {2: true, 3: true}
  },
  {
    func: 'readRecordsSync',
    parent: api,
    category: 'Data',
    paletteParams: ['table'],
    params: ['"mytable"'],
    nativeIsAsync: true,
    type: 'either'
  },
  {
    func: 'updateRecord',
    parent: api,
    category: 'Data',
    paletteParams: ['table', 'record', 'callback'],
    params: [
      '"mytable"',
      "{id:1, name:'Bob'}",
      'function(record, success) {\n  \n}'
    ],
    allowFunctionDrop: {2: true, 3: true}
  },
  {
    func: 'updateRecordSync',
    parent: api,
    category: 'Data',
    paletteParams: ['table', 'record'],
    params: ['"mytable"', "{id:1, name:'Bob'}"],
    allowFunctionDrop: {2: true},
    nativeIsAsync: true,
    type: 'either'
  },
  {
    func: 'deleteRecord',
    parent: api,
    category: 'Data',
    paletteParams: ['table', 'record', 'callback'],
    params: ['"mytable"', '{id:1}', 'function(success) {\n  \n}'],
    allowFunctionDrop: {2: true, 3: true}
  },
  {
    func: 'deleteRecordSync',
    parent: api,
    category: 'Data',
    paletteParams: ['table', 'record'],
    params: ['"mytable"', '{id:1}'],
    allowFunctionDrop: {2: true},
    nativeIsAsync: true,
    type: 'either'
  },
  {
    func: 'onRecordEvent',
    parent: api,
    category: 'Data',
    paletteParams: ['table', 'callback'],
    params: [
      '"mytable"',
      "function(record, eventType) {\n  if (eventType === 'create') {\n    textLabel('id', 'record with id ' + record.id + ' was created');\n  } \n}"
    ],
    allowFunctionDrop: {1: true}
  },
  {func: 'getUserId', parent: api, category: 'Data', type: 'value'},
  {
    func: 'drawChart',
    parent: api,
    category: 'Data',
    paramButtons: {minArgs: 3, maxArgs: 5},
    paletteParams: ['chartId', 'chartType', 'chartData'],
    params: [
      '"chartId"',
      '"bar"',
      '[\n\t{ label: "Row 1", value: 1 },\n\t{ label: "Row 2", value: 2 }\n]'
    ],
    allowFunctionDrop: {4: true},
    dropdown: {
      0: idDropdownWithSelector('.chart'),
      1: ChartApi.getChartTypeDropdown
    }
  },
  {
    func: 'drawChartFromRecords',
    parent: api,
    category: 'Data',
    paramButtons: {minArgs: 4, maxArgs: 6},
    paletteParams: ['chartId', 'chartType', 'tableName', 'columns'],
    params: ['"chartId"', '"bar"', '"mytable"', '["columnOne", "columnTwo"]'],
    allowFunctionDrop: {5: true},
    dropdown: {
      0: idDropdownWithSelector('.chart'),
      1: ChartApi.getChartTypeDropdown
    }
  },

  {
    func: 'moveForward',
    parent: api,
    category: 'Turtle',
    paletteParams: ['pixels'],
    params: ['25'],
    dropdown: {0: ['25', '50', '100', '200']}
  },
  {
    func: 'moveBackward',
    parent: api,
    category: 'Turtle',
    paletteParams: ['pixels'],
    params: ['25'],
    dropdown: {0: ['25', '50', '100', '200']}
  },
  {
    func: 'move',
    parent: api,
    category: 'Turtle',
    paletteParams: ['x', 'y'],
    params: ['25', '25'],
    dropdown: {0: ['25', '50', '100', '200'], 1: ['25', '50', '100', '200']}
  },
  {
    func: 'moveTo',
    parent: api,
    category: 'Turtle',
    paletteParams: ['x', 'y'],
    params: ['0', '0']
  },
  {
    func: 'dot',
    parent: api,
    category: 'Turtle',
    paletteParams: ['radius'],
    params: ['5'],
    dropdown: {0: ['1', '5', '10']}
  },
  {
    func: 'turnRight',
    parent: api,
    category: 'Turtle',
    paramButtons: {minArgs: 0, maxArgs: 1},
    paletteParams: ['angle'],
    params: ['90'],
    dropdown: {0: ['30', '45', '60', '90']}
  },
  {
    func: 'turnLeft',
    parent: api,
    category: 'Turtle',
    paramButtons: {minArgs: 0, maxArgs: 1},
    paletteParams: ['angle'],
    params: ['90'],
    dropdown: {0: ['30', '45', '60', '90']}
  },
  {
    func: 'turnTo',
    parent: api,
    category: 'Turtle',
    paletteParams: ['angle'],
    params: ['0'],
    dropdown: {0: ['0', '90', '180', '270']}
  },
  {
    func: 'arcRight',
    parent: api,
    category: 'Turtle',
    paletteParams: ['angle', 'radius'],
    params: ['90', '25'],
    dropdown: {0: ['30', '45', '60', '90'], 1: ['25', '50', '100', '200']}
  },
  {
    func: 'arcLeft',
    parent: api,
    category: 'Turtle',
    paletteParams: ['angle', 'radius'],
    params: ['90', '25'],
    dropdown: {0: ['30', '45', '60', '90'], 1: ['25', '50', '100', '200']}
  },
  {func: 'getX', parent: api, category: 'Turtle', type: 'value'},
  {func: 'getY', parent: api, category: 'Turtle', type: 'value'},
  {func: 'getDirection', parent: api, category: 'Turtle', type: 'value'},
  {func: 'penUp', parent: api, category: 'Turtle'},
  {func: 'penDown', parent: api, category: 'Turtle'},
  {
    func: 'penWidth',
    parent: api,
    category: 'Turtle',
    paletteParams: ['width'],
    params: ['3'],
    dropdown: {0: ['1', '3', '5']}
  },
  {
    func: 'penColor',
    parent: api,
    category: 'Turtle',
    paletteParams: ['color'],
    params: ['"red"'],
    dropdown: {0: ['"red"', 'rgb(255,0,0)', 'rgb(255,0,0,0.5)', '"#FF0000"']}
  },
  {
    func: 'penRGB',
    parent: api,
    category: 'Turtle',
    paramButtons: {minArgs: 3, maxArgs: 4},
    paletteParams: ['r', 'g', 'b'],
    params: ['120', '180', '200']
  },
  {func: 'show', parent: api, category: 'Turtle'},
  {func: 'hide', parent: api, category: 'Turtle'},
  {
    func: 'speed',
    parent: api,
    category: 'Turtle',
    paletteParams: ['value'],
    params: ['50'],
    dropdown: {0: ['25', '50', '75', '100']}
  },

  {...timeoutApi.dropletConfig.setTimeout},
  {...timeoutApi.dropletConfig.clearTimeout},
  {...timeoutApi.dropletConfig.setInterval},
  {...timeoutApi.dropletConfig.clearInterval},
  {...timeoutApi.dropletConfig.timedLoop},
  {...timeoutApi.dropletConfig.stopTimedLoop},

  {
    func: 'console.log',
    parent: consoleApi,
    category: 'Variables',
    paletteParams: ['message'],
    params: ['"message"']
  },

  ...dropletStringBlocks,
  ...dropletArrayBlocks,

  {
    func: 'imageUploadButton',
    parent: api,
    category: 'Advanced',
    params: ['"id"', '"text"']
  },
  {
    func: 'container',
    parent: api,
    category: 'Advanced',
    params: ['"id"', '"html"']
  },
  {
    func: 'innerHTML',
    parent: api,
    category: 'Advanced',
    params: ['"id"', '"html"']
  },
  {
    func: 'setParent',
    parent: api,
    category: 'Advanced',
    params: ['"id"', '"parentId"']
  },
  {
    func: 'setStyle',
    parent: api,
    category: 'Advanced',
    params: ['"id"', '"color:red;"']
  },
  {
    func: 'getAttribute',
    parent: api,
    category: 'Advanced',
    params: ['"id"', '"scrollHeight"'],
    type: 'value',
    noAutocomplete: true
  },
  {
    func: 'setAttribute',
    parent: api,
    category: 'Advanced',
    params: ['"id"', '"scrollHeight"', '200'],
    noAutocomplete: true
  },
  {
    func: 'setSelectionRange',
    parent: api,
    category: 'Advanced',
    paletteParams: ['id', 'start', 'end'],
    params: ['"id"', '0', '0'],
    paramButtons: {minArgs: 3, maxArgs: 4}
  },

  {
    func: 'comment_Goals_1',
    block: '// Goal 1',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  },
  {
    func: 'comment_Goals_2',
    block: '// Goal 2',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  },
  {
    func: 'comment_Goals_3',
    block: '// Goal 3',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  },
  {
    func: 'comment_Goals_4',
    block: '// Goal 4',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  },
  {
    func: 'comment_Goals_5',
    block: '// Goal 5',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  },
  {
    func: 'comment_Goals_6',
    block: '// Goal 6',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  },
  {
    func: 'comment_Goals_7',
    block: '// Goal 7',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  },
  {
    func: 'comment_Goals_8',
    block: '// Goal 8',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  },
  {
    func: 'comment_Goals_9',
    block: '// Goal 9',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  },
  {
    func: 'comment_Goals_10',
    block: '// Goal 10',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  },
  {
    func: 'comment_Goals_11',
    block: '// Goal 11',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  },
  {
    func: 'comment_Goals_12',
    block: '// Goal 12',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  },
  {
    func: 'comment_Goals_13',
    block: '// Goal 13',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  },
  {
    func: 'comment_Goals_14',
    block: '// Goal 14',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  },
  {
    func: 'comment_Goals_15',
    block: '// Goal 15',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  },
  {
    func: 'comment_Goals_16',
    block: '// Goal 16',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  },
  {
    func: 'comment_Goals_17',
    block: '// Goal 17',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  },
  {
    func: 'comment_Goals_18',
    block: '// Goal 18',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  },
  {
    func: 'comment_Goals_19',
    block: '// Goal 19',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  },
  {
    func: 'comment_Goals_20',
    block: '// Goal 20',
    docFunc: 'comment',
    category: 'Goals',
    noAutocomplete: true
  }
];

if (experiments.isEnabled(experiments.APPLAB_ML)) {
  blocks.push(
    {
      func: 'getPrediction',
      parent: api,
      category: 'Data',
      paletteParams: ['name', 'id', 'data', 'callback'],
      params: ['"name"', '"id"', 'data', 'function (value) {\n \n}']
    },
    {
      func: 'declareAssign_object',
      block: `var object = {"key": "value"};`,
      category: 'Variables',
      noAutocomplete: true
    },
    {
      func: 'getValue',
      parent: dontMarshalApi,
      category: 'Variables',
      paletteParams: ['object', '"key"'],
      params: ['{"key": "value"}', '"key"'],
      dontMarshal: true
    },
    {
      func: 'addPair',
      parent: dontMarshalApi,
      category: 'Variables',
      paletteParams: ['object', '"key"', '"value"'],
      params: ['object', '"key"', '"value"'],
      dontMarshal: true
    }
  );
}

export const categories = {
  'UI controls': {
    id: 'uicontrols',
    color: 'yellow',
    rgb: color.droplet_yellow,
    blocks: []
  },
  Canvas: {
    id: 'canvas',
    color: 'red',
    rgb: color.droplet_red,
    blocks: []
  },
  Data: {
    id: 'data',
    color: 'lightgreen',
    rgb: color.droplet_light_green,
    blocks: []
  },
  Turtle: {
    id: 'turtle',
    color: 'cyan',
    rgb: color.droplet_cyan,
    blocks: []
  },
  Advanced: {
    id: 'advanced',
    color: 'blue',
    rgb: color.droplet_bright_blue,
    blocks: []
  },
  Goals: {
    id: 'goals',
    color: 'deeppurple',
    blocks: []
  }
};

/*
 * Set the showExamplesLink config value so that the droplet tooltips will show
 * an 'Examples' link that opens documentation in a lightbox:
 */
export var showExamplesLink = true;

/*
 * Set the showParamDropdowns config value so that ace autocomplete dropdowns
 * will appear for each parameter based on the dropdown properties above:
 */
export var showParamDropdowns = true;
