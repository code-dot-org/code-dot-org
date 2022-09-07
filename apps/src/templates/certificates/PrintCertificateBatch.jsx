import React from 'react';
import PropTypes from 'prop-types';
// import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
// import i18n from '@cdo/locale';
// import styleConstants from '../../styleConstants';
// import color from '@cdo/apps/util/color';
// import CertificateBatch from '@cdo/apps/templates/certificates/CertificateBatch';

export default function PrintCertificateBatch({imageUrls}) {
  const onPrint = () => {
    window.print();
    return false;
  };

  return (
    <div>
      <div className="hide-print">
        <p>Ready to print?</p>
        <p>
          Look at your certificates first to make sure they're correct before
          you waste a lot of paper.
        </p>
        <p>
          <b>IMPORTANT:</b> Make sure you print in Landscape orientation
          (sideways, not regular), so the certificates fill a full page.
        </p>
        <p>When you're ready...</p>
        <button type="button" onClick={onPrint}>
          Print
        </button>
      </div>
      {imageUrls.map((imageUrl, index) => (
        <div key={imageUrl}>
          {index > 0 && <div className="page-break" />}
          <img src={imageUrl} width="100%" />
        </div>
      ))}
    </div>
  );
}

PrintCertificateBatch.propTypes = {
  imageUrls: PropTypes.arrayOf(PropTypes.string).isRequired
};
