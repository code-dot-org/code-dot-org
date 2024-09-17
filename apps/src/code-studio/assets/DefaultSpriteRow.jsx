import PropTypes from 'prop-types';
import React from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import color from '@cdo/apps/util/color';

export default function DefaultSpriteRow(props) {
  let {name, onDelete, onMove} = props;
  return (
    <div style={styles.assetRow}>
      <Button
        text="Delete"
        color={Button.ButtonColor.red}
        onClick={() => onDelete(name)}
        icon="trash"
        iconClassName="fa-trash"
      />
      <Button
        color={Button.ButtonColor.gray}
        onClick={() => onMove(true /*moveForward*/, name)}
        size={Button.ButtonSize.narrow}
        icon="arrow-up"
        iconClassName="fa-arrow-up"
      />
      <Button
        color={Button.ButtonColor.gray}
        onClick={() => onMove(false /*moveForward*/, name)}
        size={Button.ButtonSize.narrow}
        icon="arrow-down"
        iconClassName="fa-arrow-down"
      />
      <h3>{name}</h3>
    </div>
  );
}

DefaultSpriteRow.propTypes = {
  name: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
};

const styles = {
  assetRow: {
    borderTop: '1px solid',
    borderColor: color.dark_slate_gray,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
};
