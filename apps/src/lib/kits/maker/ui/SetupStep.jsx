import React, {Component, PropTypes} from 'react';
import color from '../../../../util/color';
import FontAwesome from '../../../../templates/FontAwesome';

export const HIDDEN = 'HIDDEN';
export const WAITING = 'WAITING';
export const ATTEMPTING = 'ATTEMPTING';
export const SUCCEEDED = 'SUCCEEDED';
export const FAILED = 'FAILED';
export const CELEBRATING = 'CELEBRATING';
const STEP_STATUSES = [HIDDEN, WAITING, ATTEMPTING, SUCCEEDED, FAILED, CELEBRATING];

const style = {
  root: {
    margin: '15px 0',
  },
  header: {
    'fontSize': '26px',
  },
  body: {
    margin: '15px 0 15px 40px',
    fontSize: '14px',
  }
};

export default class SetupStep extends Component {
  render() {
    const {stepName, stepStatus, children} = this.props;
    if (stepStatus === HIDDEN) {
      return null;
    }
    return (
      <div style={style.root}>
        <div style={{...style.header, ...styleFor(stepStatus)}}>
          {iconFor(stepStatus)}
          <span>{stepName}</span>
        </div>
        {stepStatus === FAILED &&
        <div style={style.body}>
          {children}
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

/**
 * @param {string} stepStatus
 * @returns {object}
 */
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

/**
 * @param {string} stepStatus
 * @returns {FontAwesome}
 */
function iconFor(stepStatus) {
  const iconStyle = {
    marginRight: 6,
  };
  switch (stepStatus) {
    case WAITING:
      return <FontAwesome icon="clock-o" className="fa-fw" style={iconStyle}/>;
    case ATTEMPTING:
      return <FontAwesome icon="spinner" className="fa-fw fa-spin" style={iconStyle}/>;
    case SUCCEEDED:
      return <FontAwesome icon="check-circle" className="fa-fw" style={iconStyle}/>;
    case CELEBRATING:
      return <FontAwesome icon="thumbs-o-up" className="fa-fw" style={iconStyle}/>;
    case FAILED:
      return <FontAwesome icon="times-circle" className="fa-fw" style={iconStyle}/>;
    default:
      throw new Error('Unknown step status.');
  }
}
