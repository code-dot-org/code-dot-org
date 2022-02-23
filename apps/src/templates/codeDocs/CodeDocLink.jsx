import PropTypes from 'prop-types';
import React from 'react';
import EmbeddedBlock from '@cdo/apps/templates/codeDocs/EmbeddedBlock';
import {Link} from '@dsco_/link';

export default function CodeDocLink({programmingExpression}) {
  if (programmingExpression.blockName) {
    return (
      <EmbeddedBlock
        blockName={programmingExpression.blockName}
        link={programmingExpression.link}
      />
    );
  } else {
    return (
      <Link href={programmingExpression.link} weight="regular">
        {programmingExpression.name}
      </Link>
    );
  }
}

CodeDocLink.propTypes = {
  programmingExpression: PropTypes.shape({
    name: PropTypes.string,
    link: PropTypes.string
  }).isRequired
};
