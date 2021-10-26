import PropTypes from 'prop-types';
import React from 'react';
import color from '@cdo/apps/util/color';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';

export default function ParameterEditor({
  item: parameter,
  update,
  moveUp,
  moveDown,
  remove
}) {
  return (
    <div>
      <div style={styles.control}>
        <i onClick={() => moveUp()} className="fa fa-caret-up" />
        <i onClick={() => moveDown()} className="fa fa-caret-down" />
        <i onClick={() => remove()} className="fa fa-trash" />
      </div>
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
  item: PropTypes.object,
  update: PropTypes.func,
  moveUp: PropTypes.func,
  moveDown: PropTypes.func,
  remove: PropTypes.func
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
