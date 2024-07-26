import PropTypes from 'prop-types';
import React from 'react';

import Tags from '@cdo/apps/componentLibrary/tags/Tags';

export default function CardLabels({subjectsAndTopics}) {
  if (subjectsAndTopics.length === 0) {
    return null;
  }

  const tagsList = [];

  const firstSubjectOrTopic = subjectsAndTopics[0];
  tagsList.push({
    label: firstSubjectOrTopic,
    tooltipContent: firstSubjectOrTopic,
    tooltipId: 'first-label-tooltip',
  });

  if (subjectsAndTopics.length > 1) {
    const remainingSubjectsAndTopics = subjectsAndTopics.slice(1);
    const tooltipContent = (
      <>
        {remainingSubjectsAndTopics.map(subjectOrTopic => (
          <p key={subjectOrTopic}>{subjectOrTopic}</p>
        ))}
      </>
    );
    tagsList.push({
      label: `+${remainingSubjectsAndTopics.length}`,
      tooltipContent,
      'aria-label': remainingSubjectsAndTopics.join(', '),
      tooltipId: 'remaining-subjects-topics-tooltip',
    });
  }

  return <Tags tagsList={tagsList} />;
}

CardLabels.propTypes = {
  subjectsAndTopics: PropTypes.arrayOf(PropTypes.string),
};
