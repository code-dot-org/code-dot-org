import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import BaseDialog from '../../BaseDialog';
import DialogFooter from '../../teacherDashboard/DialogFooter';
import Button from '../../Button';
import {connect} from 'react-redux';
import {setCurrentUserHasSeenStandardsReportInfo} from '@cdo/apps/templates/currentUserRedux';
import {cstaStandardsURL} from './standardsConstants';

/*
Dialog that show the first time a teacher goes to the
Standards view of the Progress Tab in Teacher Dashboard
 */

class StandardsIntroDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setCurrentUserHasSeenStandardsReportInfo: PropTypes.func.isRequired
  };

  state = {
    pending: false
  };

  dismissStandardsDialog = () => {
    this.setState({pending: true});
    $.ajax({
      url: '/dashboardapi/v1/users/me/set_standards_report_info_to_seen',
      type: 'post',
      data: {}
    })
      .done(() => {
        this.props.setCurrentUserHasSeenStandardsReportInfo(true);
      })
      .fail(() => {
        // if it fails close the dialog for them but it will reopen next time they reload the page
        this.props.setCurrentUserHasSeenStandardsReportInfo(true);
      });
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.dismissStandardsDialog}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2>{i18n.progressOnCSTAStandards()}</h2>
        <div style={styles.description}>
          <SafeMarkdown
            openExternalLinksInNewTab={true}
            markdown={i18n.progressOnCSTAStandardsDescription({
              cstaLink: cstaStandardsURL
            })}
          />
        </div>
        <div style={styles.description}>
          <p>{i18n.useToView()}</p>
          <ul>
            <li>
              <SafeMarkdown markdown={i18n.useToViewList1()} />
            </li>
            <li>
              <SafeMarkdown markdown={i18n.useToViewList2()} />
            </li>
            <li>
              <SafeMarkdown markdown={i18n.useToViewList3()} />
            </li>
          </ul>
        </div>
        <br />
        <div style={styles.description}>
          <SafeMarkdown markdown={i18n.standardsReminder()} />
        </div>
        <DialogFooter rightAlign>
          <Button
            __useDeprecatedTag
            text={i18n.gotIt()}
            onClick={this.dismissStandardsDialog}
            color={Button.ButtonColor.orange}
            className="uitest-standards-intro-button"
            disabled={this.state.pending}
            isPending={this.state.pending}
            pendingText={i18n.loading()}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}

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
    paddingBottom: 20
  }
};

export const UnconnectedStandardsIntroDialog = StandardsIntroDialog;

export default connect(
  state => ({}),
  dispatch => ({
    setCurrentUserHasSeenStandardsReportInfo(hasSeenStandardsReport) {
      dispatch(
        setCurrentUserHasSeenStandardsReportInfo(hasSeenStandardsReport)
      );
    }
  })
)(StandardsIntroDialog);
