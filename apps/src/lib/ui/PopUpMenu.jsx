import React, {Component, PropTypes, Children} from 'react';
import Radium from 'radium';
import color from '../../util/color';

const TAIL_WIDTH = 14;
const TAIL_HEIGHT = 12;
const BACKGROUND_COLOR = color.white;
const BORDER_COLOR = color.light_gray;

const style = {
  menu: {
    position: 'absolute',
    zIndex: 20,
    border: `1px solid ${BORDER_COLOR}`,
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: 2,
    boxShadow: "3px 3px 3px gray",
    marginTop: TAIL_HEIGHT,
    textAlign: 'center',
  },
};
const tailBorderStyle = {
  position: 'absolute',
  bottom: '100%',
  left: '50%',
  marginLeft: -TAIL_WIDTH / 2,
  borderTopWidth: 0,
  borderBottomWidth: TAIL_HEIGHT,
  borderLeftWidth: TAIL_WIDTH / 2,
  borderRightWidth: TAIL_WIDTH / 2,
  borderStyle: 'solid',
  borderColor: `transparent transparent ${BORDER_COLOR} transparent`,
};
const tailFillStyle = {
  ...tailBorderStyle,
  bottom: 'calc(100% - 2px)',
  borderColor: `transparent transparent ${BACKGROUND_COLOR} transparent`,
};

class PopUpMenu_ extends Component {
  static propTypes = {
    targetPoint: PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    }).isRequired,
    width: PropTypes.number,
    children: PropTypes.any,
  };

  static defaultProps = {
    width: 220,
  };

  renderMenuItems() {
    const {children} = this.props;
    if (Children.count(children) === 0) {
      return <div><em>No menu items available.</em></div>;
    }
    return <div>{children}</div>;
  }

  render() {
    const {width, targetPoint} = this.props;
    const menuStyle = {
      ...style.menu,
      ...targetPoint,
      width,
      marginLeft: -width / 2,
    };

    return (
      <div style={menuStyle}>
        {this.renderMenuItems()}
        {/* These elements are used to draw the 'tail' with CSS */}
        <span style={tailBorderStyle}/>
        <span style={tailFillStyle}/>
      </div>
    );
  }
}
const PopUpMenu = Radium(PopUpMenu_);
export default PopUpMenu;

class Item_ extends Component {
  static propTypes = {
    children: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  };

  static style = {
    color: color.dark_charcoal,
    paddingLeft: '1em',
    paddingRight: '1em',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: color.lightest_gray,
    }
  };

  render() {
    return (
      <div style={Item_.style} onClick={this.props.onClick}>
        {this.props.children}
      </div>
    );
  }
}
const Item = Radium(Item_);
PopUpMenu.Item = Item;
