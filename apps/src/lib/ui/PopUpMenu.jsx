/** @file Pop-over menu component.  Combine with react-portal to use. */
import React, {Component, PropTypes, Children} from 'react';
import Radium from 'radium';
import msg from '@cdo/locale';
import color from '../../util/color';

const TAIL_WIDTH = 14;
const TAIL_HEIGHT = 12;
const BACKGROUND_COLOR = color.white;
const BORDER_COLOR = color.light_gray;
const STANDARD_PADDING = 20;

const menuStyle = {
  position: 'absolute',
  zIndex: 20,
  border: `1px solid ${BORDER_COLOR}`,
  backgroundColor: BACKGROUND_COLOR,
  borderRadius: 2,
  boxShadow: "3px 3px 3px gray",
  marginTop: TAIL_HEIGHT,
  textAlign: 'left',
};
const tailBorderStyle = {
  position: 'absolute',
  bottom: '100%',
  left: STANDARD_PADDING,
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

class PopUpMenu extends Component {
  static propTypes = {
    targetPoint: PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    }).isRequired,
    children: PropTypes.any,
  };

  renderMenuItems() {
    const {children} = this.props;
    const childCount = Children.count(children);
    if (childCount === 0) {
      return <div><em>{msg.noMenuItemsAvailable()}</em></div>;
  }
    return (
      <div>
        {Children.map(children, (child, index) => {
          if (!child) {
            return child;
          }

          return React.cloneElement(child, {
            first: index === 0,
            last: index === childCount - 1,
          });
        })}
      </div>
    );
  }

  render() {
    const {targetPoint} = this.props;
    const style = {
      ...menuStyle,
      ...targetPoint,
      marginLeft: -STANDARD_PADDING,
    };

    return (
      <div style={style}>
        {this.renderMenuItems()}
        {/* These elements are used to draw the 'tail' with CSS */}
        <span style={tailBorderStyle}/>
        <span style={tailFillStyle}/>
      </div>
    );
  }
}
export default Radium(PopUpMenu);

class Item extends Component {
  static propTypes = {
    children: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    first: PropTypes.bool,
    last: PropTypes.bool,
  };

  static style = {
    color: color.dark_charcoal,
    paddingLeft: STANDARD_PADDING,
    paddingRight: STANDARD_PADDING,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: color.lightest_gray,
    }
  };

  render() {
    const {first, last, onClick, children} = this.props;
    const style = {
      ...Item.style,
      paddingTop: first ? STANDARD_PADDING : STANDARD_PADDING / 2,
      paddingBottom: last ? STANDARD_PADDING : STANDARD_PADDING / 2,
    };
    return (
      <div style={style} onClick={onClick}>
        {children}
      </div>
    );
  }
}
PopUpMenu.Item = Radium(Item);
