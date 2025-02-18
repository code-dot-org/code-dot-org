import {render, screen, fireEvent, within} from '@testing-library/react';
import _ from 'lodash';
import React from 'react';
import {Provider} from 'react-redux';
import {BrowserRouter as Router} from 'react-router-dom';

import {
  getApplicationStatuses,
  ScholarshipStatusRequiredStatuses,
} from '@cdo/apps/code-studio/pd/application_dashboard/constants';
import {DetailViewContents} from '@cdo/apps/code-studio/pd/application_dashboard/detail_view_contents';
import {PrincipalApprovalState} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {getStore, restoreRedux, stubRedux} from '@cdo/apps/redux';

import {allowConsoleWarnings} from '../../../../util/testUtils';

describe('DetailViewContents', () => {
  allowConsoleWarnings();
  let store;

  beforeEach(() => {
    stubRedux();
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
  });

  const DEFAULT_APPLICATION_DATA = {
    regionalPartner: 'partner',
    notes: 'notes',
    status: 'accepted',
    school_name: 'School Name',
    district_name: 'District Name',
    email: 'email',
    application_year: '2019-2020',
    course_name: 'CS Discoveries',
    course: 'csd',
    form_data: {
      firstName: 'First Name',
      lastName: 'Last Name',
      title: 'Title',
      phone: 'Phone',
      preferredFirstName: 'Preferred First Name',
      accountEmail: 'accountEmail',
      alternateEmail: 'alternateEmail',
      program: 'program',
      abilityToMeetRequirements: '10',
      committed: 'Yes',
      taughtInPast: 'No',
    },
    response_scores: {
      meets_minimum_criteria_scores: {
        committed: 'Yes',
      },
      bonus_points_scores: {
        committed: 5,
        question_1: 5,
        question_2: 5,
        question_3: 5,
        question_4: 5,
        question_5: 5,
      },
      meets_scholarship_criteria_scores: {
        principal_approval: 'Yes',
      },
    },
    school_stats: {},
  };

  const DEFAULT_PROPS = {
    canLock: true,
    applicationId: '1',
    applicationData: DEFAULT_APPLICATION_DATA,
    isWorkshopAdmin: false,
  };

  // Nobody is able to set an application status to incomplete or to awaiting_admin_approval from detail view
  const getSelectableApplicationStatuses = (addAutoEmail = true) =>
    _.omit(getApplicationStatuses(addAutoEmail), [
      'incomplete',
      'awaiting_admin_approval',
      'enrolled',
    ]);

  function renderDefault(overrideProps = {}) {
    render(
      <Router>
        <Provider store={store}>
          <DetailViewContents {...DEFAULT_PROPS} {...overrideProps} />
        </Provider>
      </Router>
    );
  }

  describe('Notes', () => {
    it('Does not supply value for teacher applications with no notes', () => {
      const overrideProps = {
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          notes: '',
        },
      };
      renderDefault(overrideProps);

      expect(screen.getAllByDisplayValue('')[0].id).toEqual('notes');
    });
  });

  describe('Edit controls in Teacher', () => {
    it("cannot change status if application is currently in 'Awaiting Admin Approval'", () => {
      const overrideProps = {
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          status: 'awaiting_admin_approval',
        },
      };
      renderDefault(overrideProps);

      const statusDropdowns = screen.getAllByDisplayValue(
        'Awaiting Admin Approval'
      );
      statusDropdowns.forEach(statusDropdown => {
        expect(statusDropdown.disabled).toBeTruthy();
      });
    });

    it("cannot make status 'Awaiting Admin Approval' from dropdown", () => {
      renderDefault();

      const statusDropdowns = screen.getAllByDisplayValue('Accepted');
      statusDropdowns.forEach(statusDropdown => {
        expect(
          within(statusDropdown).queryByText('Awaiting Admin Approval')
        ).toBeNull();
      });
    });

    it("cannot make status 'Incomplete' from dropdown", () => {
      renderDefault();

      const statusDropdowns = screen.getAllByDisplayValue('Accepted');
      statusDropdowns.forEach(statusDropdown => {
        expect(within(statusDropdown).queryByText('Incomplete')).toBeNull();
      });
    });

    it('incomplete status is in dropdown if teacher application is incomplete', () => {
      const overrideProps = {
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          status: 'incomplete',
          scholarship_status: null,
          update_emails_sent_by_system: false,
        },
      };
      renderDefault(overrideProps);

      const statusDropdowns = screen.getAllByDisplayValue('Incomplete');
      expect(statusDropdowns.length).toBe(2);
      statusDropdowns.forEach(statusDropdown => {
        within(statusDropdown).queryByText('Incomplete');
      });
    });

    it('changelog logs all possible status changes', () => {
      let status_change_log = [];

      // Get logs for changing through possible status
      Object.keys(getSelectableApplicationStatuses()).forEach(status => {
        status_change_log.push({
          changing_user: 'Test use',
          time: '2018-06-01 12:00 PDT',
          title: status,
        });
      });

      // Check that recorded change logs are rendered in ChangeLog element
      const overrideProps = {
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          status_change_log: status_change_log,
        },
      };
      renderDefault(overrideProps);

      Object.keys(getSelectableApplicationStatuses()).forEach(status => {
        screen.getByText(status);
      });
    });
  });

  describe('Admin edit dropdown', () => {
    it('Is not visible to regional partners', () => {
      const overrideProps = {
        isWorkshopAdmin: false,
      };
      renderDefault(overrideProps);

      expect(screen.queryByLabelText('Edit')).toBeNull();
      expect(screen.queryByText('(Admin) Edit Form Data')).toBeNull();
      expect(screen.queryByText('Delete Application')).toBeNull();
    });

    it('Is visible to admins', () => {
      const overrideProps = {
        isWorkshopAdmin: true,
      };
      renderDefault(overrideProps);

      expect(screen.getAllByLabelText('Edit').length).toBe(2);
      expect(screen.getAllByText('(Admin) Edit Form Data').length).toBe(2);
      expect(screen.getAllByText('Delete Application').length).toBe(2);
    });
  });

  describe('Edit controls behavior', () => {
    it('the dropdown is disabled until the Edit button is clicked in Teacher Application', () => {
      renderDefault();

      // Dropdowns and notes are disabled before Edit button is clicked
      screen.getAllByDisplayValue('Accepted').forEach(dropdown => {
        expect(dropdown.disabled).toBeTruthy();
      });
      expect(screen.getByDisplayValue('notes').disabled).toBeTruthy();

      // Dropdowns and notes are enabled after Edit button is clicked
      fireEvent.click(screen.getAllByText('Edit')[0]);
      screen.getAllByDisplayValue('Accepted').forEach(dropdown => {
        expect(!dropdown.disabled).toBeTruthy();
      });
      expect(!screen.getByDisplayValue('notes').disabled).toBeTruthy();

      // Dropdowns and notes are disabled after Cancel or Save button is clicked
      fireEvent.click(screen.getAllByText('Cancel')[0]);
      screen.getAllByDisplayValue('Accepted').forEach(dropdown => {
        expect(dropdown.disabled).toBeTruthy();
      });
      expect(screen.getByDisplayValue('notes').disabled).toBeTruthy();
    });
  });

  describe('Principal Approvals', () => {
    it(`Shows principal responses if approval is complete`, () => {
      renderDefault();

      screen.getByText('Administrator Approval and School Information');
    });

    it(`Shows URL to principal approval if sent and incomplete`, () => {
      const guid = '1020304';
      const overrideProps = {
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          application_guid: guid,
          principal_approval_state: PrincipalApprovalState.inProgress,
        },
      };
      renderDefault(overrideProps);

      expect(
        screen
          .getAllByRole('link')[1]
          .href.includes(`/pd/application/principal_approval/${guid}`)
      ).toBeTruthy();
    });

    it(`Shows complete text for principal approval if complete`, () => {
      const guid = '1020305';
      const overrideProps = {
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          application_guid: guid,
          principal_approval_state: PrincipalApprovalState.complete,
        },
      };
      renderDefault(overrideProps);

      screen.getByText(PrincipalApprovalState.complete.trim());
    });

    it(`Shows button to make principal approval required if not`, () => {
      const overrideProps = {
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          principal_approval_not_required: true,
        },
      };
      renderDefault(overrideProps);

      screen.getByRole('button', {name: 'Make required'});
    });

    it(`Shows button to make principal approval not required if it is`, () => {
      const overrideProps = {
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          principal_approval_not_required: null, // principal approval is required
        },
      };
      renderDefault(overrideProps);

      screen.getByRole('button', {name: 'Make not required'});
    });

    it(`Shows button to resend admin email if status is awaiting_admin_approval and it is allowed to be resent`, () => {
      const overrideProps = {
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          principal_approval_state: PrincipalApprovalState.inProgress,
          allow_sending_principal_email: true,
          status: 'awaiting_admin_approval',
        },
      };
      renderDefault(overrideProps);

      screen.getByRole('button', {name: 'Resend request'});
    });

    it(`Does not show button to resend admin email if status is awaiting_admin_approval but is not allowed to be resent`, () => {
      const overrideProps = {
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          principal_approval_state: PrincipalApprovalState.inProgress,
          allow_sending_principal_email: false,
          status: 'awaiting_admin_approval',
        },
      };
      renderDefault(overrideProps);

      expect(screen.queryByRole('button', {name: 'Resend request'})).toBeNull();
    });

    it(`Does not show button to resend admin email if is allowed to be resent but status is pending`, () => {
      const overrideProps = {
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          principal_approval_state: PrincipalApprovalState.inProgress,
          allow_sending_principal_email: true,
          status: 'pending',
        },
      };
      renderDefault(overrideProps);

      expect(screen.queryByRole('button', {name: 'Resend request'})).toBeNull();
    });
  });

  describe('Regional Partner View', () => {
    it('has delete button', () => {
      const overrideProps = {
        isWorkshopAdmin: false,
      };
      renderDefault(overrideProps);

      expect(screen.getAllByText('Delete').length).toBe(2);
    });
  });

  describe('Scholarship Teacher? row', () => {
    it('on teacher applications', () => {
      const overrideProps = {
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          scholarship_status: 'no',
        },
        isWorkshopAdmin: true,
        regionalPartners: [{id: 1, name: 'test'}],
      };
      renderDefault(overrideProps);

      const selectDropdown =
        screen.getByText('No, paid teacher').parentElement.parentElement
          .parentElement.parentElement;

      // Dropdown is disabled
      expect(selectDropdown.classList.contains('is-disabled')).toBeTruthy();

      // Click "Edit"
      fireEvent.click(screen.getAllByText('Edit')[0]);

      // Dropdown is no longer disabled
      expect(!selectDropdown.classList.contains('is-disabled')).toBeTruthy();

      // Click "Cancel"
      fireEvent.click(screen.getAllByText('Cancel')[0]);

      // Dropdown is disabled
      expect(selectDropdown.classList.contains('is-disabled')).toBeTruthy();
    });
  });

  describe('Teacher application scholarship status', () => {
    it('appends auto email text if set to true', () => {
      const overrideProps = {
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          status: 'unreviewed',
          scholarship_status: null,
          update_emails_sent_by_system: true,
        },
      };
      renderDefault(overrideProps);

      expect(screen.getAllByText('Accepted (auto-email)').length).toBe(2);
      expect(screen.getAllByText('Declined (auto-email)').length).toBe(2);
    });

    it('does not append auto email text if set to false', () => {
      const overrideProps = {
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          status: 'unreviewed',
          scholarship_status: null,
          update_emails_sent_by_system: false,
        },
      };
      renderDefault(overrideProps);

      expect(screen.queryAllByText('Accepted (auto-email)').length).toBe(0);
      expect(screen.queryAllByText('Declined (auto-email)').length).toBe(0);
      expect(screen.getAllByText('Accepted').length).toBe(2);
      expect(screen.getAllByText('Declined').length).toBe(2);
    });

    it(`is required in order to set application status to accepted`, () => {
      const overrideProps = {
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          status: 'unreviewed',
          scholarship_status: null,
          update_emails_sent_by_system: false,
        },
      };
      renderDefault(overrideProps);

      // Ensure application status is 'Unreviewed' and scholarship status is null (showing default "Select..." value)
      expect(!isModalShowing()).toBeTruthy();
      screen.getByText('Select...');
      expect(screen.getAllByDisplayValue('Unreviewed').length).toBe(2);

      // Attempt to change application status without updating scholarship status, resulting in modal that instructs
      // the user to set the scholarship status first
      clickEditButton();
      setApplicationStatusTo('Unreviewed', 'accepted');
      expect(isModalShowing()).toBeTruthy();
    });

    for (const applicationStatus of _.difference(
      Object.keys(getSelectableApplicationStatuses()),
      ScholarshipStatusRequiredStatuses
    )) {
      it(`is not required to set application status to ${applicationStatus}`, () => {
        const overrideProps = {
          applicationData: {
            ...DEFAULT_APPLICATION_DATA,
            status: 'unreviewed',
            scholarship_status: null,
            update_emails_sent_by_system: false,
          },
        };
        renderDefault(overrideProps);

        // Ensure application status is 'Unreviewed' and scholarship status is null (showing default "Select..." value)
        expect(!isModalShowing()).toBeTruthy();
        screen.getByText('Select...');
        expect(screen.getAllByDisplayValue('Unreviewed').length).toBe(2);

        // Change application status without updating scholarship status, and ensure that no modal pops up
        clickEditButton();
        setApplicationStatusTo('Unreviewed', applicationStatus);
        expect(!isModalShowing()).toBeTruthy();

        // Check that status successfully updated
        const statusDisplayValue = getApplicationStatuses()[applicationStatus];
        expect(screen.getAllByDisplayValue(statusDisplayValue).length).toBe(2);
      });
    }

    function clickEditButton() {
      fireEvent.click(screen.getAllByText('Edit')[0]);
    }

    function setApplicationStatusTo(currentStatus, newStatus) {
      const applicationDropdown = screen.getAllByDisplayValue(currentStatus)[0];
      fireEvent.change(applicationDropdown, {target: {value: newStatus}});
    }

    function isModalShowing() {
      return screen.queryAllByText('Cannot save applicant status').length > 0;
    }
  });
});
