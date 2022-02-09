import React from 'react';
import PropTypes from 'prop-types';

export default function CertificateShare(props) {
  return (
    <a href={props.printUrl}>
      <img
        src={props.imageUrl}
        alt="Certificate for Completion of One Hour of Code"
        width="100%"
      />
    </a>
  );
}

CertificateShare.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  printUrl: PropTypes.string.isRequired
};
