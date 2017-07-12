import React, {Component, PropTypes} from 'react';
import locale from '@cdo/locale';
import BaseDialog from '../BaseDialog';
import color from '../../util/color';
import AddInitialStudentsView from './AddInitialStudentsView';

const styles = {

};

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
        <AddInitialStudentsView
          sectionName="Foobar"
          handleLoginChoice={this.handleLoginChoice}
        />
      </BaseDialog>
    );
  }
}
