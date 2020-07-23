import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';
import DropletPaletteSelector from '@cdo/apps/lib/levelbuilder/DropletPaletteSelector';

const data = getScriptData('pageOptions');

const fieldConfig = {
  starterCode: {
    codemirror: 'level_start_blocks',
    codemirrorMode: 'javascript'
  },
  codeFunctions: {
    hideWhen: !data.uses_droplet,
    codemirror: 'level_code_functions',
    codemirrorMode: 'javascript'
  }
};

Object.keys(fieldConfig).forEach(key => {
  const config = fieldConfig[key];
  if (config.hideWhen) {
    return;
  }
  const mode =
    config.codemirrorMode || (data.uses_droplet ? 'javascript' : 'xml');
  config.editor = initializeCodeMirror(config.codemirror, mode);
});

if (data.original_palette && !fieldConfig.codeFunctions.hideWhen) {
  ReactDOM.render(
    <DropletPaletteSelector
      palette={data.original_palette}
      editor={fieldConfig.codeFunctions.editor}
    />,
    $('<div></div>')
      .insertAfter(`label[for="${fieldConfig.codeFunctions.codemirror}"]`)
      .get(0)
  );
}
