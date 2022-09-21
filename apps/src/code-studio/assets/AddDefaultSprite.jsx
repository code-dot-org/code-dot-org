import React from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import StatusIcon, {
  iconStatus
} from '@cdo/apps/code-studio/components/StatusIcon';

export default class AddDefaultSprite extends React.Component {
  static propTypes = {
    onAdd: PropTypes.func.isRequired
  };

  state = {
    spriteName: '',
    spriteCategory: '',
    displaySuccess: iconStatus.none
  };

  handleNameChange = event => {
    this.setState({
      spriteName: event.target.value,
      displaySuccess: iconStatus.none
    });
  };

  handleCategoryChange = event => {
    this.setState({
      spriteCategory: event.target.value,
      displaySuccess: iconStatus.none
    });
  };

  handleSpriteAdd = addToBeginning => {
    this.props.onAdd(
      addToBeginning,
      this.state.spriteName,
      this.state.spriteCategory
    );
    this.setState({
      spriteName: '',
      spriteCategory: '',
      displaySuccess: iconStatus.success
    });
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
          color={Button.ButtonColor.orange}
          onClick={() => this.handleSpriteAdd(true)}
          size={Button.ButtonSize.narrow}
        />
        <Button
          text="Add to end"
          color={Button.ButtonColor.orange}
          onClick={() => this.handleSpriteAdd(false)}
          size={Button.ButtonSize.narrow}
        />
        <StatusIcon displayStatus={displaySuccess} />
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
    alignItems: 'center'
  },
  addSpriteLabel: {
    padding: 10
  }
};
