import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';
import CreativeCommons from '@cdo/static/creative-commons-by-nc-sa.png';

const CopyrightInfo = () => {
  const licenseURL = 'http://creativecommons.org/licenses/by-nc-sa/4.0/';

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          alignItems: 'baseline',
          margin: '20px 0 5px 0',
        }}
      >
        <a rel="license" href={licenseURL}>
          <img
            style={{height: 40, paddingRight: 10}}
            src={CreativeCommons}
            alt="Creative Commons License (CC BY-NC-SA 4.0)."
          />
        </a>
        <SafeMarkdown
          markdown={i18n.licenseInformation({
            link: 'http://creativecommons.org/licenses/by-nc-sa/4.0/',
          })}
          openExternalLinksInNewTab
        />
      </div>
      <SafeMarkdown
        markdown={i18n.licenseMaterials({link: 'https://code.org/contact'})}
      />
    </div>
  );
};

export default CopyrightInfo;
