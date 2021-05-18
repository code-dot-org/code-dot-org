import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {unitCalendarLessonChunk} from '@cdo/apps/templates/progress/unitCalendarLessonShapes';
import color from '@cdo/apps/util/color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ReactTooltip from 'react-tooltip';

class UnitCalendarLessonChunk extends Component {
  static propTypes = {
    minuteWidth: PropTypes.number.isRequired,
    lessonChunk: unitCalendarLessonChunk,
    isHover: PropTypes.bool,
    handleHover: PropTypes.func.isRequired
  };

  handleMouseEnter = () => {
    this.props.handleHover(this.props.lessonChunk.id);
  };

  handleMouseOut = () => {
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
      lessonNumber
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
      ...(isEnd ? styles.isEnd : styles.isNotEnd)
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
        onMouseOut={this.handleMouseOut}
      >
        {isMajority && (
          <div
            style={styles.boxContent}
            onMouseEnter={this.handleMouseEnter}
            onMouseOut={this.handleMouseOut}
          >
            {(assessment || unplugged) && (
              <div
                key={`lesson-${id}`}
                style={styles.iconSection}
                onMouseEnter={this.handleMouseEnter}
                onMouseOut={this.handleMouseOut}
              >
                <FontAwesome
                  icon="check-circle"
                  style={{
                    color: isHover ? color.white : color.purple,
                    visibility: assessment ? 'visible' : 'hidden'
                  }}
                  onMouseEnter={this.handleMouseEnter}
                  onMouseOut={this.handleMouseOut}
                />
                <FontAwesome
                  icon="scissors"
                  style={{
                    visibility: unplugged ? 'visible' : 'hidden'
                  }}
                  onMouseEnter={this.handleMouseEnter}
                  onMouseOut={this.handleMouseOut}
                />
              </div>
            )}
            <div
              style={styles.titleText}
              onMouseEnter={this.handleMouseEnter}
              onMouseOut={this.handleMouseOut}
            >
              {displayTitle}
            </div>
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
    color: '#333',
    textDecorationLine: 'none',
    boxSizing: 'border-box'
  },
  boxContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontFamily: '"Gotham 4r", sans-serif',
    height: '100%'
  },
  assessment: {
    border: '2px solid ' + color.purple
  },
  assessmentHover: {
    border: '2px solid ' + color.purple,
    backgroundColor: color.purple,
    color: 'white'
  },
  instructional: {
    border: '2px solid ' + color.teal
  },
  instructionalHover: {
    border: '2px solid ' + color.teal,
    backgroundColor: color.teal,
    color: color.white
  },
  isNotStart: {
    borderLeftStyle: 'dashed'
  },
  isStart: {
    borderLeftStyle: 'solid'
  },
  isNotEnd: {
    borderRightStyle: 'dashed'
  },
  isEnd: {
    borderRightStyle: 'solid'
  },
  titleText: {
    width: '100%'
  },
  iconSection: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    paddingLeft: 2,
    paddingTop: 2,
    paddingBottom: 2,
    boxSizing: 'border-box'
  }
};

export default UnitCalendarLessonChunk;
