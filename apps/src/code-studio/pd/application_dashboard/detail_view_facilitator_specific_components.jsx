import React, {PropTypes} from 'react';
import {renderLineItem} from './detail_view';
import _ from 'lodash';

const lineItemKeys = {
  planToTeachThisYear1819: 'Do you plan on teaching this course in the 2018-19 school year?',
  rateAbility: 'How would you rate your ability to meet the requirements for your focus area?',
  canAttendFIT: 'Can attend FIT Training?'
};

class Facilitator1819Program extends React.Component {
  static propTypes = {
    planToTeachThisYear1819: PropTypes.arrayOf(PropTypes.string.isRequired),
    abilityToMeetRequirements: PropTypes.string.isRequired
  }

  render() {
    return  (
      <div>
        {renderLineItem(lineItemKeys['planToTeachThisYear1819'], _.join(this.props.planToTeachThisYear1819, ','))}
        {renderLineItem(lineItemKeys['rateAbility'], this.props.abilityToMeetRequirements)}
      </div>
    );
  }
}

export {Facilitator1819Program};
