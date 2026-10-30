import Checkbox from '@code-dot-org/component-library/checkbox';
import {Button as MuiButton, Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {useId, useState} from 'react';

import moduleStyles from './objective-level-tags.module.scss';

export default function ObjectiveLevelTags({
  objectiveDescription,
  scriptLevels,
  scriptLevelIds,
  onChange,
}) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();

  // Tags may point at levels removed from the lesson since the last save; the
  // server drops those, so they are not shown.
  const taggedLabels = scriptLevels
    .filter(scriptLevel => scriptLevelIds.includes(scriptLevel.id))
    .map(scriptLevel => scriptLevel.label);

  const toggleScriptLevel = id =>
    onChange(
      scriptLevelIds.includes(id)
        ? scriptLevelIds.filter(taggedId => taggedId !== id)
        : [...scriptLevelIds, id]
    );

  return (
    <div className={moduleStyles.container}>
      <Typography variant="body3" className={moduleStyles.summary}>
        {taggedLabels.length > 0 ? taggedLabels.join(', ') : 'No levels'}
      </Typography>
      <MuiButton
        size="small"
        variant="outlined"
        color="secondary"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-label={`Tag levels for objective: ${objectiveDescription}`}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Done' : 'Tag levels'}
      </MuiButton>
      {expanded && (
        <fieldset
          id={listId}
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
      )}
    </div>
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
