import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import msg from '@cdo/locale';

/**
 * A button for toggling the collapse state of instructions in CSF
 */
class CollapserButton extends Component {
  static propTypes = {
    style: PropTypes.object,
    isRtl: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    collapsed: PropTypes.bool.isRequired,
    collapseIcon: PropTypes.node,
    expandIcon: PropTypes.node,
  };

  render() {
    // for most tutorials, we use a simple FontAwesome chevron icon for
    // the toggle; for minecraft, we have a custom asset.

    return (
      <div style={{padding: '0 5px', width: 100}}>
        <MuiButton
          id="toggleButton"
          type="button"
          variant="outlined"
          color="secondary"
          size="medium"
          style={{width: 90}}
          onClick={this.props.onClick}
          startIcon={
            this.props.collapsed
              ? this.props.expandIcon ?? (
                  <FontAwesomeV6Icon iconName="circle-chevron-down" />
                )
              : this.props.collapseIcon ?? (
                  <FontAwesomeV6Icon iconName="circle-chevron-up" />
                )
          }
        >
          {this.props.collapsed ? msg.more() : msg.less()}
        </MuiButton>
      </div>
    );
  }
}

export default CollapserButton;
