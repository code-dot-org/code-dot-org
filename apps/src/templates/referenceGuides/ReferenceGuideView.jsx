import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';

export default function ReferenceGuideView({referenceGuide}) {
  return (
    <div>
      <h1>{referenceGuide.display_name}</h1>
      <EnhancedSafeMarkdown markdown={referenceGuide.content} />
    </div>
  );
}

const referenceGuideShape = PropTypes.shape({
  display_name: PropTypes.string,
  content: PropTypes.string
});

ReferenceGuideView.propTypes = {
  referenceGuide: referenceGuideShape.isRequired
};
