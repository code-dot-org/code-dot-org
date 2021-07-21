import React from 'react';
import PropTypes from 'prop-types';

export default class AddDefaultSprite extends React.Component {
  static propTypes = {
    onAdd: PropTypes.func.isRequired
  };

  state = {
    spriteName: '',
    spriteCategory: ''
  };

  handleNameChange = event => {
    this.setState({spriteName: event.target.value});
  };

  handleCategoryChange = event => {
    this.setState({spriteCategory: event.target.value});
  };

  render() {
    return (
      <div style={styles.assetRow}>
        <h3>Add a sprite: </h3>
        <label htmlFor="sprite-path" style={styles.addSpriteLabel}>
          Sprite name:
        </label>
        <input
          type="text"
          id="sprite-name"
          name="name"
          onChange={this.handleNameChange}
          required
        />
        <label htmlFor="sprite-path" style={styles.addSpriteLabel}>
          Sprite category path:
        </label>
        <input
          type="text"
          id="sprite-path"
          name="path"
          onChange={this.handleCategoryChange}
          required
        />
        <button
          type="button"
          onClick={() =>
            this.props.onAdd(this.state.spriteName, this.state.spriteCategory)
          }
        >
          Add
        </button>
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
  addSpriteLabel: {
    padding: 10
  }
};
