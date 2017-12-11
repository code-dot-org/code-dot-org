import React, {PropTypes} from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import locale from '@cdo/locale';
import color from '@cdo/apps/util/color';

const styles = {
  title: {
    position: 'absolute',
    left: 30,
    top: 10,
    color: color.dark_charcoal,
    margin: '15px 0',
  },
  content: {
    position: 'absolute',
    left: 30,
    top: 50,
    right: 30,
    bottom: 70
  },
  contentText: {
    fontSize: 15,
    lineHeight: '22px'
  },
  highlightRow: {
    backgroundColor: color.default_blue,
    color: color.white,
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    right: 30,
    left: 30,
  },
  buttonPrimary: {
    float: 'right',
    background: color.orange,
    color: color.white,
    border: '1px solid #b07202',
    borderRadius: 3,
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.63)',
    fontSize: 14,
    padding: '8px 20px',
  },
  buttonSecondary: {
    float: 'left',
    background: '#eee',
    color: '#5b6770',
    border: '1px solid #c5c5c5',
  },
  hr: {
    borderColor: color.light_gray
  },
  email: {
    height: 35,
    paddingLeft: 15
  }
};

/**
 * Pops up a dialog that prompts the user to confirm their email address.
 * This is used when oauth accounts switch from student to teacher, in order
 * to verify that the email address is already known to the user (it will
 * become visible on the accounts page after the transition, which is a
 * potential violation of student privacy).
 */
export default class ConfirmEmailModal extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func,
    handleCancel: PropTypes.func,
    isOpen: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  cancel = () => {
    this.props.handleCancel();
  };

  ok = () => {
    this.props.handleSubmit(this.state.email);
  };

  onEmailChanged = e => {
    const email = e.target.value;
    this.setState({
      emailEntered: email !== "",
      email: email
    });
  };

  render = () => {
    const title = locale.emailConfirmationTitle();
    const content = locale.emailConfirmationText();
    return (
      <BaseDialog
        useUpdatedStyles
        fixedWidth={600}
        fixedHeight={310}
        isOpen={this.props.isOpen}
        handleClose={this.cancel}
        {...this.props}
      >
        <h2 style={styles.title}>
          {title}
        </h2>
        <div style={styles.content}>
          <hr style={styles.hr} />
          <p style={styles.contentText}>{content}</p>
          <input
            type="email"
            placeholder="email address"
            style={styles.email}
            onInput={this.onEmailChanged}
          />
          <hr style={styles.hr} />
        </div>
        <div style={styles.footer}>
          <button
            onClick={this.cancel}
            style={{...styles.buttonPrimary, ...styles.buttonSecondary}}
          >
            {locale.dialogCancel()}
          </button>
          <button
            onClick={this.ok}
            style={Object.assign({},
              styles.buttonPrimary,
              !this.state.emailEntered && {opacity: 0.5}
            )}
            disabled={!this.state.emailEntered}
          >
            {locale.dialogConfirmEmail()}
          </button>
        </div>
      </BaseDialog>
    );
  };
}
