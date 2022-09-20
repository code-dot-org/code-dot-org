import React from 'react';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';
import CreativeCommons from '@cdo/static/creative-commons-by-nc-sa.png';

const CopyrightInfo = () => {
  const licenseURL = 'http://creativecommons.org/licenses/by-nc-sa/4.0/';

  return (
    <div>
      <a rel="license" href={licenseURL}>
        <img
          style={{height: 30, margin: '10px 10px 5px 0'}}
          src={CreativeCommons}
          alt="Creative Commons License (CC BY-NC-SA 4.0)."
        />
      </a>
      This work is licensed under a{' '}
      <a rel="license" href={licenseURL}>
        Creative Commons BY-NC-SA 4.0 International License
      </a>
      .
      <SafeMarkdown
        markdown={i18n.licenseMaterials({link: 'https://code.org/contact'})}
      />
    </div>
  );
};

export default CopyrightInfo;
