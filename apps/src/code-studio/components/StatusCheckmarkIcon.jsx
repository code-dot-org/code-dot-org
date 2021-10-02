import React from 'react';
import color from '@cdo/apps/util/color';
import {makeEnum} from '@cdo/apps/utils';
import PropTypes from 'prop-types';

export const iconStatus = makeEnum('noAction', 'success', 'failure');

export default function StatusCheckmarkIcon(props) {
  let icon;
  switch (props.displayStatus) {
    case iconStatus.success:
      icon = 'check';
      break;
    case iconStatus.failure:
      icon = 'close';
      break;
    default:
      icon = '';
  }

  const visibility = icon.length > 0;

  return (
    <i
      style={{
        ...styles.checkmark,
        visibility: visibility ? 'visible' : 'hidden'
      }}
      className={`fa fa-${icon}`}
      aria-hidden="true"
    />
  );
}

StatusCheckmarkIcon.propTypes = {
  displayStatus: PropTypes.oneOf()
};

const styles = {
  checkmark: {
    color: color.light_green,
    fontSize: 18,
    left: 5,
    lineHeight: 25,
    position: 'relative',
    top: 7
  }
};
