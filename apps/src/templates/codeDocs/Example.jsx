import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';

export default function Example({example, programmingEnvironmentName}) {
  let embedUrl = example.app;
  if (embedUrl) {
    if (example.appDisplayType === 'displayApp') {
      embedUrl = embedUrl.endsWith('embed') ? embedUrl : embedUrl + '/embed';
    } else {
      embedUrl = embedUrl.endsWith('embed_app_and_code')
        ? embedUrl
        : embedUrl + '/embed_app_and_code';
    }
  }
  const width = example.appDisplayType === 'displayApp' ? '50%' : '100%';
  return (
    <div style={styles.example}>
      <div style={{width}}>
        {example.name && <h3>{example.name}</h3>}
        {example.description && <span>{example.description}</span>}
        {example.code && <EnhancedSafeMarkdown markdown={example.code} />}
        {embedUrl && example.appDisplayType === 'directly' && (
          <iframe
            src={embedUrl}
            style={{
              width: '100%',
              height: Number(example.appEmbedHeight) || 310
            }}
          />
        )}
      </div>
      {embedUrl && example.appDisplayType === 'displayApp' && (
        <iframe
          src={embedUrl}
          style={{
            ...styles.embeddedApp,
            ...embeddedIdeStyles[programmingEnvironmentName]
          }}
        />
      )}
      {example.imageUrl && <img source={example.imageUrl} />}
    </div>
  );
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
