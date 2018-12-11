import React from 'react';
import {shallow} from 'enzyme';
import {EnrolledWorkshopsTable} from '@cdo/apps/code-studio/pd/professional_learning_landing/EnrolledWorkshops';
import {expect} from 'chai';

describe("Tests for the upcoming workshops page", () => {
  const workshops = [
    {
      id: 1,
      sessions: [],
      location_name: 'My house',
      location_address: '123 Fake Street',
      on_map: false,
      funded: false,
      workshop_type: 'workshopType',
      course: 'course',
      subject: 'subject',
      enrolled_teacher_count: 10,
      capacity: 15,
      facilitators: [],
      organizer: {name: 'organizer_name', email: 'organizer_email'},
      enrollment_code: 'code1',
      state: 'Not Started'
    },
    {
      id: 2,
      sessions: [],
      location_name: 'My house',
      location_address: '123 Fake Street',
      on_map: false,
      funded: false,
      workshop_type: 'workshopType',
      course: 'course',
      subject: 'subject',
      enrolled_teacher_count: 10,
      capacity: 15,
      facilitators: [],
      organizer: {name: 'organizer_name', email: 'organizer_email'},
      enrollment_code: 'code2',
      state: 'In Progress'
    },
    {
      id: 3,
      sessions: [],
      location_name: 'My house',
      location_address: '123 Fake Street',
      on_map: false,
      funded: false,
      workshop_type: 'workshopType',
      course: 'course',
      subject: 'subject',
      enrolled_teacher_count: 10,
      capacity: 15,
      facilitators: [],
      organizer: {name: 'organizer_name', email: 'organizer_email'},
      enrollment_code: 'code3',
      state: 'Ended'
    }
  ];

  it("Clicking cancel enrollment cancels the enrollment", () => {
    const enrolledWorkshopsTable = shallow(
      <EnrolledWorkshopsTable
        workshops={workshops}
      />
    );

    // We expect there to be a table with 3 rows in the body, two of which have two buttons
    expect(enrolledWorkshopsTable.find('tbody tr')).to.have.length(3);
    expect(enrolledWorkshopsTable.find('tbody tr Button')).to.have.length(5);
    expect(enrolledWorkshopsTable.state('showCancelModal')).to.be.false;
    expect(enrolledWorkshopsTable.state('enrollmentCodeToCancel')).to.equal(undefined);

    // Pushing the button should bring up the modal
    enrolledWorkshopsTable.find('tbody tr Button').first().simulate('click');
    expect(enrolledWorkshopsTable.state('showCancelModal')).to.be.true;
    expect(enrolledWorkshopsTable.state('enrollmentCodeToCancel')).to.equal('code1');
  });
});
