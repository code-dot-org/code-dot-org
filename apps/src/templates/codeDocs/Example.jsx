import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';

export default function Example({example, programmingEnvironmentName}) {
  const content = (
    <>
      {example.name && <h3>{example.name}</h3>}
      {example.description && (
        <EnhancedSafeMarkdown markdown={example.description} />
      )}
      {example.code && <EnhancedSafeMarkdown markdown={example.code} />}
    </>
  );
  if (example.app) {
    if (example.app_display_type === 'codeFromCodeField') {
      const embedUrl = example.app.endsWith('embed')
        ? example.app
        : example.app + '/embed';
      return (
        <div style={styles.example}>
          <div style={{width: '50%'}}>{content}</div>
          <iframe
            src={embedUrl}
            style={{
              ...styles.embeddedApp,
              ...embeddedIdeStyles[programmingEnvironmentName]
            }}
          />
          {example.imageUrl && <img src={example.imageUrl} />}
        </div>
      );
    } else {
      const embedUrl = example.app.endsWith('embed_app_and_code')
        ? example.app
        : example.app + '/embed_app_and_code';
      return (
        <div style={{width: '100%'}}>
          <div>
            {content}
            <iframe
              src={embedUrl}
              style={{
                width: '100%',
                height: Number(example.embed_app_with_code_height) || 310
              }}
            />
          </div>
          {example.imageUrl && <img src={example.imageUrl} />}
        </div>
      );
    }
  } else {
    return (
      <div>
        {content}
        {example.imageUrl && <img src={example.imageUrl} />}
      </div>
    );
  }
}

Example.propTypes = {
  example: PropTypes.object,
  programmingEnvironmentName: PropTypes.string
};

const styles = {
  example: {
    display: 'flex',
    gap: 10
  },
  embeddedApp: {
    border: 0,
    transformOrigin: '0 0'
  }
};

const embeddedIdeStyles = {
  applab: {
    width: 375,
    height: 620,
    transform: 'scale(0.7)'
  },
  gamelab: {
    width: 450,
    height: 781,
    transform: 'scale(0.5)'
  }
};
