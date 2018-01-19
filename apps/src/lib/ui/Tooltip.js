import React, { PropTypes, Component } from 'react';
import RCTooltip from 'rc-tooltip';

// Note: rc-tooltip generally expects classNames to be used for styling. I've
// managed to replicate the styling from node_modules/rc-tooltip/assets/bootstrap.css
// However, it currently only has styles for top placement
// It might be possible to just import the css instead and have it end up in our
// JS bundle, which might end up being a cleaner solution.

const styles = {
  // Does the work of .rc-tooltip
  tooltip: {
    position: 'absolute',
    // TODO: zIndex 1070 may or may not be the right zIndex for us
    zIndex: 1070,
    display: 'block',
    visibility: 'visible',
    fontSize: 12,
    lineHeight: 1.5,
    opacity: 0.9,
  },
  // .rc-tooltip-placement-*
  tooltipPlacement: {
    top: {
      padding: '5px 0 9px 0'
    },
    bottom: {
      padding: '9px 0 5px 0'
    }
  },
  // .rc-tooltip-arrow
  arrowContent: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
  },
  // .rc-tooltip-placement-*
  arrowContentPlacement: {
    top: {
      bottom: 4,
      marginLeft: -5,
      borderWidth: '5px 5px 0',
      borderTopColor: '#373737',
      left: '50%'
    },
    bottom: {
      top: 4,
      marginLeft: -5,
      borderWidth: '0 5px 5px',
      borderBottomColor: '#373737',
      left: '50%'
    }
  }
};

// Positions the arrow in the tooltip.
const ArrowContent = ({placement}) => (
  <div
    style={{
      ...styles.arrowContent,
      ...styles.arrowContentPlacement[placement],
    }}
  />
);
ArrowContent.propTypes = {
  placement: PropTypes.oneOf(['top', 'bottom']),
};

// Styling for the content of the tooltip.
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
    placement: PropTypes.oneOf(['top', 'bottom']),
    // can be used with aria-describedby on child for a11y
    id: PropTypes.string,
    overlay: PropTypes.node.isRequired,
    children: PropTypes.element.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      placement: props.placement || 'top'
    };
  }

  /**
   * This is perhaps slightly hacky, but seems to work. Sometimes when we ask for
   * a particular placement (such as top), we don't have enough room for a tooltip
   * there. The library seems to be smart enough to then flip the placement for us
   * and give us a bottom tip. Because we're doing our styling inlined instead
   * of uses classes, we now need to flip our styling as well.
   */
  onPopupAlign = (node, align) => {
    const match = /rc-tooltip-placement-(.*)$/.exec(node.className);
    if (match) {
      const placement = match[1].trim();
      if (placement !== this.state.placement) {
        this.setState({placement});
      }
    }
  }

  render() {
    const overlay = (
      <Overlay>
        {this.props.overlay}
      </Overlay>
    );

    const { placement } = this.state;

    // Note: destroyTooltipOnHide doesn't actually work in current versions
    return (
      <RCTooltip
        overlayStyle={{
          ...styles.tooltip,
          ...styles.tooltipPlacement[placement]
        }}
        arrowContent={<ArrowContent placement={placement}/>}
        placement={placement}
        overlay={overlay}
        id={this.props.id}
        mouseLeaveDelay={0}
        destroyTooltipOnHide={true}
        onPopupAlign={this.onPopupAlign}
      >
        {this.props.children}
      </RCTooltip>
    );
  }
}
