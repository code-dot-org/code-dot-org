import PropTypes from 'prop-types';
import React from 'react';
import EmbeddedBlock from '@cdo/apps/templates/codeDocs/EmbeddedBlock';

export default function CodeDocLink({programmingExpression, showBlocks}) {
  if (showBlocks && programmingExpression.blockName) {
    return (
      <EmbeddedBlock
        blockName={programmingExpression.blockName}
        link={programmingExpression.link}
      />
    );
  } else {
    return (
      <a href={programmingExpression.link}>{programmingExpression.name}</a>
    );
  }
}

CodeDocLink.propTypes = {
  programmingExpression: PropTypes.shape({
    name: PropTypes.string,
    link: PropTypes.string
  }).isRequired
};
