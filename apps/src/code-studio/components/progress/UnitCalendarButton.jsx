import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import UnitCalendarDialog from './UnitCalendarDialog';

export default class UnitCalendarButton extends React.Component {
  static propTypes = {
    lessons: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        duration: PropTypes.number.isRequired,
        assessment: PropTypes.bool.isRequired,
        unplugged: PropTypes.bool,
        url: PropTypes.string
      })
    ).isRequired,
    weeklyInstructionalMinutes: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state = {
      isDialogOpen: false
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
              this.props.weeklyInstructionalMinutes || 90
            }
          />
        )}
      </div>
    );
  }
}
