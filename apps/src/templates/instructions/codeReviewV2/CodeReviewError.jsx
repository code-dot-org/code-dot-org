import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import javalabMsg from '@cdo/javalab/locale';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const CodeReviewError = ({messageTitle, messageText}) => {
  const title = messageTitle || javalabMsg.genericError();
  const text = messageText || javalabMsg.genericErrorMessage();
  return (
    <div style={styles.saveStatus}>
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
    marginTop: 2
  },
  iconError: {
    color: color.light_orange,
    fontSize: 30,
    marginRight: 10
  },
  messageTitle: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14,
    marginBottom: 0,
    color: color.dark_charcoal
  },
  messageText: {
    fontStyle: 'italic',
    fontSize: 12,
    marginBottom: 0,
    color: color.dark_charcoal
  }
};

export default CodeReviewError;

CodeReviewError.propTypes = {
  messageTitle: PropTypes.string,
  messageText: PropTypes.string
};
