import React from 'react';
import {render, screen} from '@testing-library/react';
import EnrollmentUnitAssignment from '@cdo/apps/code-studio/pd/professional_learning_landing/plcElements/EnrollmentUnitAssignment';
import {expect} from 'chai';

const DEFAULT_PROPS = {
  courseUnitData: {
    moduleAssignments: [
      {category: 'new', status: 'first'},
      {category: 'new', status: 'second'},
      {category: 'new', status: 'third'},
    ],
    unitName: 'Unit Name',
    status: 'in_progress',
    link: 'mylink',
  },
};

describe('Enrollment unit assignment', () => {
  function renderDefault(propOverrides = {}) {
    render(<EnrollmentUnitAssignment {...DEFAULT_PROPS} {...propOverrides} />);
  }

  it('Renders module assignments if the unit has been started', () => {
    renderDefault();
    expect(screen.getAllByText('new').length).to.equal(3);
  });

  it("Renders 'coming soon' if the unit has not been started", () => {
    renderDefault({
      courseUnitData: {
        moduleAssignments: [{}, {}, {}],
        unitName: 'Unit Name',
        status: 'start_blocked',
        link: 'mylink',
      },
    });
    expect(screen.queryByText('new')).to.be.null;
    expect(screen.getAllByText('Coming soon!')).to.exist;
  });
});
