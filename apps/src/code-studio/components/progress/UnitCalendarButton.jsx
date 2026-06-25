import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

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
  };

  closeDialog = () => {
    this.setState({isDialogOpen: false});
  };

  render() {
    return (
      <div>
        <MuiButton
          onClick={this.openDialog}
          variant="contained"
          color="primary"
          startIcon={<FontAwesomeV6Icon iconName="calendar" />}
          style={styles.button}
        >
          {i18n.viewCalendarButton()}
        </MuiButton>
        <UnitCalendarDialog
          isOpen={this.state.isDialogOpen}
          handleClose={this.closeDialog}
          lessons={this.props.lessons}
          weeklyInstructionalMinutes={
            this.props.weeklyInstructionalMinutes || 225
          }
          scriptId={this.props.scriptId}
        />
      </div>
    );
  }
}

const styles = {
  button: {
    margin: '5px 0px 0px',
    boxShadow: 'none',
  },
};
