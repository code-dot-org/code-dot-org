import PropTypes from 'prop-types';
import React from 'react';

import TextareaWithMarkdownPreview from '@cdo/apps/levelbuilder/TextareaWithMarkdownPreview';
import HelpTip from '@cdo/apps/sharedComponents/HelpTip';
import color from '@cdo/apps/util/color';

export default function ParameterEditor({parameter, update}) {
  return (
    <div>
      <label>
        Name
        <input
          value={parameter.name || ''}
          onChange={e => update('name', e.target.value)}
          style={styles.textInput}
        />
      </label>
      <label>
        Type
        <HelpTip>Data type, capitalized</HelpTip>
        <input
          value={parameter.type || ''}
          onChange={e => update('type', e.target.value)}
          style={styles.textInput}
        />
      </label>
      <label>
        Required?
        <input
          checked={!!parameter.required}
          type="checkbox"
          onChange={e => update('required', e.target.checked)}
          style={styles.checkboxInput}
        />
      </label>
      <TextareaWithMarkdownPreview
        markdown={parameter.description || ''}
        label={'Description'}
        handleMarkdownChange={e => update('description', e.target.value)}
        features={{imageUpload: true}}
      />
    </div>
  );
}

ParameterEditor.propTypes = {
  parameter: PropTypes.object,
  update: PropTypes.func,
};

const styles = {
  textInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: `1px solid ${color.bootstrap_border_color}`,
    borderRadius: 4,
    margin: 0,
  },
  checkboxInput: {
    margin: '0px 4px',
  },
};
