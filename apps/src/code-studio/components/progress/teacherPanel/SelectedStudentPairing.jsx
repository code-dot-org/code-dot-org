import PropTypes from 'prop-types';
import React from 'react';

import Tooltip from '@cdo/apps/templates/Tooltip';
import i18n from '@cdo/locale';

// Render a string and possibly a tooltip that describes the student's
// partners. This method should only be called when the student is in a
// pairing group. The length of partnerNames is typically equal to
// partnerCount but the length of partnerNames can be less than
// partnerCount if a partner's user account and/or progress was deleted.
const SelectedStudentPairing = ({partnerNames, partnerCount}) => {
  const renderPartners = () => {
    // Three cases:
    // - no known partners: "3 other students"
    // - exactly one known partner: "Student name"
    // - all other cases: "Student name + 2" (with tooltip listing all known names)
    if (partnerNames.length === 0) {
      return <div>{i18n.otherStudents({count: partnerCount})}</div>;
    } else if (partnerNames.length === 1 && partnerCount === 1) {
      return <div>{partnerNames[0]}</div>;
    } else {
      let tooltipText = partnerNames.join(', ');
      const unknownPartnersCount = partnerCount - partnerNames.length;
      if (unknownPartnersCount > 0) {
        tooltipText +=
          ' + ' + i18n.otherStudents({count: unknownPartnersCount});
      }

      return (
        <Tooltip text={tooltipText} place="bottom">
          <div>{partnerNames[0] + ' + ' + (partnerCount - 1)}</div>
        </Tooltip>
      );
    }
  };

  return (
    <div>
      <div>{i18n.workedWith()}</div>
      {renderPartners()}
    </div>
  );
};

SelectedStudentPairing.propTypes = {
  partnerNames: PropTypes.array,
  partnerCount: PropTypes.number,
};

export default SelectedStudentPairing;
