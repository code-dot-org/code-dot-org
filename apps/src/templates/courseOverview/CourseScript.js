import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import color from "@cdo/apps/util/color";
import i18n from '@cdo/locale';
import Button from '../Button';
import TeacherInfoBox from '@cdo/apps/templates/progress/TeacherInfoBox';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';

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
    description: PropTypes.string,

    // redux provided
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    selectedSectionId: PropTypes.string.isRequired,
  };
  render() {
    const { title, name, description, viewAs, selectedSectionId } = this.props;
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
        {viewAs === ViewType.Teacher && (
          <TeacherInfoBox>
            <div style={{opacity: selectedSectionId ? 1 : 0.3}}>
              This will be a toggle for hiding/showing the unit, and will be disabled
              if we have no section selected.
            </div>
          </TeacherInfoBox>
        )}
      </div>
    );
  }
}

export default connect(state => ({
  // TODO: move viewAs out of stage lock
  viewAs: state.stageLock.viewAs,
  selectedSectionId: state.teacherSections.selectedSectionId,
}))(CourseScript);
