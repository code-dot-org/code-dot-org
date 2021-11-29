import React from 'react';
import {shallow} from 'enzyme';
import EnrollmentUnitAssignment from '@cdo/apps/code-studio/pd/professional_learning_landing/plcElements/EnrollmentUnitAssignment';
import {expect} from 'chai';

describe('Enrollment unit assignment', () => {
  it('Renders module assignments if the unit has been started', () => {
    const enrollmentUnitAssignment = shallow(
      <EnrollmentUnitAssignment
        courseUnitData={{
          moduleAssignments: [{}, {}, {}],
          unitName: 'Unit Name',
          status: 'in_progress'
        }}
      />
    );

    expect(enrollmentUnitAssignment.find('ModuleAssignment').length).to.equal(
      3
    );
  });

  it("Renders 'coming soon' if the unit has not been started", () => {
    const enrollmentUnitAssignment = shallow(
      <EnrollmentUnitAssignment
        courseUnitData={{
          moduleAssignments: [{}, {}, {}],
          unitName: 'Unit Name',
          status: 'start_blocked'
        }}
      />
    );

    expect(enrollmentUnitAssignment.find('ModuleAssignment')).to.be.empty;
    expect(enrollmentUnitAssignment.find('div > div').text()).to.equal(
      'Coming soon!'
    );
  });
});
