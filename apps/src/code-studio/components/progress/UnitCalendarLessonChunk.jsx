import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip';

import fontConstants from '@cdo/apps/fontConstants';
import {unitCalendarLessonChunk} from '@cdo/apps/templates/progress/unitCalendarLessonShapes';

class UnitCalendarLessonChunk extends Component {
  static propTypes = {
    minuteWidth: PropTypes.number.isRequired,
    lessonChunk: unitCalendarLessonChunk,
    isHover: PropTypes.bool,
    handleHover: PropTypes.func.isRequired,
  };

  handleMouseEnter = () => {
    this.props.handleHover(this.props.lessonChunk.id);
  };

  handleMouseLeave = () => {
    this.props.handleHover('');
  };

  render() {
    const {minuteWidth, isHover} = this.props;
    const {
      id,
      title,
      duration,
      assessment,
      unplugged,
      isStart,
      isEnd,
      isMajority,
      url,
      lessonNumber,
    } = this.props.lessonChunk;

    const chunkWidth = Math.floor(minuteWidth * duration) - 10;
    const smallChunk = chunkWidth < 50;

    let chunkStyle = {
      width: chunkWidth,
      ...styles.box,
      ...(assessment
        ? isHover
          ? styles.assessmentHover
          : styles.assessment
        : isHover
        ? styles.instructionalHover
        : styles.instructional),
      ...(isStart ? styles.isStart : styles.isNotStart),
      ...(isEnd ? styles.isEnd : styles.isNotEnd),
    };

    let displayTitle = smallChunk ? lessonNumber : title;

    return (
      <a
        style={chunkStyle}
        target="_blank"
        rel="noopener noreferrer"
        data-for={`lesson-information-${lessonNumber}`}
        data-tip
        href={url}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onFocus={this.handleMouseEnter}
        onBlur={this.handleMouseLeave}
      >
        {isMajority && (
          <div style={styles.boxContent}>
            {(assessment || unplugged) && (
              <div key={`lesson-${id}`} style={styles.iconSection}>
                <FontAwesomeV6Icon
                  iconName="check-circle"
                  style={{
                    color: isHover
                      ? 'var(--text-neutral-white-fixed)'
                      : 'var(--text-brand-purple-primary)',
                    visibility: assessment ? 'visible' : 'hidden',
                  }}
                />
                <FontAwesomeV6Icon
                  iconName="scissors"
                  style={{
                    visibility: unplugged ? 'visible' : 'hidden',
                  }}
                />
              </div>
            )}
            <div style={styles.titleText}>{displayTitle}</div>
          </div>
        )}
        {smallChunk && (
          <ReactTooltip
            id={`lesson-information-${lessonNumber}`}
            role="tooltip"
            effect="solid"
          >
            <div>{title}</div>
          </ReactTooltip>
        )}
      </a>
    );
  }
}

const styles = {
  box: {
    margin: 5,
    color: 'var(--text-neutral-primary)',
    textDecorationLine: 'none',
    boxSizing: 'border-box',
  },
  boxContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    ...fontConstants['main-font-regular'],
    height: '100%',
  },
  assessment: {
    border: '2px solid var(--borders-brand-purple-primary)',
  },
  assessmentHover: {
    border: '2px solid var(--borders-brand-purple-primary)',
    backgroundColor: 'var(--background-brand-purple-primary)',
    color: 'var(--text-neutral-white-fixed)',
  },
  instructional: {
    border: '2px solid var(--borders-brand-teal-primary)',
  },
  instructionalHover: {
    border: '2px solid var(--borders-brand-teal-primary)',
    backgroundColor: 'var(--background-brand-teal-primary)',
    color: 'var(--text-neutral-white-fixed)',
  },
  isNotStart: {
    borderLeftStyle: 'dashed',
  },
  isStart: {
    borderLeftStyle: 'solid',
  },
  isNotEnd: {
    borderRightStyle: 'dashed',
  },
  isEnd: {
    borderRightStyle: 'solid',
  },
  titleText: {
    width: '100%',
  },
  iconSection: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    paddingLeft: 2,
    paddingTop: 2,
    paddingBottom: 2,
    boxSizing: 'border-box',
  },
};

export default UnitCalendarLessonChunk;
