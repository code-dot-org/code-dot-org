import PropTypes from 'prop-types';
import React from 'react';

import CopyrightInfo from '@cdo/apps/templates/CopyrightInfo';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import i18n from '@cdo/locale';
import '../../../style/curriculum/documentation_tables.scss';

const referenceGuideShape = PropTypes.shape({
  content: PropTypes.string,
});

export default function ReferenceGuide({referenceGuide}) {
  return (
    <div>
      <EnhancedSafeMarkdown
        markdown={referenceGuide.content}
        className="docs-pages"
      />
      <EnhancedSafeMarkdown
        markdown={i18n.documentationBug()}
        className="docs-pages"
      />
      <CopyrightInfo />
    </div>
  );
}

ReferenceGuide.propTypes = {
  referenceGuide: referenceGuideShape.isRequired,
};
