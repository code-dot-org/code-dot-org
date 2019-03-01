import PropTypes from 'prop-types';
import React from 'react';
import Dialog, {Body} from '@cdo/apps/templates/Dialog';
import DialogFooter from '../templates/teacherDashboard/DialogFooter';
import Button from '../templates/Button';
import i18n from '@cdo/locale';

export default class RedirectDialog extends React.Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    approved: PropTypes.bool,
    isOpen: PropTypes.bool
  };

  state = {
    isOpen: this.props.isOpen
  };

  closeDialog = () => {
    this.setState({isOpen: false});
  };

  render() {
    let title, body, footer;

    if (this.props.approved) {
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
            onClick={this.closeDialog}
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
            onClick={this.closeDialog}
            text={i18n.dialogOK()}
            color={Button.ButtonColor.gray}
          />
        </DialogFooter>
      );
    }

    return (
      <Dialog title={title} isOpen={this.state.isOpen}>
        <Body>
          {body}
          {footer}
        </Body>
      </Dialog>
    );
  }
}
