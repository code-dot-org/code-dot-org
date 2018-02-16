import React, {PropTypes} from 'react';
import commonStyles from '../../commonStyles';
import Radium from 'radium';
import designMode from "../designMode";

const styles = {
  copyElementToScreenButton: {
    backgroundColor: '#0aa',
    color: 'white',
    float: 'right'
  },
  screen: {
  },
};

/**
 * A duplicate button that helps replicate elements
 */
class CopyElementToScreenButton extends React.Component {
  static propTypes = {
    currentScreenId: PropTypes.string.isRequired,
    handleCopyElementToScreen: PropTypes.func.isRequired,
    screenIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  state = {
    opened: false,
  };

  handleDropdownClick = (event) => {
    this.setState({opened: !this.state.opened});
  };

  handleCopyElementToScreen = (event) => this.props.handleCopyElementToScreen(event.id);

  render() {
    const isVisible = this.props.screenIds.length > 1;
    const showDropdown = isVisible && this.state.opened;
    const otherScreens = !showDropdown ? '' : this.props.screenIds
        .filter((screenId) => screenId !== this.props.currentScreenId)
        .map((screenId) => <button style={styles.screen} id = {screenId) onClick={this.handleCopyElementToScreen}>);
    return (
        <div style={styles.main}>
          {isVisible && <button
              style={[commonStyles.button, styles.copyElementToScreenButton]}
              onClick={this.handleDropdownClick}
          >
            Copy to screen
          </button>}
          {otherScreens}}
        </div>
    );
  }
}

export default Radium(CopyElementToScreenButton);
