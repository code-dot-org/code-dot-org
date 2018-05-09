/* eslint-disable react/no-danger */

import React, {PropTypes, Component} from 'react';
import { connect } from 'react-redux';
import color from "../util/color";
import i18n from '@cdo/locale';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';

const styles = {
  container: {
    margin: 20,
    borderWidth: 5,
    borderStyle: 'solid',
    borderColor: color.cyan,
    backgroundColor: color.lightest_cyan,
    borderRadius: 5
  },
  header: {
    color: color.white,
    backgroundColor: color.cyan,
    padding: 5,
    fontSize: 18,
    fontFamily: '"Gotham 7r", sans-serif'
  },
  content: {
    padding: 10
  }
};

class TeacherFeedback extends Component {
  static propTypes = {
    teacherView: PropTypes.bool
  };

  render() {
    if (!this.props.teacherView) {
      return null;
    }

    // Placeholder for upcoming feedback input
    return (
      <div style={styles.container}>
        <div style={styles.header}>{i18n.forTeachersOnly()}</div>
        <div style={styles.content}> Coming Fall 2018: Input to provide feedback on student work</div>
      </div>
    );
  }
}

export default connect(state => ({
  teacherView: state.viewAs === ViewType.Teacher
}))(TeacherFeedback);
