import React from 'react';
import PropTypes from 'prop-types';
// import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
// import i18n from '@cdo/locale';
// import styleConstants from '../../styleConstants';
// import color from '@cdo/apps/util/color';
// import CertificateBatch from '@cdo/apps/templates/certificates/CertificateBatch';

export default function PrintCertificateBatch({
  courseName,
  imageUrl,
  studentNames
}) {
  return (
    <div>
      {courseName}
      <br />
      {imageUrl}
      <br />
      {studentNames}
    </div>
  );
}

PrintCertificateBatch.propTypes = {
  courseName: PropTypes.string,
  imageUrl: PropTypes.string.isRequired,
  studentNames: PropTypes.arrayOf(PropTypes.string).isRequired
};
