import React from 'react';
import i18n from '@cdo/locale';
import PropTypes from 'prop-types';

const CALLOUT_COLOR = '#454545';
const TRIANGLE_BASE = 30;
const TRIANGLE_HEIGHT = 15;
const CALLOUT_Z_INDEX = 1040;
const CALLOUT_TOP = 30;

const styles = {
  container: {
    // The outermost div is relatively positioned so it can be used as a positional
    // anchor for its children (which will be absolutely positioned to avoid affecting
    // layout).  This element must be 0-sized to avoid affecting layout.
    position: 'relative',
    height: 0,
    width: 0
  },
  content: {
    position: 'absolute',
    top: CALLOUT_TOP,
    right: -90,
    zIndex: CALLOUT_Z_INDEX,
    backgroundColor: CALLOUT_COLOR,
    borderRadius: 3
  },
  modalBackdrop: {
    // Most backdrop attributes come from the 'modal-backdrop' class defined by bootstrap
    // but we need to override the opacity as the default opacity of 0.8 is too dark.
    // Note that bootstrap defaults the z-index of the backdrop to 1040.
    opacity: 0.5
  },
  upTriangle: {
    position: 'absolute',
    top: CALLOUT_TOP - TRIANGLE_HEIGHT,
    left: -(TRIANGLE_HEIGHT / 2.0),
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopWidth: 0,
    borderRightWidth: TRIANGLE_BASE,
    borderBottomWidth: TRIANGLE_HEIGHT,
    borderLeftWidth: TRIANGLE_BASE,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: CALLOUT_COLOR,
    borderLeftColor: 'transparent',
    zIndex: CALLOUT_Z_INDEX
  },
  contentContainer: {
    display: 'flex',
    padding: 20
  },
  imageContainer: {
    width: 100,
    marginRight: 20
  },
  textContainer: {
    width: 400,
    textAlign: 'left',
    whiteSpace: 'normal'
  },
  textHeader: {
    marginTop: 0
  }
};

/*
 * This is a callout attached to the sign-in button that's used on CSF level
 * pages to remind the user to sign-in.  Note that the sign-in button is
 * defined in shared/haml/user_header.haml and is not a React component.
 * This component is injected into the page by src/code-studio/header.js.
 */
export default class SignInCallout extends React.Component {
  static propTypes = {
    handleClose: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.renderContent = this.renderContent.bind(this);
  }

  renderContent() {
    return (
      <div style={styles.contentContainer}>
        <img
          style={styles.imageContainer}
          src="/shared/images/user-not-signed-in.png"
        />
        <div style={styles.textContainer}>
          <h2 style={styles.textHeader}>{i18n.notSignedInHeader()}</h2>
          <p> {i18n.notSignedInBody()}</p>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div style={styles.container} onClick={this.props.handleClose}>
        <div
          className="login-callout modal-backdrop"
          style={styles.modalBackdrop}
        />
        <div style={styles.upTriangle} />
        <div style={styles.content}>{this.renderContent()}</div>
      </div>
    );
  }
}
