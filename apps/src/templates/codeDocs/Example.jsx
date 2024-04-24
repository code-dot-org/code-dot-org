import PropTypes from 'prop-types';
import React from 'react';

import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import i18n from '@cdo/locale';

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
          <div style={{flexGrow: 1}}>{content}</div>
          <div style={embeddedIdeContainerStyles[programmingEnvironmentName]}>
            <iframe
              src={embedUrl}
              style={{
                ...styles.embeddedApp,
                ...embeddedIdeStyles[programmingEnvironmentName],
              }}
              title={i18n.embeddedExampleFor({
                name: programmingEnvironmentName,
              })}
            />
            {
              // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
              // Verify or update this alt-text as necessary
            }
            {example.image && <img src={example.image} alt="" />}
          </div>
        </div>
      );
    } else {
      const embedUrl = example.app.endsWith('embed_app_and_code')
        ? example.app
        : example.app + '/embed_app_and_code';
      const enteredHeight =
        Number(example.embed_app_with_code_height) > 400
          ? Number(example.embed_app_with_code_height)
          : 400;
      return (
        <div style={{width: '100%'}}>
          <div>
            {content}
            <div style={{height: enteredHeight, overflow: 'scroll'}}>
              <iframe
                src={embedUrl}
                style={{
                  width: '100%',
                  height: enteredHeight * 1.5,
                }}
                title={i18n.embeddedExampleFor({
                  name: programmingEnvironmentName,
                })}
              />
            </div>
          </div>
          {
            // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
            // Verify or update this alt-text as necessary
          }
          {example.image && <img src={example.image} alt="" />}
        </div>
      );
    }
  } else {
    return (
      <div>
        {content}
        {
          // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
          // Verify or update this alt-text as necessary
        }
        {example.image && <img src={example.image} alt="" />}
      </div>
    );
  }
}

Example.propTypes = {
  example: PropTypes.object,
  programmingEnvironmentName: PropTypes.string,
};

const styles = {
  example: {
    display: 'flex',
    gap: 20,
  },
  embeddedApp: {
    border: 0,
    transformOrigin: '0 0',
  },
};

const embeddedIdeStyles = {
  applab: {
    width: 375,
    height: 620,
    transform: 'scale(0.7)',
  },
  gamelab: {
    width: 450,
    height: 781,
    transform: 'scale(0.5)',
  },
};

const embeddedIdeContainerStyles = {
  applab: {
    width: '280px',
    height: '450px',
    paddingTop: '10px',
  },
  gamelab: {
    width: '240px',
    height: '400px',
    paddingTop: '20px',
  },
};
