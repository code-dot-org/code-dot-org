/* eslint-disable react/no-danger */

import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import marked from 'marked';
import renderer from "../../util/StylelessRenderer";
import color from "../../util/color";
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

const TeacherOnlyMarkdown = ({content}) => {
  if (!content) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>{i18n.forTeachersOnly()}</div>
      <div
        style={styles.content}
        dangerouslySetInnerHTML={{ __html: marked(content, { renderer }) }}
      />
    </div>
  );
};
TeacherOnlyMarkdown.propTypes = {
  content: PropTypes.string
};

export default connect(state => ({
  content: state.viewAs === ViewType.Teacher ?
    state.instructions.teacherMarkdown : ''
}))(TeacherOnlyMarkdown);
