import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {unitCalendarLessonChunk} from '@cdo/apps/templates/progress/unitCalendarLessonShapes';
import color from '@cdo/apps/util/color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const styles = {
  box: {
    margin: 5,
    color: '#333',
    textDecorationLine: 'none'
  },
  boxContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontFamily: '"Gotham 4r", sans-serif'
  },
  assessment: {
    border: '2px solid ' + color.purple,
    ':hover': {
      backgroundColor: color.purple,
      color: 'white'
    }
  },
  instructional: {
    border: '2px solid ' + color.teal,
    ':hover': {
      backgroundColor: color.teal,
      color: color.white
    }
  },
  isNotStart: {
    borderLeftStyle: 'dashed'
  },
  isNotEnd: {
    borderRightStyle: 'dashed'
  },
  titleText: {
    width: '100%',
    paddingRight: 15
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
  },
  assessmentIcon: {
    color: color.purple,
    ':hover': {
      color: color.white
    }
  }
};

class UnitCalendarLessonChunk extends Component {
  static propTypes = {
    minuteWidth: PropTypes.number.isRequired,
    lesson: unitCalendarLessonChunk,
    isHover: PropTypes.bool,
    handleHover: PropTypes.func.isRequired
  };

  render() {
    const {minuteWidth} = this.props;
    const {
      title,
      duration,
      assessment,
      unplugged,
      isStart,
      isEnd,
      isMajority,
      url
    } = this.props.lesson;

    let chunkStyle = {
      width: Math.floor(minuteWidth * duration) - 10,
      ...styles.box,
      ...(assessment ? styles.assessment : styles.instructional),
      ...(!isStart && styles.isNotStart),
      ...(!isEnd && styles.isNotEnd)
    };

    return (
      <a
        key={this.props.lesson.id}
        style={chunkStyle}
        target="_blank"
        rel="noopener noreferrer"
        href={url}
      >
        {isMajority && (
          <div style={styles.boxContent}>
            <div
              key={`lesson-${this.props.lesson.id}`}
              style={styles.iconSection}
            >
              <FontAwesome
                icon="check-circle"
                style={{
                  ...styles.assessmentIcon,
                  visibility: assessment ? 'visible' : 'hidden'
                }}
              />
              <FontAwesome
                icon="scissors"
                style={{
                  visibility: unplugged ? 'visible' : 'hidden'
                }}
              />
            </div>
            <div style={styles.titleText}>{title}</div>
          </div>
        )}
      </a>
    );
  }
}

export default Radium(UnitCalendarLessonChunk);
