import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import i18n from '@cdo/locale';
import CopyrightInfo from '@cdo/apps/templates/CopyrightInfo';

const referenceGuideShape = PropTypes.shape({
  content: PropTypes.string
});

export default function ReferenceGuide({referenceGuide}) {
  return (
    <div>
      <EnhancedSafeMarkdown markdown={referenceGuide.content} />
      <EnhancedSafeMarkdown markdown={i18n.documentationBug()} />
      <CopyrightInfo />
    </div>
  );
}

ReferenceGuide.propTypes = {
  referenceGuide: referenceGuideShape.isRequired
};
