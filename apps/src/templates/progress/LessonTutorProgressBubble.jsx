import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {useState, useRef} from 'react';
import ReactTooltip from 'react-tooltip';

import color from '@cdo/apps/util/color';

const ICON_SIZE = 16;

export default function LessonTutorProgressBubble({lessonTutorPath}) {
  const [isHovering, setIsHovering] = useState(false);
  const tooltipId = useRef(_.uniqueId()).current;

  return (
    <a
      href={lessonTutorPath}
      data-tip
      data-for={tooltipId}
      aria-describedby={tooltipId}
      title="Lesson Tutor"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <FontAwesomeV6Icon
        iconName="ai-bot-solid"
        iconFamily="kit"
        style={{
          fontSize: ICON_SIZE,
          color: isHovering ? color.orange : color.black,
        }}
      />
      <ReactTooltip id={tooltipId} role="tooltip" wrapper="span" effect="solid">
        {'Lesson Tutor'}
      </ReactTooltip>
    </a>
  );
}

LessonTutorProgressBubble.propTypes = {
  lessonTutorPath: PropTypes.string.isRequired,
};
