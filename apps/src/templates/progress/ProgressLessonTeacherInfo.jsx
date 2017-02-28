import React from 'react';
import color from "@cdo/apps/util/color";

const styles = {
  main: {
    backgroundColor: color.lightest_cyan,
    height: '100%',
    borderWidth: 1,
    borderColor: color.cyan,
    borderStyle: 'solid'
  },
};

const ProgressLessonTeacherInfo = React.createClass({
  propTypes: {

  },

  render() {
    return (
      <div style={styles.main}>
      </div>
    );
  }
});

export default ProgressLessonTeacherInfo;
