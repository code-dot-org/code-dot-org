import React, { Component, PropTypes } from 'react';
import color from "@cdo/apps/util/color";
import i18n from '@cdo/locale';
import Button from '../Button';
import CourseScriptTeacherInfo from './CourseScriptTeacherInfo';

const styles = {
  main: {
    display: 'table',
    width: '100%',
    height: '100%',
    background: color.background_gray,
    borderWidth: 1,
    borderColor: color.border_gray,
    borderStyle: 'solid',
    borderRadius: 2,
    marginBottom: 12,
  },
  content: {
    padding: 20
  },
  description: {
    marginTop: 20,
    marginBottom: 20
  },
  title: {
    fontSize: 18,
    fontFamily: '"Gotham 5r", sans-serif',
  }
};

class CourseScript extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    name: PropTypes.string,
    id: PropTypes.number.isRequired,
    description: PropTypes.string,
  };
  render() {
    const { title, name, id, description } = this.props;

    return (
      <div style={styles.main}>
        <div style={styles.content}>
          <div style={styles.title}>{title}</div>
          <div style={styles.description}>{description}</div>
          <Button
            text={i18n.goToUnit()}
            href={`/s/${name}`}
            color={Button.ButtonColor.gray}
          />
        </div>
        <CourseScriptTeacherInfo courseId={id}/>
      </div>
    );
  }
}

export default CourseScript;
