import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import SessionAttendanceRow from '@cdo/apps/code-studio/pd/workshop_dashboard/attendance/session_attendance_row';

const FAKE_WORKSHOP_ID = 11;
const FAKE_SESSION_ID = 22;
const FAKE_FIRST_NAME = 'Ford';
const FAKE_LAST_NAME = 'Prefect';
const FAKE_EMAIL = 'ford@example.com';
const DEFAULT_PROPS = {
  workshopId: FAKE_WORKSHOP_ID,
  sessionId: FAKE_SESSION_ID,
  attendance: {
    first_name: FAKE_FIRST_NAME,
    last_name: FAKE_LAST_NAME,
    email: FAKE_EMAIL,
    enrollment_id: 47564,
    user_id: 101,
    verified_teacher_account: false,
    attended: false,
    cdo_scholarship: true,
    other_scholarship: false,
  },
  onSaving: () => {},
  onSaved: () => {},
  accountRequiredForAttendance: false,
  scholarshipWorkshop: false,
  displayYesNoAttendance: false,
};

describe('SessionAttendanceRow', () => {
  it('renders default (unattended) row', () => {
    const wrapper = shallow(<SessionAttendanceRow {...DEFAULT_PROPS} />);
    expect(
      wrapper.containsMatchingElement(
        <tr className={null}>
          <td>{FAKE_FIRST_NAME}</td>
          <td>{FAKE_LAST_NAME}</td>
          <td>{FAKE_EMAIL}</td>
          <td>No</td>
          <td>
            <div>
              <i className="fa fa-square-o" />
            </div>
          </td>
        </tr>
      )
    ).toBeTruthy();
  });

  it('renders attended row', () => {
    const wrapper = shallow(
      <SessionAttendanceRow
        {...DEFAULT_PROPS}
        attendance={{
          ...DEFAULT_PROPS.attendance,
          attended: true,
        }}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <tr className="success">
          <td>{FAKE_FIRST_NAME}</td>
          <td>{FAKE_LAST_NAME}</td>
          <td>{FAKE_EMAIL}</td>
          <td>No</td>
          <td>
            <div>
              <i className="fa fa-check-square-o" />
            </div>
          </td>
        </tr>
      )
    ).toBeTruthy();
  });
});
