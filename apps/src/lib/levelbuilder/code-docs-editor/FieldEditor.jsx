import PropTypes from 'prop-types';
import React from 'react';

import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import color from '@cdo/apps/util/color';

export default function FieldEditor({field, updateField}) {
  return (
    <div>
      <label>
        Name
        <input
          value={field.name || ''}
          onChange={e => updateField('name', e.target.value)}
          style={styles.textInput}
        />
      </label>
      <label>
        Type
        <input
          value={field.type || ''}
          onChange={e => updateField('type', e.target.value)}
          style={styles.textInput}
        />
      </label>

      <TextareaWithMarkdownPreview
        markdown={field.description || ''}
        label={'Description'}
        handleMarkdownChange={e => updateField('description', e.target.value)}
        features={{imageUpload: true}}
      />
    </div>
  );
}

FieldEditor.propTypes = {
  field: PropTypes.object,
  updateField: PropTypes.func,
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
  selectInput: {
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: `1px solid ${color.bootstrap_border_color}`,
    borderRadius: 4,
    marginLeft: 5,
    width: 350,
  },
};
