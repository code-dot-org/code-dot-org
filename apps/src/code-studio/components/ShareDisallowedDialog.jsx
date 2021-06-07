import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import color from '@cdo/apps/util/color';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import {hideShareDialog} from './shareDialogRedux';

class ShareDisallowedDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    hideShareDialog: PropTypes.func.isRequired
  };
  render() {
    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.props.isOpen}
        handleClose={this.props.hideShareDialog}
      >
        <div style={styles.container}>
          <div style={styles.heading}>{i18n.createAccountToShare()}</div>
          <div style={styles.middle}>
            {i18n.createAccountToShareDescription()}
          </div>
          <div style={styles.bottom}>
            <Button
              __useDeprecatedTag
              onClick={this.props.hideShareDialog}
              text={i18n.cancel()}
              color={Button.ButtonColor.gray}
            />
            <Button
              __useDeprecatedTag
              href={`/users/sign_up?user_return_to=${location.pathname}`}
              text={i18n.createAccount()}
              color={Button.ButtonColor.orange}
            />
          </div>
        </div>
      </BaseDialog>
    );
  }
}

const styles = {
  container: {
    margin: 20,
    color: color.charcoal
  },
  heading: {
    fontSize: 16,
    fontFamily: "'Gotham 5r', sans-serif"
  },
  middle: {
    marginTop: 20,
    marginBottom: 20,
    paddingBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    display: 'flex'
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between'
  }
};

export const UnconnectedShareDisallowedDialog = ShareDisallowedDialog;

export default connect(
  state => ({
    isOpen: state.shareDialog.isOpen
  }),
  {hideShareDialog}
)(ShareDisallowedDialog);
