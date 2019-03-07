import PropTypes from 'prop-types';
import React from 'react';
import Dialog, {Body} from '@cdo/apps/templates/Dialog';
import DialogFooter from '../templates/teacherDashboard/DialogFooter';
import Button from '../templates/Button';
import i18n from '@cdo/locale';
import {connect} from 'react-redux';
import {actions} from './redux/applab';

class RedirectDialog extends React.Component {
  static propTypes = {
    url: PropTypes.string,
    isApproved: PropTypes.bool,
    isOpen: PropTypes.bool,
    handleClose: PropTypes.func
  };

  render() {
    let title, body, footer;
    if (this.props.isApproved) {
      title = i18n.redirectTitle();
      body = (
        <div>
          <h2>{i18n.redirectConfirm({url: this.props.url})}</h2>
          <p>
            {i18n.redirectExplanation()}
            <span>
              <a target="_blank" href={'https://studio.code.org/report_abuse'}>
                {i18n.reportAbuse()}
              </a>
            </span>
          </p>
        </div>
      );
      footer = (
        <DialogFooter>
          <Button
            onClick={this.props.handleClose}
            text={i18n.goBack()}
            color={Button.ButtonColor.gray}
          />
          <Button
            href={this.props.url}
            target={'_blank'}
            text={i18n.continue()}
            color={Button.ButtonColor.orange}
          />
        </DialogFooter>
      );
    } else {
      title = i18n.redirectRejectTitle();
      body = <p>{i18n.redirectRejectExplanation()}</p>;
      footer = (
        <DialogFooter rightAlign>
          <Button
            onClick={this.props.handleClose}
            text={i18n.dialogOK()}
            color={Button.ButtonColor.gray}
          />
        </DialogFooter>
      );
    }

    return (
      <Dialog
        title={title}
        isOpen={this.props.isOpen}
        handleClose={this.props.handleClose}
      >
        <Body>
          {body}
          {footer}
        </Body>
      </Dialog>
    );
  }
}

export default connect(
  state => ({
    isOpen: state.redirectDisplay.displaying,
    isApproved: state.redirectDisplay.approved,
    url: state.redirectDisplay.url
  }),
  dispatch => ({
    handleClose() {
      dispatch(actions.toggleRedirectNotice(false));
    }
  })
)(RedirectDialog);
