/** @file Pop-over menu component.  Combine with react-portal to use. */
import React, {Component, Children} from 'react';
import PropTypes from 'prop-types';

import Radium from 'radium';
import {PortalWithState} from 'react-portal';
import msg from '@cdo/locale';
import color from '../../util/color';

const TAIL_WIDTH = 14;
const TAIL_HEIGHT = 12;
const BACKGROUND_COLOR = color.white;
const BORDER_COLOR = color.light_gray;
export const STANDARD_PADDING = 20;

const menuStyle = {
  position: 'absolute',
  zIndex: 20,
  border: `1px solid ${BORDER_COLOR}`,
  backgroundColor: BACKGROUND_COLOR,
  borderRadius: 2,
  boxShadow: '3px 3px 3px gray',
  textAlign: 'left',
  maxWidth: 300
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
  borderColor: `transparent transparent ${BORDER_COLOR} transparent`
};
const tailFillStyle = {
  ...tailBorderStyle,
  bottom: 'calc(100% - 2px)',
  borderColor: `transparent transparent ${BACKGROUND_COLOR} transparent`
};

export default class PopUpMenu extends Component {
  static propTypes = {
    targetPoint: PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired
    }).isRequired,
    offset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }),
    children: PropTypes.any,
    className: PropTypes.string,
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    showTail: PropTypes.bool,
    style: PropTypes.object
  };

  render() {
    return (
      this.props.isOpen && (
        <PortalWithState
          closeOnOutsideClick
          closeOnEsc
          onClose={this.props.onClose}
          defaultOpen={this.props.isOpen}
        >
          {({openPortal, closePortal, isOpen, portal}) => (
            <div>
              {portal(
                <MenuBubble
                  targetPoint={this.props.targetPoint}
                  offset={this.props.offset}
                  className={this.props.className}
                  showTail={this.props.showTail}
                  style={this.props.style}
                >
                  {this.props.children}
                </MenuBubble>
              )}
            </div>
          )}
        </PortalWithState>
      )
    );
  }
}

class MenuBubbleUnwrapped extends Component {
  static propTypes = {
    targetPoint: PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired
    }).isRequired,
    offset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }),
    children: PropTypes.any,
    className: PropTypes.string,
    showTail: PropTypes.bool,
    style: PropTypes.object
  };

  renderMenuItems() {
    let {children} = this.props;
    if (Array.isArray(children)) {
      children = children.filter(x => x);
    }
    const childCount = Children.count(children);
    if (childCount === 0) {
      return (
        <div>
          <em>{msg.noMenuItemsAvailable()}</em>
        </div>
      );
    }
    return (
      <div>
        {Children.map(children, (child, index) => {
          if (!child) {
            return child;
          }

          return React.cloneElement(child, {
            first: index === 0,
            last: index === childCount - 1
          });
        })}
      </div>
    );
  }

  render() {
    const {targetPoint, className} = this.props;
    const marginTop = this.props.offset ? this.props.offset.y : TAIL_HEIGHT;
    const marginLeft = this.props.offset
      ? this.props.offset.x
      : -STANDARD_PADDING;
    const style = {
      ...menuStyle,
      ...this.props.style,
      ...targetPoint,
      marginTop: marginTop,
      marginLeft: marginLeft
    };

    return (
      <div style={style} className={className}>
        {this.renderMenuItems()}
        {/* These elements are used to draw the 'tail' with CSS */}
        {this.props.showTail && <span style={tailBorderStyle} />}
        {this.props.showTail && <span style={tailFillStyle} />}
      </div>
    );
  }
}
export const MenuBubble = Radium(MenuBubbleUnwrapped);

export class MenuBreak extends Component {
  render() {
    const style = {
      borderTop: '1px solid ' + color.lighter_gray,
      marginTop: STANDARD_PADDING / 2,
      marginBottom: STANDARD_PADDING / 2,
      marginLeft: STANDARD_PADDING,
      marginRight: STANDARD_PADDING
    };
    return <div style={style} />;
  }
}

class Item extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    href: PropTypes.string,
    first: PropTypes.bool,
    last: PropTypes.bool,
    color: PropTypes.string,
    openInNewTab: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object
  };

  render() {
    const {
      first,
      last,
      onClick,
      children,
      href,
      openInNewTab,
      className,
      style
    } = this.props;
    const defaultClassName = 'pop-up-menu-item';
    const classList = className
      ? `${defaultClassName} ${className}`
      : defaultClassName;
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
        backgroundColor: color.lightest_gray
      }
    };

    const wrapperStyle = {
      ...paddingStyle,
      ...style
    };

    // Style for anchors tags nested in divs
    const areaStyle = {
      display: 'block'
    };

    const textStyle = {
      color: this.props.color ? this.props.color : color.dark_charcoal,
      textDecoration: 'none', // Remove underline from anchor tags
      fontFamily: "'Gotham 4r', sans-serif"
    };

    const target = openInNewTab ? '_blank' : '';

    return (
      <div style={wrapperStyle}>
        {this.props.href && (
          <a
            className={classList}
            href={href}
            style={{...textStyle, ...areaStyle}}
            target={target}
          >
            {children}
          </a>
        )}
        {!this.props.href && (
          <div className={classList} style={textStyle} onClick={onClick}>
            {children}
          </div>
        )}
      </div>
    );
  }
}

PopUpMenu.Item = Radium(Item);
