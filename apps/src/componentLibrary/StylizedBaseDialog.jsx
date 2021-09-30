import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {makeEnum} from '@cdo/apps/utils';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';

/**
 * StylizedBaseDialog
 * A styled version of the BaseDialog component.
 *
 * Includes a FooterButton component that appropriately styles buttons for the dialog.
 */

const FooterButtonType = makeEnum('cancel', 'confirm', 'default');
const DialogStyle = makeEnum('default', 'simple');

export function FooterButton(props) {
  const isConfirm = props.type === FooterButtonType.confirm;
  const isCancel = props.type === FooterButtonType.cancel;
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
  type: PropTypes.oneOf(Object.keys(FooterButtonType)).isRequired,
  color: PropTypes.string
};

FooterButton.defaultProps = {
  type: FooterButtonType.default
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
      type="cancel"
      text={props.cancellationButtonText}
      onClick={props.handleCancellation || props.handleClose}
    />,
    <FooterButton
      key="confirm"
      type="confirm"
      text={props.confirmationButtonText}
      onClick={props.handleConfirmation || props.handleClose}
    />
  ];

  return (
    <BaseDialog {...passThroughProps()} useUpdatedStyles>
      {props.title && (
        <>
          <div style={styles.container}>{renderTitle()}</div>
          {horizontalRule}
        </>
      )}
      <div
        style={{
          ...styles.container,
          ...(props.type === DialogStyle.simple ? {} : {padding: GUTTER})
        }}
      >
        {props.body}
      </div>
      {!props.hideFooter && (
        <div>
          {horizontalRule}
          <div
            style={{
              ...styles.container,
              ...styles.footer,
              justifyContent: props.footerJustification
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
  body: PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired,
  footerJustification: PropTypes.oneOf([
    'flex-start',
    'flex-end',
    'space-between'
  ]),
  renderFooter: PropTypes.func.isRequired,
  hideFooter: PropTypes.bool,
  confirmationButtonText: PropTypes.string.isRequired,
  cancellationButtonText: PropTypes.string.isRequired,
  handleConfirmation: PropTypes.func,
  handleClose: PropTypes.func.isRequired,
  handleCancellation: PropTypes.func,
  type: PropTypes.oneOf(Object.keys(DialogStyle))
};

StylizedBaseDialog.defaultProps = {
  footerJustification: 'flex-end',
  renderFooter: buttons => buttons,
  hideFooter: false,
  confirmationButtonText: i18n.dialogOK(),
  cancellationButtonText: i18n.dialogCancel(),
  type: DialogStyle.default
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
