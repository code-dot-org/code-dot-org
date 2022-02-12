import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';

export default function CertificateShare(props) {
  return (
    <a href={props.printUrl}>
      <img
        src={props.imageUrl}
        alt={i18n.certificateForCompletion()}
        width="100%"
      />
    </a>
  );
}

CertificateShare.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  printUrl: PropTypes.string.isRequired
};
