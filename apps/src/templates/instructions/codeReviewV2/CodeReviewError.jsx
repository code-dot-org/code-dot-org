import PropTypes from 'prop-types';
import React from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import color from '@cdo/apps/util/color';
import javalabMsg from '@cdo/javalab/locale';

const CodeReviewError = ({messageTitle, messageText, style = {}}) => {
  const title = messageTitle || javalabMsg.genericError();
  const text = messageText || javalabMsg.genericErrorMessage();
  return (
    <div style={{...styles.saveStatus, ...style}}>
      <FontAwesome icon="exclamation-circle" style={styles.iconError} />
      <div>
        <p style={styles.messageTitle}>{title}</p>
        <p style={styles.messageText}>{text}</p>
      </div>
    </div>
  );
};

const styles = {
  saveStatus: {
    display: 'flex',
    marginTop: 2,
  },
  iconError: {
    color: color.light_orange,
    fontSize: 30,
    marginRight: 10,
  },
  messageTitle: {
    ...fontConstants['main-font-semi-bold'],
    fontSize: 14,
    marginBottom: 0,
    color: color.dark_charcoal,
  },
  messageText: {
    fontStyle: 'italic',
    fontSize: 12,
    marginBottom: 0,
    color: color.dark_charcoal,
  },
};

export default CodeReviewError;

CodeReviewError.propTypes = {
  messageTitle: PropTypes.string,
  messageText: PropTypes.string,
  style: PropTypes.object,
};
