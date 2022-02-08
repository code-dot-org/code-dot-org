import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';

export default function ProgrammingEnvironmentIndex({programmingEnvironments}) {
  return (
    <div>
      {programmingEnvironments.map(env => (
        <div key={env.name}>{env.title}</div>
      ))}
    </div>
  );
}

ProgrammingEnvironmentIndex.propTypes = {
  programmingEnvironments: PropTypes.arrayOf(PropTypes.object).isRequired
};
