import React from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';

export default class ManageCodeReviewGroups extends React.Component {
  static propTypes = {
    buttonStyle: PropTypes.object
  };

  state = {isDialogOpen: false};

  openDialog = () => this.setState({isDialogOpen: true});
  onDialogClose = () => this.setState({isDialogOpen: false});

  render() {
    return (
      <div style={{...styles.button, ...this.props.buttonStyle}}>
        {/* use div instead of button HTML element via __useDeprecatedTag
          for consistent spacing with other "buttons" in ManageStudentsTable header */}
        <Button
          __useDeprecatedTag
          onClick={this.openDialog}
          color={Button.ButtonColor.gray}
          text={i18n.manageCodeReviewGroups()}
          icon="comment"
        />
        <StylizedBaseDialog
          title={'hey'}
          body={'hello'}
          isOpen={this.state.isDialogOpen}
          handleClose={this.onDialogClose}
        />
      </div>
    );
  }
}

const styles = {
  button: {
    marginLeft: 5
  }
};
