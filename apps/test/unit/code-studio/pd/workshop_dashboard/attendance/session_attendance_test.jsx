import {expect} from '../../../../../util/configuredChai';
import {mount} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import {SessionAttendance} from '@cdo/apps/code-studio/pd/workshop_dashboard/attendance/session_attendance';
import Spinner from "@cdo/apps/code-studio/pd/components/spinner";
import {COURSE_CSF} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshopConstants';
import Permission from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';

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
  enrollmentCount: 25
};
const FAKE_API_RESPONSE = {
  session: {
    id: FAKE_SESSION_ID,
    start: "2017-10-07T09:00:00.000Z",
    end: "2017-10-07T17:00:00.000Z",
    code: null,
    'show_link?': false,
    attendance_count: 17
  },
  attendance: [
    {
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
      enrollment_id: 47564,
      user_id: 101,
      verified_teacher_account: true,
      attended: true,
      puzzles_completed: 60
    },
    {
      first_name: "Adele",
      last_name: "Goldberg",
      email: "adele@example.com",
      enrollment_id: 47567,
      user_id: 102,
      verified_teacher_account: true,
      attended: true,
      puzzles_completed: 171
    },
    {
      first_name: "Grace",
      last_name: "Hopper",
      email: "grace@example.com",
      enrollment_id: 47570,
      user_id: 103,
      verified_teacher_account: true,
      attended: true,
      puzzles_completed: 365
    }
  ]
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
        JSON.stringify(FAKE_API_RESPONSE)
      ]
    );
  });

  afterEach(() => {
    server.restore();
  });

  it('renders', () => {
    const wrapper = mount(
      <SessionAttendance {...DEFAULT_PROPS}/>
    );

    // Displays a spinner at first while it waits for the server to provide
    // attendance data.
    expect(wrapper).to.containMatchingElement(
      <Spinner/>
    );
    expect(server.requests).to.have.length(1);


    // After the server responds
    server.respond();
    // Has expected columns:
    expect(wrapper).to.containMatchingElement(
      <thead>
        <tr>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Email</th>
          <th>Verified Teacher Account</th>
          <th>Present</th>
        </tr>
      </thead>
    );

    // Has three rows:
    expect(wrapper.find('tbody tr')).to.have.length(3);

    wrapper.unmount();
  });

  it('includes a "Code Studio Account" column if account is required', () => {
    const wrapper = mount(
      <SessionAttendance
        {...DEFAULT_PROPS}
        accountRequiredForAttendance={true}
      />
    );

    // After the server responds
    server.respond();
    // Has expected columns:
    expect(wrapper).to.containMatchingElement(
      <thead>
      <tr>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Email</th>
        <th>Code Studio Account</th>
        <th>Verified Teacher Account</th>
        <th>Present</th>
      </tr>
      </thead>
    );

    wrapper.unmount();
  });

  it('includes "Puzzles Completed" and "Attended" columns if course is CSF', () => {
    const wrapper = mount(
      <SessionAttendance
        {...DEFAULT_PROPS}
        course={COURSE_CSF}
      />
    );

    // After the server responds
    server.respond();
    // Has expected columns:
    expect(wrapper).to.containMatchingElement(
      <thead>
      <tr>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Email</th>
        <th>Verified Teacher Account</th>
        <th>Puzzles Completed</th>
        <th>Attended</th>
      </tr>
      </thead>
    );

    wrapper.unmount();
  });
});
