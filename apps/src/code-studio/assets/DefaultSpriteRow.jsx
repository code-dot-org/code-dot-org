import React from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';

export default class DefaultSpriteRow extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    keyValue: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired
  };

  render() {
    return (
      <div style={styles.assetRow}>
        <Button
          text={'Delete'}
          color={Button.ButtonColor.red}
          onClick={() => this.props.onDelete(this.props.name)}
          icon={'trash'}
          iconClassName={'fa-trash'}
        />
        <h3>
          {this.props.name}: {this.props.keyValue}
        </h3>
      </div>
    );
  }
}

const styles = {
  assetRow: {
    borderTop: '1px solid gray',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  }
};
