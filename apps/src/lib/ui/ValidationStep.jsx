import React, {Component, PropTypes} from 'react';
import color from '../../util/color';
import FontAwesome from '../../templates/FontAwesome';

export const Status = {
  HIDDEN: 'HIDDEN',
  WAITING: 'WAITING',
  ATTEMPTING: 'ATTEMPTING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  CELEBRATING: 'CELEBRATING',
  UNKNOWN: 'UNKNOWN'
};

const style = {
  root: {
    marginBottom: 15,
    marginTop: 15,
    marginLeft: 0,
    marginRight: 0,
  },
  header: {
    fontSize: 26,
    lineHeight: 'normal',
  },
  body: {
    marginBottom: 15,
    marginTop: 15,
    marginLeft: 40,
    marginRight: 0,
    fontSize: 14,
  },
  icon: {
    float: 'left',
  },
  headerText: {
    marginLeft: 40,
  }
};

export default class ValidationStep extends Component {
  static propTypes = {
    children: PropTypes.node,
    stepName: PropTypes.string.isRequired,
    stepStatus: PropTypes.oneOf(Object.values(Status)).isRequired,
    alwaysShowChildren: PropTypes.bool
  };

  render() {
    const {stepName, stepStatus, alwaysShowChildren, children} = this.props;
    // By default, we only show the children if the step failed. If alwaysShowChildren
    // is set, show them regardless
    let showChildren = alwaysShowChildren || stepStatus === Status.FAILED;

    if (stepStatus === Status.HIDDEN) {
      return null;
    }
    return (
      <div style={style.root}>
        <div style={{...style.header, ...styleFor(stepStatus)}}>
          <div style={style.icon}>{iconFor(stepStatus)}</div>
          <div style={style.headerText}>{stepName}</div>
        </div>
        {showChildren &&
          <div style={style.body}>
            {children}
          </div>
        }
      </div>
    );
  }
}

/**
 * @param {string} stepStatus
 * @returns {object}
 */
function styleFor(stepStatus) {
  switch (stepStatus) {
    case Status.ATTEMPTING:
    case Status.WAITING:
      return {color: color.light_gray};
    case Status.SUCCEEDED:
    case Status.CELEBRATING:
      return {color: color.realgreen};
    case Status.HIDDEN:
      return {display: 'none'};
    case Status.UNKNOWN:
      return {color: color.light_gray};
    default:
      return {
        color: color.red,
        fontWeight: 'bold'
      };
  }
}

/**
 * @param {string} stepStatus
 * @returns {Component}
 */
function iconFor(stepStatus) {
  const iconStyle = {
    marginRight: 6,
  };
  switch (stepStatus) {
    case Status.WAITING:
      return <FontAwesome icon="clock-o" className="fa-fw" style={iconStyle}/>;
    case Status.ATTEMPTING:
      return <FontAwesome icon="spinner" className="fa-fw fa-spin" style={iconStyle}/>;
    case Status.SUCCEEDED:
      return <FontAwesome icon="check-circle" className="fa-fw" style={iconStyle}/>;
    case Status.CELEBRATING:
      return <FontAwesome icon="thumbs-o-up" className="fa-fw" style={iconStyle}/>;
    case Status.FAILED:
      return <FontAwesome icon="times-circle" className="fa-fw" style={iconStyle}/>;
    case Status.UNKNOWN:
      return <FontAwesome icon="question-circle" className="fa-fw" style={iconStyle}/>;
    default:
      throw new Error('Unknown step status.');
  }
}
