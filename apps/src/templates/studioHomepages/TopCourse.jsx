import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import color from '../../util/color';
import styleConstants from '../../styleConstants';
import Button from '../Button';

// While this is named TopCourse, it really refers to the most recent course
// or script in which the student or teacher has progress.

class TopCourse extends Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired,
    assignableName: PropTypes.string.isRequired,
    lessonName: PropTypes.string.isRequired,
    linkToOverview: PropTypes.string.isRequired,
    linkToLesson: PropTypes.string.isRequired
  };

  render() {
    const {
      assignableName,
      lessonName,
      linkToOverview,
      linkToLesson,
      isRtl
    } = this.props;
    const localeStyle = isRtl ? styles.ltr : styles.rtl;

    return (
      <div style={styles.card}>
        <img
          src={require('@cdo/static/small_purple_icons_fullwidth.png')}
          style={styles.image}
        />
        <div style={styles.name}>{assignableName}</div>
        <div style={styles.description}>
          <div>{i18n.topCourseLessonIntro({lessonName})}</div>
          <div style={{marginTop: 10}}>{i18n.topCourseExplanation()}</div>
        </div>
        <div style={[styles.buttonBox, localeStyle]}>
          <Button
            __useDeprecatedTag
            href={linkToOverview}
            color={Button.ButtonColor.gray}
            text={i18n.viewCourse()}
          />
          <Button
            __useDeprecatedTag
            href={linkToLesson}
            color={Button.ButtonColor.orange}
            text={i18n.continueLesson()}
            style={styles.lessonButton}
          />
        </div>
      </div>
    );
  }
}

const styles = {
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
    position: 'relative',
    height: 200,
    width: styleConstants['content-width'],
    marginBottom: 20,
    background: color.white
  },
  image: {
    position: 'absolute',
    width: styleConstants['content-width'],
    height: 80
  },
  name: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 25,
    paddingRight: 25,
    marginTop: 15,
    fontSize: 30,
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.white,
    width: styleConstants['content-width'] - 35,
    zIndex: 2,
    position: 'absolute',
    display: 'inline',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  description: {
    paddingLeft: 25,
    paddingRight: 25,
    paddingTop: 20,
    paddingBottom: 5,
    marginTop: 80,
    fontSize: 14,
    lineHeight: 1.5,
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.charcoal,
    background: color.white,
    width: '65%',
    boxSizing: 'border-box',
    position: 'absolute',
    zIndex: 2
  },
  buttonBox: {
    marginTop: 120,
    zIndex: 2
  },
  lessonButton: {
    marginLeft: 20,
    marginRight: 25
  },
  ltr: {
    float: 'left'
  },
  rtl: {
    float: 'right'
  }
};

export default connect(state => ({
  isRtl: state.isRtl
}))(Radium(TopCourse));
