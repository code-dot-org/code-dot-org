import {ToolboxType, CLAMPED_NUMBER_REGEX, DEFAULT_SOUND} from '../constants';
import cdoTheme from '../themes/cdoTheme';
import experiments from '@cdo/apps/util/experiments';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import DCDO from '@cdo/apps/dcdo';
import {APP_HEIGHT} from '@cdo/apps/p5lab/constants';
import {SOUND_PREFIX} from '@cdo/apps/assetManagement/assetPrefix';

export function loadBlocksToWorkspace(workspace, blockXml, serializationJson) {
  return Blockly.Xml.domToBlockSpace(workspace, blockXml);
}

export function setHSV(block, h, s, v) {
  block.setColour(Blockly.utils.colour.hsvToHex(h, s, v * 255));
}

export function getBlockFields(block) {
  let fields = [];
  block.inputList.forEach(input => {
    input.fieldRow.forEach(field => {
      fields.push(field);
    });
  });
  return fields;
}

export function getToolboxType() {
  const workspace = Blockly.getMainWorkspace();
  if (!workspace) {
    return;
  }
  // True is passed so we only get the flyout directly owned by the workspace.
  // Otherwise getFlyout will return the flyout for the toolbox if it has categories.
  if (workspace.getFlyout(true)) {
    return ToolboxType.UNCATEGORIZED;
  } else if (workspace.getToolbox()) {
    return ToolboxType.CATEGORIZED;
  } else {
    return ToolboxType.NONE;
  }
}

export function getToolboxWidth() {
  const workspace = Blockly.getMainWorkspace();
  const metrics = workspace.getMetrics();
  switch (getToolboxType()) {
    case ToolboxType.CATEGORIZED:
      return metrics.toolboxWidth;
    case ToolboxType.UNCATEGORIZED:
      return metrics.flyoutWidth;
    case ToolboxType.NONE:
      return 0;
  }
}

export function workspaceSvgResize(workspace) {
  return Blockly.svgResize(workspace);
}

export function bindBrowserEvent(element, name, thisObject, func, useCapture) {
  return Blockly.browserEvents.bind(
    element,
    name,
    thisObject,
    func,
    useCapture
  );
}

export function isWorkspaceReadOnly(workspace) {
  return false; // TODO - used for feedback
}

export function blockLimitExceeded() {
  return false;
}

export function getBlockLimit(blockType) {
  return 0;
}

/**
 * Returns a new Field object,
 * conditional on the type of block we're trying to create.
 * @param {string} type
 * @returns {?Blockly.Field}
 */
export function getField(type) {
  let field;
  if (type === Blockly.BlockValueType.NUMBER) {
    field = new Blockly.FieldNumber();
  } else if (type.includes('ClampedNumber')) {
    const clampedNumberMatch = type.match(CLAMPED_NUMBER_REGEX);
    if (clampedNumberMatch) {
      const min = parseFloat(clampedNumberMatch[1]);
      const max = parseFloat(clampedNumberMatch[2]);
      field = new Blockly.FieldNumber(0, min, max);
    }
  } else {
    field = new Blockly.FieldTextInput();
  }
  return field;
}

/**
 * Returns a theme object, based on the presence of an option in the browser's localStorage.
 * @param {string} type
 * @returns {?Blockly.Field}
 */
// Users can change their active theme using the context menu. Use this setting, if present.
export function getUserTheme(themeOption) {
  return Blockly.themes[localStorage.blocklyTheme] || themeOption || cdoTheme;
}

export function getCode(workspace) {
  const dcdoFlagSet = DCDO.get('blockly-json-experiment', false);
  const dcdoSampleRate = DCDO.get('blockly-json-sample-rate', 0);
  const experimentEnabled = experiments.isEnabled(experiments.BLOCKLY_JSON);

  // This feature can be turned off with DCDO.set('blockly-json-experiment', false).
  // Additionally rate must be specified, e.g. DCDO.set('blockly-json-sample-rate', 0.05).
  // The rate is ignored if the user has added ?enableExperiments=blocklyJson to the URL.
  if (dcdoFlagSet && (experimentEnabled || dcdoSampleRate >= Math.random())) {
    // Begin collecting data about our ability to correctly serialize a workspace in JSON format.
    setTimeout(() => {
      // Execute the Json serialization test asynchronously so we don't block saving.
      testJsonSerialization(workspace);
    }, 0);
  }
  return Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(workspace));
}

function testJsonSerialization(workspace) {
  const experimentEnabled = experiments.isEnabled(experiments.BLOCKLY_JSON);
  const FIREHOSE_STUDY = 'blockly-json';
  const FIREHOSE_EVENT = 'block-differences';
  Blockly.Events.disable();

  // Create an array of blocks based on JSON serialization of the current workspace.
  const jsonSerialization = Blockly.serialization.workspaces.save(workspace);
  const tempJsonWorkspace = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(jsonSerialization, tempJsonWorkspace);
  const jsonBlocks = tempJsonWorkspace.getAllBlocks();

  // Create an array of blocks based on the XML encoding of the current workspace.
  const xmlSerialization = Blockly.Xml.blockSpaceToDom(workspace);
  const tempXmlWorkspace = new Blockly.Workspace();
  Blockly.Xml.domToWorkspace(xmlSerialization, tempXmlWorkspace);
  const xmlBlocks = tempXmlWorkspace.getAllBlocks();

  // compareBlockArrays returns an array of differences found.
  const differences = compareBlockArrays(xmlBlocks, jsonBlocks);
  if (differences.length > 0 || experimentEnabled) {
    // Log a record to Firehose/Redshift.
    const recordData = {
      projectUrl: dashboard.project.getShareUrl(),
      blocklyVersion: Blockly.blockly_.VERSION,
      differences: differences,
    };
    firehoseClient.putRecord(
      {
        study: FIREHOSE_STUDY,
        event: FIREHOSE_EVENT,
        data_json: JSON.stringify(recordData),
      },
      {
        alwaysPut: true, // Allows logging from development environments
        includeUserId: true,
      }
    );
  }
  if (experiments.isEnabled(experiments.BLOCKLY_JSON)) {
    // Avoid logging to the console for typical users.
    console.log({
      differences: differences,
      jsonSerialization: jsonSerialization,
      xmlSerialization: xmlSerialization,
    });
  }
  Blockly.Events.enable();
}

// Used to find differences between blocks created from xml and json sources.
// Called when the app is initialized and each time the app runs.
// Compares two block arrays and returns an array of differences between them.
export function compareBlockArrays(xmlBlocks, jsonBlocks) {
  // compareValues() will be called recursively so we need to keep track of objects
  // that it has already compared, to prevent infinite loops caused by circular
  // references.
  const visited = new Set();
  // Some block properties are expected to hold different values, or refer to blocks already in the array.
  const keysToSkip = [
    'parentBlock_', // a circular reference to another block in the array
    'sourceBlock_', // a circular reference to another block in the array
    'workspace', // a reference to the unique temporary workspaces used to create the two block arrays
  ];

  function compareValues(arg1, arg2, path = '', differences = []) {
    if (arg1 === arg2) {
      return differences;
    }

    if (arg1 && arg2 && typeof arg1 === 'object' && typeof arg2 === 'object') {
      if (visited.has(arg1) || visited.has(arg2)) {
        return differences; // Circular reference found, skip this object
      }
      visited.add(arg1);
      visited.add(arg2);

      const keys1 = Object.keys(arg1).sort();
      const keys2 = Object.keys(arg2).sort();

      if (keys1.length !== keys2.length) {
        differences.push({
          result: 'different number of keys',
          path: path,
          keys1: keys1.toString(),
          keys2: keys2.toString(),
        });
        return differences; // Don't try comparing properties if we have the wrong amount.
      }

      for (let i = 0; i < keys1.length; i++) {
        const key1 = keys1[i];
        const key2 = keys2[i];

        if (key1 !== key2) {
          differences.push({
            result: 'different keys',
            path: path,
            key1: key1,
            key2: key2,
          });
        }

        const value1 = arg1[key1];
        const value2 = arg2[key2];
        const value1Type = typeof value1;
        const value2Type = typeof value2;

        if (value1Type === 'function' && value2Type === 'function') {
          continue;
        }
        if (value1Type !== value2Type) {
          differences.push({
            result: 'different types',
            path: path,
            key: key1,
            value1Type: value1Type,
            value2Type: value2Type,
          });
        }

        if (value1Type === 'object') {
          // Skip comparisons for references to other blocks and to the tempoary workspaces.
          if (keysToSkip.includes(key1)) {
            continue;
          }
          differences = compareValues(
            value1,
            value2,
            `${path}.${key1}`,
            differences
          );
        } else if (value1 !== value2) {
          differences.push({
            result: 'different values',
            path: path,
            key: key1,
            value1: value1,
            value2: value2,
          });
        }
      }

      visited.delete(arg1);
      visited.delete(arg2);

      return differences;
    }

    differences.push({
      result: 'non-object',
      path: path,
      type1: typeof arg1,
      type2: typeof arg2,
    });
  }

  return compareValues(xmlBlocks, jsonBlocks);
}

export function soundField(onClick, transformText, icon) {
  // Handle 'play sound' block with default param from CDO blockly.
  // TODO: Remove when sprite lab is migrated to Google blockly.
  const validator = newValue => {
    if (typeof newValue !== 'string') {
      return null;
    }
    if (!newValue.startsWith(SOUND_PREFIX) || !newValue.endsWith('.mp3')) {
      console.error(
        'An invalid sound value was selected. Therefore, the default sound value will be used.'
      );
      return DEFAULT_SOUND;
    }
    return newValue;
  };
  return new Blockly.FieldButton({
    value: DEFAULT_SOUND,
    validator,
    onClick,
    transformText,
    icon,
  });
}

export function locationField(icon, onClick) {
  const transformTextSetField = value => {
    if (value) {
      try {
        const loc = JSON.parse(value);
        return `(${loc.x}, ${APP_HEIGHT - loc.y})`;
      } catch (e) {
        // Just ignore bad values
      }
    }
  };
  return new Blockly.FieldButton({
    onClick,
    transformText: transformTextSetField,
    icon,
  });
}
