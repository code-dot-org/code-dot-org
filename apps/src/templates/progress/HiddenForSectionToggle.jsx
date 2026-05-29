import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import styles from './hiddenForSectionToggle.module.scss';

/**
 * A toggle that goes between visible and hidden. Used by teachers to hide/show
 * scripts or lessons on a per-section basis.
 */
const HiddenForSectionToggle = ({hidden, disabled, onChange}) => {
  const buttons = [
    {
      label: i18n.visible(),
      value: 'visible',
      iconLeft: {iconName: 'eye', iconStyle: 'regular'},
      disabled,
    },
    {
      label: i18n.hidden(),
      value: 'hidden',
      iconLeft: {iconName: 'eye-slash', iconStyle: 'regular'},
      disabled,
    },
  ];

  return (
    <div
      className={classNames(
        styles.toggle,
        disabled && styles.disabled,
        'uitest-togglehidden'
      )}
    >
      <SegmentedButtons
        buttons={buttons}
        selectedButtonValue={hidden ? 'hidden' : 'visible'}
        onChange={onChange}
        size="s"
      />
    </div>
  );
};

HiddenForSectionToggle.propTypes = {
  hidden: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

export const UnconnectedHiddenForSectionToggle = HiddenForSectionToggle;

export default HiddenForSectionToggle;
