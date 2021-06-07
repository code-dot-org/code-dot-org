import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import UnitCalendarDialog from './UnitCalendarDialog';
import {unitCalendarLesson} from '@cdo/apps/templates/progress/unitCalendarLessonShapes';
import firehoseClient from '@cdo/apps/lib/util/firehose';

export default class UnitCalendarButton extends React.Component {
  static propTypes = {
    lessons: PropTypes.arrayOf(unitCalendarLesson).isRequired,
    weeklyInstructionalMinutes: PropTypes.number,
    scriptId: PropTypes.number.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      isDialogOpen: false
    };
  }

  openDialog = () => {
    this.setState({isDialogOpen: true});
    firehoseClient.putRecord(
      {
        study: 'script_overview_actions',
        study_group: 'unit_calendar',
        event: 'open_unit_calendar',
        data_json: JSON.stringify({
          script_id: this.props.scriptId
        })
      },
      {includeUserId: true}
    );
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
