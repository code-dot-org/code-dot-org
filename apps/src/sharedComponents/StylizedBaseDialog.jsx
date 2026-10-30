import PropTypes from 'prop-types';
import React from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import color from '@cdo/apps/util/color';
import {makeEnum} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

/**
 * StylizedBaseDialog
 * A styled version of the BaseDialog component.
 *
 * Includes a FooterButton component that appropriately styles buttons for the dialog.
 */

const FooterButtonType = makeEnum('cancel', 'confirm', 'default');
const FooterButtonColor = {
  [FooterButtonType.cancel]: Button.ButtonColor.gray,
  [FooterButtonType.confirm]: Button.ButtonColor.brandSecondaryDefault,
};

const DialogStyle = makeEnum('default', 'simple');

export function FooterButton(props) {
  const {type, color, ...buttonProps} = props;
  const buttonColor = color || FooterButtonColor[type] || undefined;

  // TODO: We shouldn't need to override <Button/> styles -- they should likely be default.
  // Tracked by https://codedotorg.atlassian.net/browse/STAR-1616.
  const style = {
    ...styles.buttons.all,
    ...(styles.buttons[props.type] || {}),
  };

  return <Button style={style} color={buttonColor} {...buttonProps} />;
}

// This component renders a <Button/>, so it will also accept/require any propTypes
// from that component.
FooterButton.propTypes = {
  type: PropTypes.oneOf(Object.keys(FooterButtonType)).isRequired,
  color: PropTypes.string,
};

FooterButton.defaultProps = {
  type: FooterButtonType.default,
};

export default function StylizedBaseDialog(props) {
  // Remove any props that should *not* be passed through to <BaseDialog/>.
  function passThroughProps() {
    let passThrough = {...props};
    delete passThrough.style;
    delete passThrough.children;

    return passThrough;
  }

  function renderTitle() {
    const {title} = props;
    if (typeof title === 'string') {
      return <h1 style={styles.title}>{title}</h1>;
    } else {
      return title;
    }
  }

  const horizontalRule =
    props.type === DialogStyle.simple ? null : <hr style={styles.hr} />;
  const defaultButtons = [
    <FooterButton
      key="cancel"
      type={FooterButtonType.cancel}
      text={props.cancellationButtonText}
      onClick={props.handleCancellation || props.handleClose}
    />,
    <FooterButton
      className="uitest-base-dialog-confirm"
      key="confirm"
      type={FooterButtonType.confirm}
      text={props.confirmationButtonText}
      onClick={props.handleConfirmation || props.handleClose}
      disabled={props.disableConfirmationButton}
    />,
  ];

  return (
    <BaseDialog
      {...passThroughProps()}
      useUpdatedStyles
      useFlexbox={props.stickyHeaderFooter}
    >
      {props.title && (
        <>
          <div style={styles.container}>{renderTitle()}</div>
          {horizontalRule}
        </>
      )}
      <div
        style={{
          ...styles.container,
          ...(styles.body[props.type] || {}),
          overflowY: props.stickyHeaderFooter && 'auto',
        }}
      >
        {props.body ? props.body : props.children}
      </div>
      {!props.hideFooter && (
        <div className="uitest-base-dialog-footer">
          {horizontalRule}
          <div
            style={{
              ...styles.container,
              ...styles.footer,
              justifyContent: props.footerJustification,
            }}
          >
            {props.renderFooter(defaultButtons)}
          </div>
        </div>
      )}
    </BaseDialog>
  );
}

StylizedBaseDialog.propTypes = {
  title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  body: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  // Alternative to providing body prop
  children: PropTypes.node,
  footerJustification: PropTypes.oneOf([
    'flex-start',
    'flex-end',
    'space-between',
  ]),
  renderFooter: PropTypes.func.isRequired,
  hideFooter: PropTypes.bool,
  confirmationButtonText: PropTypes.string.isRequired,
  cancellationButtonText: PropTypes.string.isRequired,
  disableConfirmationButton: PropTypes.bool,
  handleConfirmation: PropTypes.func,
  handleClose: PropTypes.func.isRequired,
  handleCancellation: PropTypes.func,
  type: PropTypes.oneOf(Object.keys(DialogStyle)),
  stickyHeaderFooter: PropTypes.bool,
};

StylizedBaseDialog.defaultProps = {
  footerJustification: 'flex-end',
  renderFooter: buttons => buttons,
  hideFooter: false,
  confirmationButtonText: i18n.dialogOK(),
  cancellationButtonText: i18n.dialogCancel(),
  type: DialogStyle.default,
};

const GUTTER = 20;
const styles = {
  container: {
    padding: `0 ${GUTTER}px`,
  },
  title: {
    color: color.dark_charcoal,
  },
  hr: {
    margin: 0,
    borderColor: color.lighter_gray,
  },
  body: {
    [DialogStyle.default]: {padding: GUTTER},
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    padding: `${GUTTER / 2}px ${GUTTER - 3}px`, // -3 to account for 3px-margin around <Button/>
  },
  buttons: {
    all: {boxShadow: 'none', flexShrink: 0},
    [FooterButtonType.confirm]: {borderColor: color.orange},
  },
};
