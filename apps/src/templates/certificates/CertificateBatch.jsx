import React from 'react';
import PropTypes from 'prop-types';
import styleConstants from '../../styleConstants';

export default function CertificateBatch({courseName, imageUrl}) {
  return (
    <div style={styles.wrapper}>
      <h1>Print a batch of certificates</h1>
    </div>
  );
}

const styles = {
  wrapper: {
    with: '100%',
    maxWidth: styleConstants['content-width'],
    marginLeft: 'auto',
    marginRight: 'auto'
  }
};

CertificateBatch.propTypes = {
  courseName: PropTypes.string,
  imageUrl: PropTypes.string.isRequired
};
