import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';

function ProgrammingEnvironmentBox({programmingEnvironment}) {
  return (
    <div style={styles.box}>
      {programmingEnvironment.imageUrl && (
        <img src={programmingEnvironment.imageUrl} />
      )}
      {programmingEnvironment.title}
      <EnhancedSafeMarkdown markdown={programmingEnvironment.description} />
    </div>
  );
}

export default function ProgrammingEnvironmentIndex({programmingEnvironments}) {
  return (
    <div style={styles.flex}>
      {programmingEnvironments.map(env => (
        <ProgrammingEnvironmentBox
          key={env.name}
          programmingEnvironment={env}
        />
      ))}
    </div>
  );
}

ProgrammingEnvironmentIndex.propTypes = {
  programmingEnvironments: PropTypes.arrayOf(PropTypes.object).isRequired
};

ProgrammingEnvironmentBox.propTypes = {
  programmingEnvironment: PropTypes.object.isRequired
};

const styles = {
  box: {
    borderStyle: 'solid',
    borderColor: 'black',
    borderWidth: 1,
    width: '45%',
    padding: 5,
    margin: 5
  },
  flex: {
    display: 'flex',
    flexWrap: 'wrap'
  }
};
