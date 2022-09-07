import React from 'react';
import PropTypes from 'prop-types';

export default function PrintCertificateBatch({imageUrls}) {
  const onPrint = () => {
    window.print();
    return false;
  };

  return (
    <div>
      <div className="hide-print">
        <h1>Hour of Code Certificates</h1>
        <p style={styles.paragraph}>Ready to print?</p>
        <p style={styles.paragraph}>
          Look at your certificates first to make sure they're correct before
          you waste a lot of paper.
        </p>
        <p style={styles.paragraph}>
          <span style={styles.bold}>IMPORTANT:</span> Make sure you print in
          Landscape orientation (sideways, not regular), so the certificates
          fill a full page.
        </p>
        <p style={styles.paragraph}>When you're ready...</p>
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

const styles = {
  paragraph: {
    fontSize: 15
  },
  bold: {
    fontFamily: "'Gotham 7r', sans-serif"
  }
};
