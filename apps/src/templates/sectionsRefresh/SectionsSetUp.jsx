import React from 'react';
import i18n from '@cdo/locale';

export default function SectionsSetUp() {
  return (
    <div>
      <h1>{i18n.setUpClassSectionsHeader()}</h1>
      <p>{i18n.setUpClassSectionsSubheader()}</p>
      <p>
        <a href="code.org">{i18n.setUpClassSectionsSubheaderLink()}</a>
      </p>
    </div>
  );
}
