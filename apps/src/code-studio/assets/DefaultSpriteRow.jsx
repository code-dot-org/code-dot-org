import React from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';

export default function DefaultSpriteRow(props) {
  let {name, keyValue, onDelete} = props;
  return (
    <div style={styles.assetRow}>
      <Button
        text="Delete"
        color={Button.ButtonColor.red}
        onClick={() => onDelete(name)}
        icon="trash"
        iconClassName="fa-trash"
      />
      <h3>
        {name}: {keyValue}
      </h3>
    </div>
  );
}

DefaultSpriteRow.propTypes = {
  name: PropTypes.string.isRequired,
  keyValue: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired
};

const styles = {
  assetRow: {
    borderTop: '1px solid gray',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  }
};
