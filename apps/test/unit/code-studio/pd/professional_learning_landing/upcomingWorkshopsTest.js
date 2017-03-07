import React from 'react';
import {shallow} from 'enzyme';
import {UpcomingWorkshopsTable} from '@cdo/apps/code-studio/pd/professional_learning_landing/upcomingWorkshops';
import {expect} from 'chai';
import ReactTestUtils from 'react-addons-test-utils';

describe("Tests for the upcoming workshops page", () => {
  const workshops = [
    {
      id: 1,
      sessions: [],
      location_name: 'My house',
      location_address: '123 Fake Street',
      workshop_type: 'workshopType',
      course: 'course',
      subject: 'subject',
      enrolled_teacher_count: 10,
      capacity: 15,
      facilitators: [],
      organizer: {name: 'organizer_name', email: 'organizer_email'},
      enrollment_code: 'code1'
    },
    {
      id: 2,
      sessions: [],
      location_name: 'My house',
      location_address: '123 Fake Street',
      workshop_type: 'workshopType',
      course: 'course',
      subject: 'subject',
      enrolled_teacher_count: 10,
      capacity: 15,
      facilitators: [],
      organizer: {name: 'organizer_name', email: 'organizer_email'},
      enrollment_code: 'code2'
    },
    {
      id: 3,
      sessions: [],
      location_name: 'My house',
      location_address: '123 Fake Street',
      workshop_type: 'workshopType',
      course: 'course',
      subject: 'subject',
      enrolled_teacher_count: 10,
      capacity: 15,
      facilitators: [],
      organizer: {name: 'organizer_name', email: 'organizer_email'},
      enrollment_code: ''
    }
  ];

  it("Clicking cancel enrollment cancels the enrollment", () => {
    const upcomingWorkshopsTable = shallow(
      <UpcomingWorkshopsTable
        workshops={workshops}
      />
    );

    // We expect there to be a table with 3 rows in the body, two of which have buttons
    expect(upcomingWorkshopsTable.find('tbody tr')).to.have.length(3);
    expect(upcomingWorkshopsTable.find('tbody tr Button')).to.have.length(2);
    expect(upcomingWorkshopsTable.state('showCancelModal')).to.be.false;
    expect(upcomingWorkshopsTable.state('enrollmentCodeToCancel')).to.equal(undefined);

    // Pushing the button should bring up the modal
    upcomingWorkshopsTable.find('tbody tr Button').first().simulate('click');
    expect(upcomingWorkshopsTable.state('showCancelModal')).to.be.true;
    expect(upcomingWorkshopsTable.state('enrollmentCodeToCancel')).to.equal('code1');
  });
});
