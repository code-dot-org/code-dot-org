import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import {SessionAttendance} from '@cdo/apps/code-studio/pd/workshop_dashboard/attendance/session_attendance';
import Permission from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';
import {COURSE_CSF} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshopConstants';

import {expect} from '../../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const FAKE_WORKSHOP_ID = 11;
const FAKE_SESSION_ID = 22;
const FAKE_COURSE_NAME = 'Computer Science Postulates';
const DEFAULT_PROPS = {
  permission: new Permission(),
  workshopId: FAKE_WORKSHOP_ID,
  course: FAKE_COURSE_NAME,
  sessionId: FAKE_SESSION_ID,
  isReadOnly: false,
  onSaving: () => {},
  onSaved: () => {},
  accountRequiredForAttendance: false,
  enrollmentCount: 25,
  scholarshipWorkshop: false,
};
const FAKE_API_RESPONSE = {
  session: {
    id: FAKE_SESSION_ID,
    start: '2017-10-07T09:00:00.000Z',
    end: '2017-10-07T17:00:00.000Z',
    code: null,
    'show_link?': false,
    attendance_count: 17,
  },
  attendance: [
    {
      first_name: 'Ada',
      last_name: 'Lovelace',
      email: 'ada@example.com',
      enrollment_id: 47564,
      user_id: 101,
      verified_teacher_account: true,
      attended: true,
      cdo_scholarship: true,
      other_scholarship: false,
    },
    {
      first_name: 'Adele',
      last_name: 'Goldberg',
      email: 'adele@example.com',
      enrollment_id: 47567,
      user_id: 102,
      verified_teacher_account: true,
      attended: true,
      cdo_scholarship: false,
      other_scholarship: true,
    },
    {
      first_name: 'Grace',
      last_name: 'Hopper',
      email: 'grace@example.com',
      enrollment_id: 47570,
      user_id: 103,
      verified_teacher_account: true,
      attended: true,
      cdo_scholarship: false,
      other_scholarship: false,
    },
  ],
};

describe('SessionAttendance', () => {
  let server;

  beforeEach(() => {
    server = sinon.createFakeServer();
    server.respondWith(
      'GET',
      `/api/v1/pd/workshops/${FAKE_WORKSHOP_ID}/attendance/${FAKE_SESSION_ID}`,
      [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(FAKE_API_RESPONSE),
      ]
    );
  });

  afterEach(() => {
    server.restore();
  });

  it('renders', async () => {
    const wrapper = mount(<SessionAttendance {...DEFAULT_PROPS} />);

    // Displays a spinner at first while it waits for the server to provide
    // attendance data.
    expect(wrapper.containsMatchingElement(<Spinner />)).to.be.ok;
    expect(server.requests).to.have.length(1);

    // After the server responds
    await React.act(() => {
      server.respond();
    });
    wrapper.update();
    // Has expected columns:
    expect(
      wrapper.containsMatchingElement(
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Verified Teacher Account</th>
            <th>Present</th>
          </tr>
        </thead>
      )
    ).to.be.ok;

    // Has three rows:
    expect(wrapper.find('tbody tr')).to.have.length(3);

    wrapper.unmount();
  });

  it('includes "Attended" column if course is CSF', async () => {
    const wrapper = mount(
      <SessionAttendance {...DEFAULT_PROPS} course={COURSE_CSF} />
    );

    // After the server responds
    await React.act(() => {
      server.respond();
    });
    wrapper.update();
    // Has expected columns:
    expect(
      wrapper.containsMatchingElement(
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Verified Teacher Account</th>
            <th>Attended</th>
          </tr>
        </thead>
      )
    ).to.be.ok;

    wrapper.unmount();
  });

  it('includes scholarship columns for scholarship workshops', async () => {
    const wrapper = mount(
      <SessionAttendance {...DEFAULT_PROPS} scholarshipWorkshop={true} />
    );

    // After the server responds
    await React.act(() => server.respond());
    wrapper.update();
    // Has expected columns:
    expect(
      wrapper.containsMatchingElement(
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Verified Teacher Account</th>
            <th>Code.org Scholarship?</th>
            <th>Other Scholarship?</th>
            <th>Present</th>
          </tr>
        </thead>
      )
    ).to.be.ok;

    wrapper.unmount();
  });
});
