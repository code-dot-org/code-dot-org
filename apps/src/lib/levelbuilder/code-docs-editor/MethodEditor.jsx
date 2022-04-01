import PropTypes from 'prop-types';
import React from 'react';
import color from '@cdo/apps/util/color';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';

export default function MethodEditor({method, updateMethod}) {
  return (
    <div>
      <label>
        Display Name
        <input
          value={method.name || ''}
          onChange={e => updateMethod('name', e.target.value)}
          style={styles.textInput}
        />
      </label>
      <TextareaWithMarkdownPreview
        markdown={method.content || ''}
        label={'Content'}
        handleMarkdownChange={e => updateMethod('content', e.target.value)}
        features={{imageUpdate: true}}
      />
    </div>
  );
}

MethodEditor.propTypes = {
  method: PropTypes.object.isRequired,
  updateMethod: PropTypes.func.isRequired
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
  selectInput: {
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: `1px solid ${color.bootstrap_border_color}`,
    borderRadius: 4,
    marginBottom: 0,
    marginLeft: 5
  }
};
