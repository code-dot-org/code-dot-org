import Checkbox from '@code-dot-org/component-library/checkbox';
import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import moduleStyles from './objective-level-tags.module.scss';

export default function ObjectiveLevelTags({
  objectiveDescription,
  scriptLevels,
  scriptLevelIds,
  onChange,
}) {
  const toggleScriptLevel = id =>
    onChange(
      scriptLevelIds.includes(id)
        ? scriptLevelIds.filter(taggedId => taggedId !== id)
        : [...scriptLevelIds, id]
    );

  return (
    <fieldset
      className={moduleStyles.list}
      aria-label={`Levels for objective: ${objectiveDescription}`}
    >
      {scriptLevels.length === 0 ? (
        <Typography variant="body3">
          Save the lesson to tag newly added levels.
        </Typography>
      ) : (
        scriptLevels.map(scriptLevel => (
          <Checkbox
            key={scriptLevel.id}
            name={`script-level-${scriptLevel.id}`}
            label={scriptLevel.label}
            size="s"
            checked={scriptLevelIds.includes(scriptLevel.id)}
            onChange={() => toggleScriptLevel(scriptLevel.id)}
          />
        ))
      )}
    </fieldset>
  );
}

ObjectiveLevelTags.propTypes = {
  objectiveDescription: PropTypes.string.isRequired,
  scriptLevels: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  scriptLevelIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};
