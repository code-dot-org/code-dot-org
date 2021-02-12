import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import UnitCalendarDialog from './UnitCalendarDialog';
import {unitCalendarLesson} from '@cdo/apps/templates/progress/unitCalendarLessonShapes';

export default class UnitCalendarButton extends React.Component {
  static propTypes = {
    lessons: PropTypes.arrayOf(unitCalendarLesson).isRequired,
    weeklyInstructionalMinutes: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state = {
      isDialogOpen: false
    };
  }

  openDialog = () => {
    console.log('open!!');
    this.setState({isDialogOpen: true});
  };

  closeDialog = () => {
    this.setState({isDialogOpen: false});
  };

  render() {
    return (
      <div>
        <Button
          __useDeprecatedTag
          onClick={this.openDialog}
          text={i18n.viewCalendarButton()}
          icon="calendar"
          color={Button.ButtonColor.blue}
        />
        {this.state.isDialogOpen && (
          <UnitCalendarDialog
            isOpen={true}
            handleClose={this.closeDialog}
            lessons={this.props.lessons}
            weeklyInstructionalMinutes={
              this.props.weeklyInstructionalMinutes || 225
            }
          />
        )}
      </div>
    );
  }
}
