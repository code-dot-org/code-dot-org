import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import BaseDialog from '../../BaseDialog';
import DialogFooter from '../../teacherDashboard/DialogFooter';
import Button from '../../Button';
import MultiCheckboxSelector from '../../MultiCheckboxSelector';
import ProgressBox from '../ProgressBox';

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  },
  lessonListItem: {
    display: 'flex',
    flexDirection: 'row'
  }
};

class LessonStatusDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleConfirm}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2>{i18n.updateUnpluggedLessonProgress()}</h2>
        <p>{i18n.updateUnpluggedLessonProgressSubHeading()}</p>
        <h3>{i18n.completedUnpluggedLessons()}</h3>
        <MultiCheckboxSelector
          noHeader={true}
          items={[
            {
              id: 'one',
              number: 1,
              name: 'Lesson 1',
              url: 'https://curriculum.code.org/csf-19/coursea/1/'
            },
            {
              id: 'two',
              number: 3,
              name: 'Lesson 4',
              url: 'https://curriculum.code.org/csf-19/coursea/3/'
            }
          ]}
          itemPropName="lesson"
          selected={[]}
          onChange={() => {}}
        >
          <ComplexLessonComponent />
        </MultiCheckboxSelector>
        <div>{i18n.pluggedLessonsNote()}</div>
        <DialogFooter rightAlign>
          <Button
            text={i18n.closeAndSave()}
            onClick={this.props.handleConfirm}
            color={Button.ButtonColor.orange}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}

const ComplexLessonComponent = function({style, lesson}) {
  return (
    <div style={styles.lessonListItem}>
      <div>
        <ProgressBox
          started={false}
          incomplete={0}
          imperfect={0}
          perfect={0}
          showLessonNumber={true}
          lessonNumber={lesson.number}
        />
      </div>
      <a style={{paddingLeft: 10}} href={lesson.url}>
        {lesson.name}
      </a>
    </div>
  );
};
ComplexLessonComponent.propTypes = {
  style: PropTypes.object,
  lesson: PropTypes.shape({
    id: PropTypes.string,
    number: PropTypes.number,
    name: PropTypes.string,
    url: PropTypes.string
  })
};

export const UnconnectedLessonStatusDialog = LessonStatusDialog;
