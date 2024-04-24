import PropTypes from 'prop-types';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

export default function PrintCertificateBatch({imageUrls}) {
  const onPrint = () => {
    window.print();
    return false;
  };

  return (
    <div>
      <div className="hide-print" style={styles.wrapper}>
        <h1>{i18n.hourOfCodeCertificatesHeading()}</h1>
        <p>{i18n.readyToPrint()}</p>
        <p>{i18n.verifyCertificates()}</p>
        <SafeMarkdown markdown={i18n.printLandscape()} />
        <p>{i18n.whenYouAreReady()}</p>
        <button type="button" onClick={onPrint}>
          {i18n.print()}
        </button>
      </div>
      {imageUrls.map((imageUrl, index) => (
        <div key={imageUrl}>
          {index > 0 && <div className="page-break" />}
          {
            // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
            // Verify or update this alt-text as necessary
          }
          <img src={imageUrl} width="100%" alt="" />
        </div>
      ))}
    </div>
  );
}

PrintCertificateBatch.propTypes = {
  imageUrls: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const styles = {
  wrapper: {
    fontSize: 15,
  },
};
