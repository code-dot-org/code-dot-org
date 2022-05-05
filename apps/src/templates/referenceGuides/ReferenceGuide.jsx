import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {Link} from '@dsco_/link';

const referenceGuideShape = PropTypes.shape({
  content: PropTypes.string
});

export default function ReferenceGuide({referenceGuide}) {
  return (
    <div>
      <EnhancedSafeMarkdown markdown={referenceGuide.content} />
      <p>
        Found a bug in the documentation? Let us know at{' '}
        <Link href={`mailto:documentation@code.org`}>
          documentation@code.org
        </Link>
      </p>
    </div>
  );
}

ReferenceGuide.propTypes = {
  referenceGuide: referenceGuideShape.isRequired
};
