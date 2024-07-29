import PropTypes from 'prop-types';
import React from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import color from '@cdo/apps/util/color';

export default class AddDefaultSprite extends React.Component {
  static propTypes = {
    onAdd: PropTypes.func.isRequired,
  };

  state = {
    spriteName: '',
    spriteCategory: '',
    displaySuccess: false,
  };

  handleNameChange = event => {
    this.setState({spriteName: event.target.value, displaySuccess: false});
  };

  handleCategoryChange = event => {
    this.setState({spriteCategory: event.target.value, displaySuccess: false});
  };

  handleSpriteAdd = addToBeginning => {
    this.props.onAdd(
      addToBeginning,
      this.state.spriteName,
      this.state.spriteCategory
    );
    this.setState({spriteName: '', spriteCategory: '', displaySuccess: true});
  };

  render() {
    let {displaySuccess} = this.state;
    return (
      <div style={styles.assetRow}>
        <h3>Add an animation: </h3>
        <label htmlFor="sprite-name" style={styles.addSpriteLabel}>
          Name:
        </label>
        <input
          type="text"
          id="sprite-name"
          name="name"
          onChange={this.handleNameChange}
          required
        />
        <label htmlFor="sprite-path" style={styles.addSpriteLabel}>
          Category path:
        </label>
        <input
          type="text"
          id="sprite-path"
          name="path"
          onChange={this.handleCategoryChange}
          required
        />
        <Button
          text="Add to start"
          color={Button.ButtonColor.brandSecondaryDefault}
          onClick={() => this.handleSpriteAdd(true)}
          size={Button.ButtonSize.narrow}
        />
        <Button
          text="Add to end"
          color={Button.ButtonColor.brandSecondaryDefault}
          onClick={() => this.handleSpriteAdd(false)}
          size={Button.ButtonSize.narrow}
        />
        <i
          style={{
            ...styles.checkmark,
            visibility: displaySuccess ? 'visible' : 'hidden',
          }}
          className="fa fa-check"
          aria-hidden="true"
        />
      </div>
    );
  }
}

const styles = {
  assetRow: {
    borderTop: '1px solid',
    borderColor: color.dark_slate_gray,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  addSpriteLabel: {
    padding: 10,
  },
  checkmark: {
    color: color.light_green,
    fontSize: 18,
    left: 5,
    lineHeight: '25px',
    position: 'relative',
    top: 7,
  },
};
