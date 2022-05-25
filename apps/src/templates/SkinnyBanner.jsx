import React from 'react';

const IMAGE_BASE_URL = '/blockly/media/';

export default function SkinnyBanner() {
  const header_text = 'A new approach to AP® CSA!';
  const text =
    'Creative projects and real world connections in our equity-driven curriculum';

  return (
    <div style={styles.csaSkinnyBanner}>
      <a href="/educate/csa">
        <div className="wrapper">
          <div className="text-wrapper">
            <h1>{header_text}</h1>
            <p>{text}</p>
          </div>
          <div className="img-wrapper">
            <img
              src={IMAGE_BASE_URL + 'csa-skinny-banner-image.png'}
              alt="Two screenshots of the CSA curriculum w/ the College Board AP CSA Endorsed badge"
            />
          </div>
          <div className="button-wrapper">
            <span>Learn more</span>
          </div>
        </div>
      </a>
    </div>
  );
}

const styles = {
  csaSkinnyBanner: {
    width: '100%',
    display: 'inline-block',
    boxSizing: 'border-box',
    height: '120px',
    marginBottom: '2em',
    padding: '0 2.5em',
    background: `url(/blockly/media/csa-skinny-banner-bg.png) top left no-repeat`,
    overflow: 'hidden'
  }
};
