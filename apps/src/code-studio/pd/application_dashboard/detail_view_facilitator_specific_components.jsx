import React, {PropTypes} from 'react';
import {renderLineItem} from './detail_view';

class Facilitator1819Program extends React.Component {
  static propTypes = {
    planToTeachThisYear1819: PropTypes.string.isRequired,
    rateAbility: PropTypes.string.isRequired,
    canAttendFIT: PropTypes.string.isRequired
  }

  render() {
    return  (
      <div>
        {renderLineItem('planToTeachThisYear1819', this.props.planToTeachThisYear1819)}
        {renderLineItem('rateAbility', this.props.rateAbility)}
        {renderLineItem('canAttendFIT', this.props.canAttendFIT)}
      </div>
    );
  }
}

export {Facilitator1819Program};
