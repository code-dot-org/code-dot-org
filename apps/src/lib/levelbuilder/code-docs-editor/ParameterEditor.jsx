import PropTypes from 'prop-types';
import React from 'react';
import color from '@cdo/apps/util/color';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';

export default function ParameterEditor({
  parameter,
  updateParameter,
  moveParameterUp,
  moveParameterDown,
  removeParameter
}) {
  return (
    <div>
      <div style={styles.control}>
        <i onClick={() => moveParameterUp()} className="fa fa-caret-up" />
        <i onClick={() => moveParameterDown()} className="fa fa-caret-down" />
        <i onClick={() => removeParameter()} className="fa fa-trash" />
      </div>
      <label>
        Name
        <input
          value={parameter.name || ''}
          onChange={e => updateParameter('name', e.target.value)}
          style={styles.textInput}
        />
      </label>
      <label>
        Type
        <input
          value={parameter.type || ''}
          onChange={e => updateParameter('type', e.target.value)}
          style={styles.textInput}
        />
      </label>
      <label>
        Required?
        <input
          value={false}
          type="checkbox"
          onChange={e => updateParameter('required', e.target.value)}
        />
      </label>
      <TextareaWithMarkdownPreview
        markdown={parameter.description || ''}
        label={'Description'}
        handleMarkdownChange={e =>
          updateParameter('description', e.target.value)
        }
        features={{imageUpload: true}}
      />
    </div>
  );
}

ParameterEditor.propTypes = {
  parameter: PropTypes.object,
  updateParameter: PropTypes.func,
  moveParameterUp: PropTypes.func,
  moveParameterDown: PropTypes.func,
  removeParameter: PropTypes.func
};

const styles = {
  textInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: `1px solid ${color.bootstrap_border_color}`,
    borderRadius: 4,
    margin: 0
  },
  controls: {
    display: 'flex'
  }
};
