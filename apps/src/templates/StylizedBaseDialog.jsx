import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';

/**
 * StylizedBaseDialog
 * A styled version of the BaseDialog component.
 */
export default function StylizedBaseDialog(props) {
  // Remove any props that should *not* be passed through to <BaseDialog/>.
  function passThroughProps() {
    let passThrough = {...props};
    delete passThrough.style;
    delete passThrough.children;

    return passThrough;
  }

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
        <Button
          text={props.cancellationButtonText}
          onClick={props.handleClose}
          color="gray"
          style={styles.buttons.all}
        />
        <Button
          text={props.confirmationButtonText}
          onClick={props.handleConfirmation}
          color="orange"
          style={{...styles.buttons.all, ...styles.buttons.confirmation}}
        />
      </div>
    </BaseDialog>
  );
}

StylizedBaseDialog.propTypes = {
  title: PropTypes.string.isRequired,
  body: PropTypes.element.isRequired,
  footerJustification: PropTypes.oneOf(['flex-start', 'flex-end']),
  confirmationButtonText: PropTypes.string.isRequired,
  cancellationButtonText: PropTypes.string.isRequired,
  handleConfirmation: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired
};

StylizedBaseDialog.defaultProps = {
  footerJustification: 'flex-end',
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
    padding: `${GUTTER / 2}px ${GUTTER - 3}px` // -3 to account for 3px-margin around <Button/>
  },
  buttons: {
    all: {boxShadow: 'none'},
    confirmation: {borderColor: color.orange}
  }
};
