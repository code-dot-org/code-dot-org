import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

export default function PrintCertificateBatch({imageUrls}) {
  const onPrint = () => {
    window.print();
    return false;
  };

  return (
    <div>
      <div className="hide-print">
        <h1>{i18n.hourOfCodeCertificatesHeading()}</h1>
        <p style={styles.paragraph}>{i18n.readyToPrint()}</p>
        <p style={styles.paragraph}>{i18n.verifyCertificates()}</p>
        <p style={styles.paragraph}>
          <SafeMarkdown markdown={i18n.printLandscape()} />
        </p>
        <p style={styles.paragraph}>{i18n.whenYouAreReady()}</p>
        <button type="button" onClick={onPrint}>
          {i18n.print()}
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

const styles = {
  paragraph: {
    fontSize: 15
  },
  bold: {
    fontFamily: "'Gotham 7r', sans-serif"
  }
};
