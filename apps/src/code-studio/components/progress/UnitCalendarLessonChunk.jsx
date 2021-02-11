import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {unitCalendarLessonChunk} from '@cdo/apps/templates/progress/unitCalendarLessonShapes';

const styles = {
  common: {
    margin: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#333',
    textDecorationLine: 'none',
    fontFamily: '"Gotham 4r", sans-serif'
  },
  assessment: {
    border: '2px solid rgb(118, 101, 160)',
    ':hover': {
      border: '2px solid rgb(118, 101, 160)',
      backgroundColor: 'rgb(118, 101, 160)',
      color: 'white'
    }
  },
  assessmentHover: {
    // border: '2px solid rgb(118, 101, 160)',
    // backgroundColor: 'rgb(118, 101, 160)',
    // color: 'white'
  },
  instructional: {
    border: '2px solid #00adbc',
    ':hover': {
      border: '2px solid #00adbc',
      backgroundColor: '#00adbc',
      color: 'white'
    }
  },
  instructionalHover: {
    // border: '2px solid #00adbc',
    // backgroundColor: '#00adbc',
    // color: 'white'
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
    color: 'rgb(118, 101, 160)',
    ':hover': {
      color: 'white'
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
  handleMouseEnter = () => {
    //this.props.handleHover(this.props.lesson.id);
  };
  handleMouseOut = () => {
    //this.props.handleHover('');
  };

  render() {
    const {minuteWidth, isHover} = this.props;
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
    let thisStyle = {
      ...styles.common,
      width: Math.floor(minuteWidth * duration) - 10
    };
    if (assessment) {
      const typeSpecific = isHover ? styles.assessmentHover : styles.assessment;
      thisStyle = {...thisStyle, ...typeSpecific};
    } else {
      const typeSpecific = isHover
        ? styles.instructionalHover
        : styles.instructional;
      thisStyle = {...thisStyle, ...typeSpecific};
    }
    if (!isStart) {
      thisStyle = {...thisStyle, ...styles.isNotStart};
    }
    if (!isEnd) {
      thisStyle = {...thisStyle, ...styles.isNotEnd};
    }
    console.log(Radium.getState());
    return (
      <a
        style={thisStyle}
        onMouseEnter={this.handleMouseEnter}
        onMouseOut={this.handleMouseOut}
        target="_blank"
        rel="noopener noreferrer"
        href={url}
      >
        {isMajority && (
          <div
            key={`lesson-${this.props.lesson.id}`}
            style={styles.iconSection}
            onMouseEnter={this.handleMouseEnter}
            onMouseOut={this.handleMouseOut}
          >
            <i
              className="fa fa-check-circle"
              style={{
                ...styles.assessmentIcon,
                visibility: assessment ? 'visible' : 'hidden'
              }}
            />
            <i
              className="fa fa-scissors"
              style={{
                visibility: unplugged ? 'visible' : 'hidden'
              }}
            />
          </div>
        )}
        <div
          style={styles.titleText}
          onMouseEnter={this.handleMouseEnter}
          onMouseOut={this.handleMouseOut}
        >
          {isMajority && title}
        </div>
      </a>
    );
  }
}

export default Radium(UnitCalendarLessonChunk);
