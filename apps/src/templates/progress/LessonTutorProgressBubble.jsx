import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip';

import color from '@cdo/apps/util/color';

const ICON_SIZE = 16;

export default class LessonTutorProgressBubble extends Component {
  static propTypes = {
    lessonTutorPath: PropTypes.string.isRequired,
  };

  state = {
    isHovering: false,
  };

  render() {
    const {lessonTutorPath} = this.props;
    const tooltipId = _.uniqueId();
    return (
      <a
        href={lessonTutorPath}
        data-tip
        data-for={tooltipId}
        aria-describedby={tooltipId}
        title="Lesson Tutor"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => this.setState({isHovering: true})}
        onMouseLeave={() => this.setState({isHovering: false})}
      >
        <FontAwesomeV6Icon
          iconName="ai-bot-solid"
          iconFamily="kit"
          style={{
            fontSize: ICON_SIZE,
            color: this.state.isHovering ? color.orange : color.black,
          }}
        />
        <ReactTooltip
          id={tooltipId}
          role="tooltip"
          wrapper="span"
          effect="solid"
        >
          {'Lesson Tutor'}
        </ReactTooltip>
      </a>
    );
  }
}
