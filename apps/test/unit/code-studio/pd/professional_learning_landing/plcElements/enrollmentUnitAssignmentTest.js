import React from 'react';
import {shallow} from 'enzyme';
import EnrollmentUnitAssignment from '@cdo/apps/code-studio/pd/professional_learning_landing/plcElements/enrollmentUnitAssignment';
import {expect} from 'chai';
import { allowConsoleErrors } from '../../../../../util/testUtils';

describe("Enrollment unit assignment", () => {
  allowConsoleErrors();

  it("Renders module assignments if the unit has been started", () => {
    const enrollmentUnitAssignment = shallow(
      <EnrollmentUnitAssignment
        courseUnitData={{
          moduleAssignments: [0, 1, 2],
          unitName: 'Unit Name',
          status: 'in_progress'
        }}
      />
    );

    expect(enrollmentUnitAssignment.find('ModuleAssignment').length).to.equal(3);
  });

  it("Renders 'coming soon' if the unit has not been started", () => {
    const enrollmentUnitAssignment = shallow(
      <EnrollmentUnitAssignment
        courseUnitData={{
          moduleAssignments: [0, 1, 2],
          unitName: 'Unit Name',
          status: 'start_blocked'
        }}
      />
    );

    expect(enrollmentUnitAssignment.find('ModuleAssignment').length).to.be.empty;
    expect(enrollmentUnitAssignment.find('div > div').text()).to.equal('Coming soon!');
  });
});
