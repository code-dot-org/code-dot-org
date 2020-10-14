import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import BaseDialog from '../../BaseDialog';
import CreateStandardsReportStep1 from './CreateStandardsReportStep1';
import CreateStandardsReportStep2 from './CreateStandardsReportStep2';

const styles = {
  description: {
    color: color.dark_charcoal
  },
  boldText: {
    fontFamily: '"Gotham 7r", sans-serif'
  },
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    fontFamily: '"Gotham 4r", sans-serif, sans-serif'
  }
};

export class CreateStandardsReportDialog extends Component {
  static propTypes = {
    sectionId: PropTypes.number,
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    handleNext: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    onCommentChange: PropTypes.func.isRequired
  };

  state = {
    currentPage: 1
  };

  handleNext = () => {
    this.setState(
      {currentPage: this.state.currentPage + 1},
      this.props.handleNext
    );
  };

  handleBack = () => {
    this.setState({currentPage: this.state.currentPage - 1});
  };

  handleClose = () => {
    this.setState({currentPage: 1}, this.props.handleClose);
  };

  handleConfirm = () => {
    this.setState({currentPage: 1}, this.props.handleConfirm);
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.handleClose}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2>{i18n.createStandardsReport()}</h2>
        {this.state.currentPage === 1 && (
          <CreateStandardsReportStep1 onNext={this.handleNext} />
        )}
        {this.state.currentPage === 2 && (
          <CreateStandardsReportStep2
            onBack={this.handleBack}
            handleConfirm={this.handleConfirm}
            onCommentChange={this.props.onCommentChange}
            sectionId={this.props.sectionId}
          />
        )}
      </BaseDialog>
    );
  }
}

export const UnconnectedCreateStandardsReportDialog = CreateStandardsReportDialog;
