import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React from 'react';

import locale from '@cdo/locale';

import {childrenOfType, whenNoChildOfTypes} from '../propTypes';
import BaseDialog from '../templates/BaseDialog';
import color from '../util/color';

import LegacyButton from './LegacyButton';

export const styles = {
  icon: {
    backgroundSize: 100,
    backgroundPosition: 'bottom',
    backgroundRepeat: 'no-repeat',
    marginTop: -165,
    width: 120,
    height: 200,
    float: 'left',
  },
  title: {
    fontSize: 27,
    lineHeight: '30px',
    marginBottom: 15,
    color: color.purple,
  },
  body: {
    fontSize: 24,
    lineHeight: '27px',
    color: color.purple,
    whiteSpace: 'normal',
  },
  buttons: {
    marginTop: 10,
  },
  rightButton: {
    float: 'right',
  },
  buttonClear: {
    clear: 'both',
  },
  footer: {
    borderColor: color.light_gray,
    borderStyle: 'solid',
    borderWidth: 0,
    borderTopWidth: 2,
    marginTop: 15,
    paddingTop: 15,
  },
};

export function Title({children}) {
  return <h1 style={styles.title}>{children}</h1>;
}
Title.propTypes = {
  children: PropTypes.node,
};

export function Body({children}) {
  return <div style={styles.body}>{children}</div>;
}
Body.propTypes = {
  children: PropTypes.node,
};

export function Confirm(props) {
  let {type, ...other} = props;
  type = type || 'primary';
  return (
    <LegacyButton type={type} {...other}>
      {props.children || locale.dialogOK()}
    </LegacyButton>
  );
}
Confirm.propTypes = {
  children: PropTypes.node,
  type: PropTypes.string,
};

export function Cancel(props) {
  return (
    <LegacyButton type="cancel" {...props}>
      {props.children || locale.dialogCancel()}
    </LegacyButton>
  );
}
Cancel.propTypes = {
  children: PropTypes.node,
};

export function Buttons({children}) {
  children = React.Children.toArray(children);
  var leftChildren = children.slice(0, children.length - 1);
  var rightChild = children[children.length - 1];
  return (
    <div style={styles.buttons}>
      {leftChildren}
      <div style={styles.rightButton}>{rightChild}</div>
      <div style={styles.buttonClear} />
    </div>
  );
}
Buttons.propTypes = {
  children: childrenOfType(Cancel, Confirm),
};

export function Footer({children}) {
  return <div style={styles.footer}>{children}</div>;
}
Footer.propTypes = {
  children: PropTypes.node,
};

export var Icon = Radium(function Icon({src}) {
  return <span style={[styles.icon, {backgroundImage: `url(${src})`}]} />;
});
Icon.propTypes = {
  src: PropTypes.string.isRequired,
};

export default class Dialog extends React.Component {
  static propTypes = {
    ...BaseDialog.propTypes,
    children: childrenOfType(Icon, Title, Body, Buttons, Footer),
    icon: whenNoChildOfTypes(Icon),
    title: whenNoChildOfTypes(Title),
    body: whenNoChildOfTypes(Body),
    footer: whenNoChildOfTypes(Footer),
    cancelText: whenNoChildOfTypes(Buttons),
    onCancel: whenNoChildOfTypes(Buttons),
    confirmText: whenNoChildOfTypes(Buttons),
    onConfirm: whenNoChildOfTypes(Buttons),
    confirmType: whenNoChildOfTypes(Buttons),
  };

  handleKeyDown = event => {
    // Focus the next button, input or link when tab is pressed, to prevent the
    // user from selecting elements outside of the dialog.
    if (event.key === 'Tab') {
      const elements = this.baseDialog.getTabbableElements();
      if (elements.length) {
        // Focus the next element, or the first element if none is focused.
        const curIndex = elements.findIndex(
          btn => btn === document.activeElement
        );
        const nextIndex = (curIndex + 1) % elements.length;
        elements[nextIndex].focus();
      }
      event.preventDefault();
    }
  };

  render() {
    var children = [];
    if (this.props.icon) {
      children.push(<Icon key="icon" src={this.props.icon} />);
    }
    if (this.props.title) {
      children.push(<Title key="title">{this.props.title}</Title>);
    }
    if (this.props.body) {
      children.push(<Body key="body">{this.props.body}</Body>);
    }
    children = children.concat(this.props.children);
    if (
      this.props.cancelText ||
      this.props.onCancel ||
      this.props.confirmText ||
      this.props.onConfirm ||
      this.props.confirmType
    ) {
      var buttons = (
        <Buttons key="buttons">
          {this.props.onCancel && (
            <Cancel onClick={this.props.onCancel}>
              {this.props.cancelText}
            </Cancel>
          )}
          {this.props.onConfirm && (
            <Confirm
              onClick={this.props.onConfirm}
              type={this.props.confirmType}
            >
              {this.props.confirmText}
            </Confirm>
          )}
        </Buttons>
      );
      const lastChild = children[children.length - 1];
      if (lastChild && lastChild.type === Footer) {
        children.splice(children.length - 1, 0, buttons);
      } else {
        children.push(buttons);
      }
    }
    if (this.props.footer) {
      children.push(<Footer key="footer">{this.props.footer}</Footer>);
    }
    return (
      <BaseDialog
        {...this.props}
        ref={baseDialog => (this.baseDialog = baseDialog)}
        handleKeyDown={this.handleKeyDown}
      >
        {children}
      </BaseDialog>
    );
  }
}
