import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import Button from '../Button';
import BaseDialog from '../BaseDialog';

const styles = {
  dialog: {
    padding: '20px'
  }
};

export default class ReCaptchaValidationDialog extends React.Component {
  static propTypes = {
    typeClassroom: PropTypes.string,
    handleClose: PropTypes.func,
    isOpen: PropTypes.bool,
    sectionCode: PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <BaseDialog
          useUpdatedStyles
          fixedWidth={600}
          uncloseable={true}
          style={styles.dialog}
          handleClose={this.props.handleClose}
          isOpen={this.props.isOpen}
        >
          <h3>
            {`Please complete the CAPTCHA to join section ${
              this.props.sectionCode
            }`}
          </h3>
          <hr />
          <Button
            onClick={this.props.handleClose}
            color={Button.ButtonColor.orange}
            text={i18n.joinSection()}
            style={styles.buttonStyle}
          />
        </BaseDialog>
      </div>
    );
  }
}
