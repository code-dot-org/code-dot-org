import PropTypes from 'prop-types';
import React from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import i18n from '@cdo/locale';

export function ProgrammingEnvironmentCard({programmingEnvironment}) {
  return (
    <div style={styles.card}>
      <div>
        {programmingEnvironment.imageUrl && (
          // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
          // Verify or update this alt-text as necessary
          <img
            style={styles.image}
            src={programmingEnvironment.imageUrl}
            alt=""
          />
        )}
        {programmingEnvironment.title && (
          <h2>{programmingEnvironment.title}</h2>
        )}
        {programmingEnvironment.description && (
          <EnhancedSafeMarkdown markdown={programmingEnvironment.description} />
        )}
      </div>
      <Button
        __useDeprecatedTag
        color={Button.Orange}
        href={programmingEnvironment.showPath}
        text={i18n.viewCodeDocs()}
      />
    </div>
  );
}

export default function ProgrammingEnvironmentIndex({programmingEnvironments}) {
  return (
    <div>
      <div style={styles.header}>
        <h1>{i18n.ides()}</h1>
        {i18n.ideDescription()}
      </div>
      <div style={styles.all}>
        {programmingEnvironments.map(env => (
          <ProgrammingEnvironmentCard
            key={env.name}
            programmingEnvironment={env}
          />
        ))}
      </div>
    </div>
  );
}

const ProgrammingEnvironmentShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  imageUrl: PropTypes.string,
  showPath: PropTypes.string.isRequired,
});

ProgrammingEnvironmentIndex.propTypes = {
  programmingEnvironments: PropTypes.arrayOf(ProgrammingEnvironmentShape)
    .isRequired,
};

ProgrammingEnvironmentCard.propTypes = {
  programmingEnvironment: ProgrammingEnvironmentShape,
};

const styles = {
  card: {
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
    justifyContent: 'space-between',
  },
  all: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  image: {
    width: '100%',
  },
  header: {
    margin: 5,
  },
};
