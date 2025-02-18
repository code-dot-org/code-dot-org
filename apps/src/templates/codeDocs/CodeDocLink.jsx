import {TextLink} from '@dsco_/link';
import PropTypes from 'prop-types';
import React from 'react';

import EmbeddedBlock from '@cdo/apps/templates/codeDocs/EmbeddedBlock';

export default function CodeDocLink({programmingExpression, showBlocks}) {
  if (showBlocks && programmingExpression.blockName) {
    return (
      <EmbeddedBlock
        blockName={programmingExpression.blockName}
        link={programmingExpression.link}
        ariaLabel={programmingExpression.name}
      />
    );
  } else {
    return (
      <TextLink
        href={programmingExpression.link}
        text={programmingExpression.name}
      />
    );
  }
}

CodeDocLink.propTypes = {
  programmingExpression: PropTypes.shape({
    name: PropTypes.string,
    link: PropTypes.string,
    blockName: PropTypes.string,
  }).isRequired,
  showBlocks: PropTypes.bool,
};
