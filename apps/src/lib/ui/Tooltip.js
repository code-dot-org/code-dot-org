import React, { PropTypes, Component } from 'react';
import RCTooltip from 'rc-tooltip';

// Note: rc-tooltip generally expects classNames to be used for styling. I've
// managed to replicate the styling from node_modules/rc-tooltip/assets/bootstrap.css
// However, it currently only has styles for top placement

// TODO: doesnt work in header

const styles = {
  // Does the work of .rc-tooltip and .rc-tooltip-placement-*
  tooltip: {
    position: 'absolute',
    // TODO: zIndex 1070 may or may not be the right zIndex for us
    zIndex: 1070,
    display: 'block',
    visibility: 'visible',
    fontSize: 12,
    lineHeight: 1.5,
    opacity: 0.9,

    // placement-top
    padding: '5px 0 9px 0'
  }
};

// Positions the arrow in the tooltip. Does the work of .rc-tooltip-arrow and
// .rc-tooltip-placement-*
const ArrowContent = () => (
  <div
    style={{
      position: 'absolute',
      width: 0,
      height: 0,
      borderColor: 'transparent',
      borderStyle: 'solid',

      // placement-top
      bottom: 4,
      marginLeft: -5,
      borderWidth: '5px 5px 0',
      borderTopColor: '#373737',
      left: '50%'
    }}
  />
);

// Styling for the content of the tooltip. Does the work of .rc-tooltip-inner.
const Overlay = ({children}) => (
  <div
    style={{
      padding: '8px 10px',
      color: '#fff',
      textAlign: 'left',
      textDecoration: 'none',
      backgroundColor: '#373737',
      borderRadius: 6,
      boxShadow: '0 0 4px rgba(0,0,0,0.17)',
      minHeight: 34,
    }}
  >
    {children}
  </div>
);
Overlay.propTypes = {
  children: PropTypes.element.isRequired,
};

export default class ToolTip extends Component {
  static propTypes = {
    // Adding support for other placements will mean more flexible styles
    placement: PropTypes.oneOf(['top']),
    // can be used with aria-describedby on child for a11y
    id: PropTypes.string,
    overlay: PropTypes.node.isRequired,
    children: PropTypes.element.isRequired,
  };

  render() {
    const placement = this.props.placement || "top";

    const overlay = (
      <Overlay>
        {this.props.overlay}
      </Overlay>
    );

    // Note: destroyTooltipOnHide doesn't actually work in current versions
    return (
      <RCTooltip
        overlayStyle={styles.tooltip}
        arrowContent={<ArrowContent/>}
        placement={placement}
        overlay={overlay}
        id={this.props.id}
        mouseLeaveDelay={0}
        destroyTooltipOnHide={true}
      >
        {this.props.children}
      </RCTooltip>
    );
  }
}
