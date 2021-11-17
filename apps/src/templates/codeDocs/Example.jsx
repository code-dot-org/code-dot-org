import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';

export default function Example({example}) {
  let embedUrl = example.app;
  if (embedUrl) {
    if (example.appDisplayOption === 'directly') {
      embedUrl = embedUrl.endsWith('embed') ? embedUrl : embedUrl + '/embed';
    } else {
      embedUrl = embedUrl.endsWith('embed_app_and_code')
        ? embedUrl
        : embedUrl + '/embed_app_and_code';
    }
  }
  return (
    <div>
      {example.name && <h3>{example.name}</h3>}
      {example.description && <span>{example.description}</span>}
      {example.code && <EnhancedSafeMarkdown markdown={example.code} />}
      {embedUrl && (
        <iframe
          src={embedUrl}
          style={{width: '100%', height: example.appEmbedHeight || 310}}
        />
      )}
      {example.imageUrl && <img source={example.imageUrl} />}
    </div>
  );
}

Example.propTypes = {
  example: PropTypes.object
};
