import PropTypes from 'prop-types';
import React from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import firehoseClient from '@cdo/apps/metrics/utils/firehose';
import {unitCalendarLesson} from '@cdo/apps/templates/progress/unitCalendarLessonShapes';
import i18n from '@cdo/locale';

import UnitCalendarDialog from './UnitCalendarDialog';

export default class UnitCalendarButton extends React.Component {
  static propTypes = {
    lessons: PropTypes.arrayOf(unitCalendarLesson).isRequired,
    weeklyInstructionalMinutes: PropTypes.number,
    scriptId: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      isDialogOpen: false,
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
          script_id: this.props.scriptId,
        }),
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
          onClick={this.openDialog}
          text={i18n.viewCalendarButton()}
          icon="calendar"
          color={Button.ButtonColor.blue}
          style={styles.button}
        />
        {this.state.isDialogOpen && (
          <UnitCalendarDialog
            isOpen={true}
            handleClose={this.closeDialog}
            lessons={this.props.lessons}
            weeklyInstructionalMinutes={
              this.props.weeklyInstructionalMinutes || 225
            }
            scriptId={this.props.scriptId}
          />
        )}
      </div>
    );
  }
}

const styles = {
  button: {
    margin: 0,
    boxShadow: 'inset 0 2px 0 0 rgb(255 255 255 / 40%)',
  },
};
