import React from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';

export default class DefaultSpriteRow extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    keyValue: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired
  };

  state = {
    isDeleted: false
  };

  deleteSprite(spriteName) {
    this.props.onDelete(spriteName);
    this.setState({isDeleted: true});
  }

  render() {
    let isDeleted = this.state.isDeleted;
    return (
      <div style={styles.assetRow}>
        {isDeleted && <h3 style={styles.deletedText}>Deleted</h3>}
        {!isDeleted && (
          <Button
            text={'Delete'}
            color={Button.ButtonColor.red}
            onClick={() => this.deleteSprite(this.props.name)}
            icon={'trash'}
            iconClassName={'fa-trash'}
          />
        )}
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
  },
  deletedText: {
    color: color.red,
    padding: 10
  }
};
