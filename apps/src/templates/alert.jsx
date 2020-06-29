import PropTypes from 'prop-types';
import React from 'react';
import color from '../util/color';
import {valueOr} from '../utils';

/**
 * Simple boot-strapped style alert.
 */
export default class Alert extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    type: PropTypes.oneOf(['error', 'warning', 'notification']).isRequired,
    onClose: PropTypes.func.isRequired,
    closeDelayMillis: PropTypes.number,
    sideMargin: PropTypes.number,
    bottomMargin: PropTypes.number,
    childPadding: PropTypes.string
  };

  render() {
    const styles = {
      main: {
        position: 'relative',
        zIndex: 1000,
        marginTop: 20,
        marginLeft: valueOr(this.props.sideMargin, 50),
        marginRight: valueOr(this.props.sideMargin, 50)
      },
      typeSpecific: {
        error: {
          borderColor: color.bootstrap_error_border,
          backgroundColor: color.bootstrap_error_background,
          color: color.bootstrap_error_text
        },
        warning: {
          borderColor: color.bootstrap_warning_border,
          backgroundColor: color.bootstrap_warning_background,
          color: color.black
        },
        notification: {
          borderColor: color.light_green,
          backgroundColor: color.lighter_green,
          color: color.realgreen
        }
      },
      child: {
        // from bootstrap's alert
        padding: valueOr(this.props.childPadding, '8px 35px 8px 14px'),
        marginBottom: valueOr(this.props.bottomMargin, 20),
        textShadoow: '0 1px 0 rgba(255, 255, 255, 0.5)',
        border: '1px solid',
        borderRadius: 4
      },
      closeButton: {
        margin: 0,
        // from bootstrap's close (note: we've lost :hover)
        padding: 0,
        cursor: 'pointer',
        background: 'transparent',
        border: 0,
        WebkitAppearance: 'none',
        float: 'right',
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: '20px',
        color: color.black,
        textShadow: '0 1px 0 white',
        opacity: 0.2,
        position: 'relative',
        top: -2,
        right: -21
      }
    };

    const childStyle = {
      ...styles.child,
      ...styles.typeSpecific[this.props.type]
    };
    let closeButton = '';
    if (this.props.closeDelayMillis) {
      setTimeout(this.props.onClose, this.props.closeDelayMillis);
    } else {
      closeButton = (
        <button
          type="button"
          style={styles.closeButton}
          onClick={this.props.onClose}
        >
          <span>&times;</span>
        </button>
      );
    }

    return (
      <div style={styles.main}>
        <div style={childStyle}>
          {closeButton}
          {this.props.children}
        </div>
      </div>
    );
  }
}
