import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';

/**
 * StylizedBaseDialog
 * A styled version of the BaseDialog component.
 *
 * Includes a FooterButton component that appropriately styles buttons for the dialog.
 */

export function FooterButton(props) {
  const isConfirm = props.type === 'confirm';
  const isCancel = props.type === 'cancel';
  const color = props.color || (isConfirm && 'orange') || (isCancel && 'gray');

  // TODO: We shouldn't need to override <Button/> styles -- they should likely be default.
  // Tracked by https://codedotorg.atlassian.net/browse/STAR-1616.
  const style = {
    ...styles.buttons.all,
    ...(isConfirm && styles.buttons.confirmation)
  };

  return (
    <Button
      style={style}
      color={typeof color === 'string' ? color : undefined}
      {...props}
    />
  );
}

// This component renders a <Button/>, so it will also accept/require any propTypes
// from that component.
FooterButton.propTypes = {
  type: PropTypes.oneOf(['confirm', 'cancel', 'default']).isRequired,
  color: PropTypes.string
};

FooterButton.defaultProps = {
  type: 'default'
};
export default function StylizedBaseDialog(props) {
  // Remove any props that should *not* be passed through to <BaseDialog/>.
  function passThroughProps() {
    let passThrough = {...props};
    delete passThrough.style;
    delete passThrough.children;

    return passThrough;
  }

  const defaultButtons = [
    <FooterButton
      key="cancel"
      type="cancel"
      text={props.cancellationButtonText}
      onClick={props.handleCancellation || props.handleClose}
    />,
    <FooterButton
      key="confirm"
      type="confirm"
      text={props.confirmationButtonText}
      onClick={props.handleConfirmation}
    />
  ];
  const footer = props.renderFooter(defaultButtons);

  return (
    <BaseDialog {...passThroughProps()} useUpdatedStyles>
      <div style={styles.container}>
        <h1 style={styles.title}>{props.title}</h1>
      </div>
      <hr style={styles.hr} />
      <div style={{...styles.container, ...styles.body}}>{props.body}</div>
      <hr style={styles.hr} />
      <div
        style={{
          ...styles.container,
          ...styles.footer,
          justifyContent: props.footerJustification
        }}
      >
        {props.renderFooter(defaultButtons)}
      </div>
    </BaseDialog>
  );
}

StylizedBaseDialog.propTypes = {
  title: PropTypes.string.isRequired,
  body: PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired,
  footerJustification: PropTypes.oneOf([
    'flex-start',
    'flex-end',
    'space-between'
  ]),
  renderFooter: PropTypes.func.isRequired,
  confirmationButtonText: PropTypes.string.isRequired,
  cancellationButtonText: PropTypes.string.isRequired,
  handleConfirmation: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleCancellation: PropTypes.func
};

StylizedBaseDialog.defaultProps = {
  footerJustification: 'flex-end',
  renderFooter: buttons => buttons,
  confirmationButtonText: i18n.dialogOK(),
  cancellationButtonText: i18n.dialogCancel()
};

const GUTTER = 20;
const styles = {
  container: {
    padding: `0 ${GUTTER}px`
  },
  title: {
    color: color.dark_charcoal
  },
  hr: {
    margin: 0,
    borderColor: color.lighter_gray
  },
  body: {
    padding: GUTTER
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    padding: `${GUTTER / 2}px ${GUTTER - 3}px` // -3 to account for 3px-margin around <Button/>
  },
  buttons: {
    all: {boxShadow: 'none'},
    confirmation: {borderColor: color.orange}
  }
};
