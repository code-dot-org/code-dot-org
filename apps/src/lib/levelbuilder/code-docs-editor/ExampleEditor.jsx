import PropTypes from 'prop-types';
import React from 'react';

import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import color from '@cdo/apps/util/color';

import ImageInput from '../ImageInput';

const APP_DISPLAY_OPTIONS = {
  embedAppWithCode: 'Embed app with code directly',
  codeFromCodeField: 'Display app with code from code field above',
};

const DEFAULT_EMBED_HEIGHT = 400;

export default function ExampleEditor({example, updateExample}) {
  return (
    <div>
      <label>
        Name
        <input
          value={example.name || ''}
          onChange={e => updateExample('name', e.target.value)}
          style={styles.textInput}
        />
      </label>
      <TextareaWithMarkdownPreview
        markdown={example.description || ''}
        label={'Description'}
        handleMarkdownChange={e => updateExample('description', e.target.value)}
        features={{imageUpload: true}}
      />
      <TextareaWithMarkdownPreview
        markdown={example.code || ''}
        label={'Code'}
        handleMarkdownChange={e => updateExample('code', e.target.value)}
        features={{imageUpload: true}}
      />
      <label>
        Example App
        <HelpTip>Sharing link for example app</HelpTip>
        <input
          value={example.app || ''}
          onChange={e => updateExample('app', e.target.value)}
          style={styles.textInput}
        />
      </label>
      <ImageInput
        initialImageUrl={example.image}
        updateImageUrl={img => updateExample('image', img)}
      />
      <label>
        Example App Display Type
        <select
          value={example.app_display_type || 'embedAppWithCode'}
          onChange={e => updateExample('app_display_type', e.target.value)}
          style={styles.selectInput}
        >
          {Object.keys(APP_DISPLAY_OPTIONS).map(key => (
            <option key={key} value={key}>
              {APP_DISPLAY_OPTIONS[key]}
            </option>
          ))}
        </select>
        <HelpTip>
          How the app and code fields for this example are rendered
        </HelpTip>
      </label>
      <label>
        Example App iframe Embed Height
        <HelpTip>
          The height of the iframe, in pixels, to use when displaying an app
          with the "Embed app with code" display type. Note that the minimum
          height is 400px.
        </HelpTip>
        <input
          value={example.embed_app_with_code_height || DEFAULT_EMBED_HEIGHT}
          onChange={e =>
            updateExample('embed_app_with_code_height', e.target.value)
          }
          style={styles.textInput}
        />{' '}
      </label>
    </div>
  );
}

ExampleEditor.propTypes = {
  example: PropTypes.object,
  updateExample: PropTypes.func,
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
