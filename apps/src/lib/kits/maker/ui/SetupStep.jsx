import React, {Component, PropTypes} from 'react';
import color from '../../../../util/color';

export const HIDDEN = 'HIDDEN';
export const WAITING = 'WAITING';
export const ATTEMPTING = 'ATTEMPTING';
export const SUCCEEDED = 'SUCCEEDED';
export const FAILED = 'FAILED';
export const CELEBRATING = 'CELEBRATING';
const STEP_STATUSES = [HIDDEN, WAITING, ATTEMPTING, SUCCEEDED, FAILED, CELEBRATING];

export default class SetupStep extends Component {
  render() {
    if (this.props.stepStatus === HIDDEN) {
      return null;
    }
    const rootStyle = {
      margin: '15px 0',
    };
    const headerStyle = Object.assign(
        {'fontSize': '26px'},
        styleFor(this.props.stepStatus));
    const iconStyle = {
      marginRight: 6,
    };
    const bodyStyle = {
      margin: '15px 0 15px 40px',
      fontSize: '14px',
    };
    return (
      <div style={rootStyle}>
        <div style={headerStyle}>
          <i style={iconStyle} className={iconFor(this.props.stepStatus)}/>
          <span>{this.props.stepName}</span>
        </div>
        {this.props.stepStatus === FAILED &&
        <div style={bodyStyle}>
          {this.props.children}
        </div>
        }
      </div>
    );
  }
}
SetupStep.propTypes = {
  children: PropTypes.node,
  stepName: PropTypes.string.isRequired,
  stepStatus: PropTypes.oneOf(STEP_STATUSES).isRequired
};

function styleFor(stepStatus) {
  switch (stepStatus) {
    case ATTEMPTING:
    case WAITING:
      return {color: color.light_gray};
    case SUCCEEDED:
    case CELEBRATING:
      return {color: color.realgreen};
    case HIDDEN:
      return {display: 'none'};
    default:
      return {
        color: color.red,
        fontWeight: 'bold'
      };
  }
}

function iconFor(stepStatus) {
  switch (stepStatus) {
    case WAITING:
      return "fa fa-fw fa-clock-o";
    case ATTEMPTING:
      return "fa fa-fw fa-spinner fa-spin";
    case SUCCEEDED:
      return "fa fa-fw fa-check-circle";
    case CELEBRATING:
      return "fa fa-fw fa-thumbs-o-up";
    case FAILED:
      return "fa fa-fw fa-times-circle";
    default:
      throw new Error('Unknown step status.');
  }
}
