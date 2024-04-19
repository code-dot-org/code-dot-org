import React from 'react';
import PropTypes from 'prop-types';
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
    tooltipId: `subject-topic-tooltip-${firstSubjectOrTopic
      .replace(/s+/g, '-')
      .toLowerCase()}`,
  });

  if (subjectsAndTopics.length > 1) {
    const remainingSubjectsAndTopics = subjectsAndTopics.slice(1);
    tagsList.push({
      label: `+${remainingSubjectsAndTopics.length}`,
      tooltipContent: remainingSubjectsAndTopics.join(', '),
      'aria-label': remainingSubjectsAndTopics.join(', '),
      tooltipId: `remaining-subjects-topics-tooltip`,
    });
  }

  return <Tags tagsList={tagsList} />;
}

CardLabels.propTypes = {
  subjectsAndTopics: PropTypes.arrayOf(PropTypes.string),
};
