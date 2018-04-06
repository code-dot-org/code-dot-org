/** @file Pop-over menu component.  Combine with react-portal to use. */
import React, {Component, PropTypes, Children} from 'react';
import Radium from 'radium';
import Portal from 'react-portal';
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
  textAlign: 'left',
  maxWidth: 200,
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

export default class PopUpMenu extends Component {
  static propTypes = {
    targetPoint: PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    }).isRequired,
    offset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
    children: PropTypes.any,
    className: PropTypes.string,
    isOpen: PropTypes.bool,
    beforeClose: PropTypes.func,
    showTail: PropTypes.bool,
  };

  render() {
    return (
      <Portal
        closeOnEsc
        closeOnOutsideClick
        isOpened={this.props.isOpen}
        beforeClose={this.props.beforeClose}
      >
        <MenuBubble
          targetPoint={this.props.targetPoint}
          offset={this.props.offset}
          className={this.props.className}
          children={this.props.children}
          showTail={this.props.showTail}
        />
      </Portal>
    );
  }
}

class MenuBubbleUnwrapped extends Component {
  static propTypes = {
    targetPoint: PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    }).isRequired,
    offset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
    children: PropTypes.any,
    className: PropTypes.string,
    showTail: PropTypes.bool,
  };

  renderMenuItems() {
    let {children} = this.props;
    if (Array.isArray(children)) {
      children = children.filter(x => x);
    }
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
    const {targetPoint, className} = this.props;
    const marginTop = this.props.offset ? this.props.offset.y : TAIL_HEIGHT;
    const marginLeft = this.props.offset ? this.props.offset.x : -STANDARD_PADDING;
    const style = {
      ...menuStyle,
      ...targetPoint,
      marginTop: marginTop,
      marginLeft: marginLeft,
    };

    return (
      <div style={style} className={className}>
        {this.renderMenuItems()}
        {/* These elements are used to draw the 'tail' with CSS */}
        {this.props.showTail &&
          <span style={tailBorderStyle}/>
        }
        {this.props.showTail &&
          <span style={tailFillStyle}/>
        }
      </div>
    );
  }
}
export const MenuBubble = Radium(MenuBubbleUnwrapped);

export class MenuBreak extends Component {

  render() {
    const style = {
      borderTop: '1px solid ' + color.lighter_gray,
      marginTop: STANDARD_PADDING/2,
      marginBottom: STANDARD_PADDING/2,
      marginLeft: STANDARD_PADDING,
      marginRight: STANDARD_PADDING,
    };
    return (
      <div style={style}></div>
    );
  }
}

class Item extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array]).isRequired,
    onClick: PropTypes.func,
    href: PropTypes.string,
    first: PropTypes.bool,
    last: PropTypes.bool,
    color: PropTypes.string,
    openInNewTab: PropTypes.bool,
  };

  render() {
    const {first, last, onClick, children, href, openInNewTab} = this.props;
    if (!href && !onClick) {
      throw new Error('Expect at least one of href/onClick');
    }

    const paddingStyle = {
      paddingTop: first ? STANDARD_PADDING : STANDARD_PADDING / 4,
      paddingBottom: last ? STANDARD_PADDING : STANDARD_PADDING / 4,
      paddingLeft: STANDARD_PADDING,
      paddingRight: STANDARD_PADDING,
      cursor: 'pointer',
      ':hover': {
        backgroundColor: color.lightest_gray,
      }
    };

    // Style for anchors tags nested in divs
    const areaStyle = {
      display: 'block',
    };

    const textStyle = {
      color: this.props.color? this.props.color : color.dark_charcoal,
      textDecoration: 'none', // Remove underline from anchor tags
      fontFamily: "'Gotham 4r', sans-serif"
    };

    const target = openInNewTab ? "_blank" : "";

    return (
      <div style={paddingStyle}>
        {this.props.href &&
          <a
            className="pop-up-menu-item"
            href={href}
            style={{...textStyle, ...areaStyle}}
            target={target}
          >
            {children}
          </a>
        }
        {!this.props.href &&
          <div
            className="pop-up-menu-item"
            style={textStyle}
            onClick={onClick}
          >
            {children}
          </div>
        }
      </div>
    );
  }
}

PopUpMenu.Item = Radium(Item);
