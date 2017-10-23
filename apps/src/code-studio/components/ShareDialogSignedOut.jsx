import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import color from '@cdo/apps/util/color';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import { hideShareDialog } from './shareDialogRedux';

const styles = {
  container: {
    margin: 20,
    color: color.charcoal
  },
  heading: {
    fontSize: 16,
    fontFamily: "'Gotham 5r', sans-serif",
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
    display: 'flex',
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
  }
};
// TODO: i18n

class ShareDialogSignedOut extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    hideShareDialog: PropTypes.func.isRequired,
  };
  render() {
    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.props.isOpen}
        handleClose={this.props.hideShareDialog}
        assetUrl={() => ''}
      >
        <div style={styles.container}>
          <div style={styles.heading}>
            Create a Code.org account to share your project
          </div>
          <div style={styles.middle}>
            You must create a Code.org account before you can share and publish
            your project. Creating an account will also let you save your progress
            and continue to work on your project later.
          </div>
          <div style={styles.bottom}>
            <Button
              onClick={this.props.hideShareDialog}
              text={i18n.cancel()}
              color={Button.ButtonColor.gray}
            />
            <Button
              href={`/users/sign_up?user_return_to=${location.pathname}`}
              text={"Create an account"}
              color={Button.ButtonColor.orange}
            />
          </div>
        </div>
      </BaseDialog>
    );
  }
}

export const UnconnectedShareDialogSignedOut = ShareDialogSignedOut;

export default connect(state => ({
  isOpen: state.shareDialog.isOpen
}), { hideShareDialog })(ShareDialogSignedOut);
