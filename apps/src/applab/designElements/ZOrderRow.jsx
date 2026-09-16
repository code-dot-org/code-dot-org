import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Box,
  IconButton as MuiIconButton,
  Typography as MuiTypography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import applabMsg from '@cdo/applab/locale';

import * as rowStyle from './rowStyle';

export default class ZOrderRow extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    onDepthChange: PropTypes.func.isRequired,
  };

  render() {
    const element = this.props.element;

    // Element will be wrapped in a resizable div
    const outerElement = element.parentNode;
    const index = Array.prototype.indexOf.call(
      outerElement.parentNode.children,
      outerElement
    );
    const isBackMost = index === 0;
    const isFrontMost = index + 1 === outerElement.parentNode.children.length;

    return (
      <Box
        style={{
          ...rowStyle.container,
          flexDirection: 'column',
        }}
        sx={{
          gap: 0.5,
        }}
      >
        <MuiTypography variant="label3">
          {applabMsg.designElementProperty_zOrder()}
        </MuiTypography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 1,
          }}
        >
          <MuiIconButton
            variant="outlined"
            color="secondary"
            size="small"
            onClick={this.props.onDepthChange.bind(this, element, 'toBack')}
            disabled={isBackMost}
            title={applabMsg.designElementProperty_zOrder_backButton()}
          >
            <FontAwesomeV6Icon iconName="angles-left" iconStyle="solid" />
          </MuiIconButton>
          <MuiIconButton
            variant="outlined"
            color="secondary"
            size="small"
            onClick={this.props.onDepthChange.bind(this, element, 'backward')}
            disabled={isBackMost}
            title={applabMsg.designElementProperty_zOrder_backwardButton()}
          >
            <FontAwesomeV6Icon iconName="angle-left" iconStyle="solid" />
          </MuiIconButton>
          <MuiIconButton
            variant="outlined"
            color="secondary"
            size="small"
            onClick={this.props.onDepthChange.bind(this, element, 'forward')}
            disabled={isFrontMost}
            title={applabMsg.designElementProperty_zOrder_forwardButton()}
          >
            <FontAwesomeV6Icon iconName="angle-right" iconStyle="solid" />
          </MuiIconButton>
          <MuiIconButton
            variant="outlined"
            color="secondary"
            size="small"
            onClick={this.props.onDepthChange.bind(this, element, 'toFront')}
            disabled={isFrontMost}
            title={applabMsg.designElementProperty_zOrder_frontButton()}
          >
            <FontAwesomeV6Icon iconName="angles-right" iconStyle="solid" />
          </MuiIconButton>
        </Box>
      </Box>
    );
  }
}
