import React, {Component, PropTypes} from 'react';
import BaseDialog from '../BaseDialog';
import AddInitialStudentsView from './AddInitialStudentsView';
import EditSectionForm from "./EditSectionForm";

export default class AddSectionDialog extends Component {
  static propTypes = {
    handleClose: PropTypes.func,
    isOpen: PropTypes.bool,
  };

  state = {
    loginType: ''
  };

  handleClose = () => this.props.handleClose();

  handleLoginChoice = (loginType) => {
    this.setState({loginType});
    alert(loginType);
  };

  renderContent() {
    if (this.state.loginType === '') {
      return (
        <AddInitialStudentsView
          sectionName="Foobar"
          handleLoginChoice={this.handleLoginChoice}
        />
      );
    } else {
      return (
        <EditSectionForm/>
      );
    }
  }

  render() {
    return (
      <BaseDialog
        useUpdatedStyles
        fixedWidth={1010}
        isOpen={this.props.isOpen}
        handleClose={this.handleClose}
        assetUrl={() => ''}
        {...this.props}
      >
      {this.renderContent()}
      </BaseDialog>
    );
  }
}
