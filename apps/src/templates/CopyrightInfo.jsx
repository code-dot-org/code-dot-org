import React from 'react';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

const CopyrightInfo = () => (
  <div>
    <a href="https://creativecommons.org/">
      <img
        src="https://curriculum.code.org/static/img/creativeCommons-by-nc-sa.png"
        alt="This curriculum is available under a Creative Commons License (CC BY-NC-SA 4.0)."
      />
    </a>
    <SafeMarkdown
      markdown={i18n.licenseMaterials({link: 'https://code.org/contact'})}
    />
  </div>
);

export default CopyrightInfo;
