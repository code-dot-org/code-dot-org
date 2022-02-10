import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import Button from '@cdo/apps/templates/Button';

function ProgrammingEnvironmentBox({programmingEnvironment}) {
  return (
    <div style={styles.box}>
      <div>
        {programmingEnvironment.imageUrl && (
          <img style={styles.image} src={programmingEnvironment.imageUrl} />
        )}
        <h2>{programmingEnvironment.title}</h2>
        <EnhancedSafeMarkdown markdown={programmingEnvironment.description} />
      </div>
      <Button
        __useDeprecatedTag
        color={Button.Orange}
        href={`/docs/${programmingEnvironment.name}`}
        text="View Code Docs"
      />
    </div>
  );
}

export default function ProgrammingEnvironmentIndex({programmingEnvironments}) {
  return (
    <div style={styles.all}>
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
    borderRadius: 5,
    width: '30%',
    padding: '5px 5px 10px',
    margin: 5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  all: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  image: {
    width: '100%'
  }
};
