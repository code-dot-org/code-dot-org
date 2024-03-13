import {DetailViewContents} from '@cdo/apps/code-studio/pd/application_dashboard/detail_view_contents';
import {
  getApplicationStatuses,
  ScholarshipStatusRequiredStatuses,
} from '@cdo/apps/code-studio/pd/application_dashboard/constants';
import {PrincipalApprovalState} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import React from 'react';
import {render, screen, fireEvent, within} from '@testing-library/react';
import {Provider} from 'react-redux';
import _ from 'lodash';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import {allowConsoleWarnings} from '../../../../util/testUtils';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import {BrowserRouter as Router} from 'react-router-dom';
import { assert } from 'chai';

describe('DetailViewContents', () => {
  allowConsoleWarnings();
  let store;

  // We aren't testing any of the responses of the workshop selector control, so just
  // have a fake server to handle calls and suppress warnings
  let server;

  beforeEach(() => {
    stubRedux();
    store = getStore();
    server = sinon.fakeServer.create();
  });

  afterEach(() => {
    restoreRedux();
    server.restore();
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

  // const mountDetailView = (overrides = {}) => {
  //   const defaultApplicationData = {
  //     ...DEFAULT_APPLICATION_DATA,
  //   };
  //   const defaultProps = {
  //     canLock: true,
  //     applicationId: '1',
  //     applicationData: defaultApplicationData,
  //     isWorkshopAdmin: false,
  //   };

  //  No-op router context
  //  context = {
  //    router: {
  //      push() {},
  //    },
  //  };

  //   return mount(<DetailViewContents {..._.merge(defaultProps, overrides)} />, {
  //     context,
  //   });
  // };









  // describe('Notes', () => {
  //   it('Does not supply value for teacher applications with no notes', () => {
  //     const overrideProps = {
  //       applicationData: {
  //         ...DEFAULT_APPLICATION_DATA,
  //         notes: '',
  //       },
  //     };
  //     renderDefault(overrideProps);

  //     expect(screen.getAllByDisplayValue('')[0].id).to.eql('notes');
  //   });
  // });

  // describe('Edit controls in Teacher', () => {
  //   it("cannot change status if application is currently in 'Awaiting Admin Approval'", () => {
  //     const overrideProps = {
  //       applicationData: {
  //         ...DEFAULT_APPLICATION_DATA,
  //         status: 'awaiting_admin_approval',
  //       },
  //     };
  //     renderDefault(overrideProps);

  //     const statusDropdowns = screen.getAllByDisplayValue(
  //       'Awaiting Admin Approval'
  //     );
  //     statusDropdowns.forEach(statusDropdown => {
  //       assert(statusDropdown.disabled);
  //     });
  //   });

  //   it("cannot make status 'Awaiting Admin Approval' from dropdown", () => {
  //     renderDefault();

  //     const statusDropdowns = screen.getAllByDisplayValue('Accepted');
  //     statusDropdowns.forEach(statusDropdown => {
  //       expect(within(statusDropdown).queryByText('Awaiting Admin Approval')).to
  //         .be.null;
  //     });
  //   });

  //   it("cannot make status 'Incomplete' from dropdown", () => {
  //     renderDefault();

  //     const statusDropdowns = screen.getAllByDisplayValue('Accepted');
  //     statusDropdowns.forEach(statusDropdown => {
  //       expect(within(statusDropdown).queryByText('Incomplete')).to.be.null;
  //     });
  //   });

  //   it('incomplete status is in dropdown if teacher application is incomplete', () => {
  //     const overrideProps = {
  //       applicationData: {
  //         ...DEFAULT_APPLICATION_DATA,
  //         status: 'incomplete',
  //         scholarship_status: null,
  //         update_emails_sent_by_system: false,
  //       },
  //     };
  //     renderDefault(overrideProps);

  //     const statusDropdowns = screen.getAllByDisplayValue('Incomplete');
  //     expect(statusDropdowns.length).to.equal(2);
  //     statusDropdowns.forEach(statusDropdown => {
  //       within(statusDropdown).queryByText('Incomplete');
  //     });
  //   });

  //   it('changelog logs all possible status changes', () => {
  //     let status_change_log = [];

  //     // get logs for changing through possible status
  //     Object.keys(getSelectableApplicationStatuses()).forEach(status => {
  //       status_change_log.push({
  //         changing_user: 'Test use',
  //         time: '2018-06-01 12:00 PDT',
  //         title: status,
  //       });
  //     });

  //     // check that recorded change logs are rendered in ChangeLog element
  //     const overrideProps = {
  //       applicationData: {
  //         ...DEFAULT_APPLICATION_DATA,
  //         status_change_log: status_change_log,
  //       },
  //     };
  //     renderDefault(overrideProps);

  //     Object.keys(getSelectableApplicationStatuses()).forEach(status => {
  //       screen.getByText(status);
  //     });
  //   });
  // });

  // describe('Admin edit dropdown', () => {
  //   it('Is not visible to regional partners', () => {
  //     const overrideProps = {
  //       isWorkshopAdmin: false,
  //     };
  //     renderDefault(overrideProps);

  //     expect(screen.queryByLabelText('Edit')).to.be.null;
  //     expect(screen.queryByText('(Admin) Edit Form Data')).to.be.null;
  //     expect(screen.queryByText('Delete Application')).to.be.null;
  //   });

  //   it('Is visible to admins', () => {
  //     const overrideProps = {
  //       isWorkshopAdmin: true,
  //     };
  //     renderDefault(overrideProps);

  //     expect(screen.getAllByLabelText('Edit').length).to.equal(2);
  //     expect(screen.getAllByText('(Admin) Edit Form Data').length).to.equal(2);
  //     expect(screen.getAllByText('Delete Application').length).to.equal(2);
  //   });

  // //   it('Edit redirects to edit page', () => {
  // //     const detailView = mountDetailView({
  // //       isWorkshopAdmin: true,
  // //     });
  // //     const mockRouter = sinon.mock(context.router);

  // //     detailView.find('button#admin-edit').first().simulate('click');
  // //     const adminEditMenuitem = detailView
  // //       .find('.dropdown.open a')
  // //       .findWhere(a => a.text() === '(Admin) Edit Form Data')
  // //       .first();

  // //     mockRouter.expects('push').withExactArgs('/1/edit');
  // //     adminEditMenuitem.simulate('click');
  // //     mockRouter.verify();
  // //   });
  // });

  // describe('Edit controls behavior', () => {
  //   it('the dropdown is disabled until the Edit button is clicked in Teacher Application', () => {
  //     renderDefault();

  //     // Dropdowns and notes are disabled before Edit button is clicked
  //     screen.getAllByDisplayValue('Accepted').forEach(dropdown => {
  //       assert(dropdown.disabled);
  //     });
  //     assert(screen.getByDisplayValue('notes').disabled);

  //     // Dropdowns and notes are enabled after Edit button is clicked
  //     fireEvent.click(screen.getAllByText('Edit')[0]);
  //     screen.getAllByDisplayValue('Accepted').forEach(dropdown => {
  //       assert(!dropdown.disabled);
  //     });
  //     assert(!screen.getByDisplayValue('notes').disabled);

  //     // Dropdowns and notes are disabled after Cancel or Save button is clicked
  //     fireEvent.click(screen.getAllByText('Cancel')[0]);
  //     screen.getAllByDisplayValue('Accepted').forEach(dropdown => {
  //       assert(dropdown.disabled);
  //     });
  //     assert(screen.getByDisplayValue('notes').disabled);
  //   });
  // });

  // describe('Principal Approvals', () => {
  //   it(`Shows principal responses if approval is complete`, () => {
  //     renderDefault();

  //     screen.findByText('Administrator Approval and School Information');
  //   });

  //   it(`Shows URL to principal approval if sent and incomplete`, () => {
  //     const guid = '1020304';
  //     const overrideProps = {
  //       applicationData: {
  //         ...DEFAULT_APPLICATION_DATA,
  //         application_guid: guid,
  //         principal_approval_state: PrincipalApprovalState.inProgress,
  //       },
  //     };
  //     renderDefault(overrideProps);

  //     assert(
  //       screen
  //         .getAllByRole('link')[1]
  //         .href.includes(`/pd/application/principal_approval/${guid}`)
  //     );
  //   });

  //   it(`Shows complete text for principal approval if complete`, () => {
  //     const guid = '1020305';
  //     const overrideProps = {
  //       applicationData: {
  //         ...DEFAULT_APPLICATION_DATA,
  //         application_guid: guid,
  //         principal_approval_state: PrincipalApprovalState.complete,
  //       },
  //     };
  //     renderDefault(overrideProps);

  //     screen.getByText(PrincipalApprovalState.complete.trim());
  //   });

  //   it(`Shows button to make principal approval required if not`, () => {
  //     const overrideProps = {
  //       applicationData: {
  //         ...DEFAULT_APPLICATION_DATA,
  //         principal_approval_not_required: true,
  //       },
  //     };
  //     renderDefault(overrideProps);

  //     screen.getByRole('button', {name: 'Make required'});
  //   });

  //   it(`Shows button to make principal approval not required if it is`, () => {
  //     const overrideProps = {
  //       applicationData: {
  //         ...DEFAULT_APPLICATION_DATA,
  //         principal_approval_not_required: null, // principal approval is required
  //       },
  //     };
  //     renderDefault(overrideProps);

  //     screen.getByRole('button', {name: 'Make not required'});
  //   });

  //   it(`Shows button to resend admin email if status is awaiting_admin_approval and it is allowed to be resent`, () => {
  //     const overrideProps = {
  //       applicationData: {
  //         ...DEFAULT_APPLICATION_DATA,
  //         principal_approval_state: PrincipalApprovalState.inProgress,
  //         allow_sending_principal_email: true,
  //         status: 'awaiting_admin_approval',
  //       },
  //     };
  //     renderDefault(overrideProps);

  //     screen.getByRole('button', {name: 'Resend request'});
  //   });

  //   it(`Does not show button to resend admin email if status is awaiting_admin_approval but is not allowed to be resent`, () => {
  //     const overrideProps = {
  //       applicationData: {
  //         ...DEFAULT_APPLICATION_DATA,
  //         principal_approval_state: PrincipalApprovalState.inProgress,
  //         allow_sending_principal_email: false,
  //         status: 'awaiting_admin_approval',
  //       },
  //     };
  //     renderDefault(overrideProps);

  //     expect(screen.queryByRole('button', {name: 'Resend request'})).to.be.null;
  //   });

  //   it(`Does not show button to resend admin email if is allowed to be resent but status is pending`, () => {
  //     const overrideProps = {
  //       applicationData: {
  //         ...DEFAULT_APPLICATION_DATA,
  //         principal_approval_state: PrincipalApprovalState.inProgress,
  //         allow_sending_principal_email: true,
  //         status: 'pending',
  //       },
  //     };
  //     renderDefault(overrideProps);

  //     expect(screen.queryByRole('button', {name: 'Resend request'})).to.be.null;
  //   });
  // });

  // describe('Regional Partner View', () => {
  //   it('has delete button', () => {
  //     const overrideProps = {
  //       isWorkshopAdmin: false,
  //     };
  //     renderDefault(overrideProps);

  //     expect(screen.getAllByText('Delete').length).to.equal(2);
  //   });
  // });

  // describe('Scholarship Teacher? row', () => {
  //   it('on teacher applications', () => {
  //     const overrideProps = {
  //       applicationData: {
  //         ...DEFAULT_APPLICATION_DATA,
  //         scholarship_status: 'no',
  //       },
  //       isWorkshopAdmin: true,
  //       regionalPartners: [{id: 1, name: 'test'}],
  //     };
  //     renderDefault(overrideProps);

  //     const selectDropdown =
  //       screen.getByText('No, paid teacher').parentElement.parentElement
  //         .parentElement.parentElement;

  //     // Dropdown is disabled
  //     assert(selectDropdown.classList.contains('is-disabled'));

  //     // Click "Edit"
  //     fireEvent.click(screen.getAllByText('Edit')[0]);

  //     // Dropdown is no longer disabled
  //     assert(!selectDropdown.classList.contains('is-disabled'));

  //     // Click "Cancel"
  //     fireEvent.click(screen.getAllByText('Cancel')[0]);

  //     // Dropdown is disabled
  //     assert(selectDropdown.classList.contains('is-disabled'));
  //   });
  // });

  describe('Teacher application scholarship status', () => {
    // let detailView;

    // afterEach(() => {
    //   detailView.unmount();
    // });

    for (const applicationStatus of ScholarshipStatusRequiredStatuses) {
      it(`is required in order to set application status to ${applicationStatus}`, () => {
        const overrideProps = {
          applicationData: {
            ...DEFAULT_APPLICATION_DATA,
            status: 'unreviewed',
            scholarship_status: null,
            update_emails_sent_by_system: false,
          },
        };
        renderDefault(overrideProps);

        // Application status set to 'Unreviewed'
        const appStatusDropdown = screen.getAllByRole('combobox')[0];
        assert(appStatusDropdown.disabled);
        expect(appStatusDropdown.value).to.equal('unreviewed');
        expect(screen.queryByText('Cannot save applicant status')).to.be.null;

        // Attempt to switch application status to 'Accepted'
        fireEvent.click(screen.getAllByRole('button', {name: 'Edit'})[0]);
        assert(!appStatusDropdown.disabled);

        fireEvent.change(appStatusDropdown, {
          target: {value: 'accepted'},
        });

        // WHY IS THIS HIDDEN?

        expect(screen.getAllByRole('combobox', {hidden: true})[0].value).to.equal('accepted');


        expect(screen.getAllByText('Accepted').length).to.equal(2);

        screen.getByText('Cannot save applicant status');

        // setScholarshipStatusTo('no');
        // expect(getScholarshipStatus()).to.equal('no');

        // setApplicationStatusTo(applicationStatus);
        // expect(isModalShowing()).to.be.false;
        // expect(screen.findAllByText(applicationStatus).length).to.equal(2);
      });
    }

  //   for (const applicationStatus of _.difference(
  //     Object.keys(getSelectableApplicationStatuses()),
  //     ScholarshipStatusRequiredStatuses
  //   )) {
  //     it(`is not required to set application status to ${applicationStatus}`, () => {
  //       detailView = mountDetailView({
  //         applicationData: {
  //           ...DEFAULT_APPLICATION_DATA,
  //           status: 'unreviewed',
  //           scholarship_status: null,
  //           update_emails_sent_by_system: false,
  //         },
  //       });
  //       expect(isModalShowing()).to.be.false;
  //       expect(getScholarshipStatus()).to.be.null;

  //       setApplicationStatusTo(applicationStatus);
  //       expect(isModalShowing()).to.be.false;
  //       expect(getApplicationStatus()).to.equal(applicationStatus);
  //     });
  //   }

  //   it('appends auto email text if set to true', () => {
  //     detailView = mountDetailView({
  //       applicationData: {
  //         ...DEFAULT_APPLICATION_DATA,
  //         status: 'unreviewed',
  //         scholarship_status: null,
  //         update_emails_sent_by_system: true,
  //       },
  //     });
  //     let options = detailView.find('#DetailViewHeader select').find('option');
  //     let applicationStatuses = Object.values(
  //       getSelectableApplicationStatuses(true)
  //     );
  //     var i = 0;
  //     options.forEach(option => {
  //       expect(option.text()).to.equal(applicationStatuses[i]);
  //       i++;
  //     });
  //   });

  //   it('does not append auto email text if set to false', () => {
  //     detailView = mountDetailView({
  //       applicationData: {
  //         ...DEFAULT_APPLICATION_DATA,
  //         status: 'unreviewed',
  //         scholarship_status: null,
  //         update_emails_sent_by_system: false,
  //       },
  //     });
  //     let options = detailView.find('#DetailViewHeader select').find('option');
  //     let applicationStatuses = Object.values(
  //       getSelectableApplicationStatuses(false)
  //     );
  //     var i = 0;
  //     options.forEach(option => {
  //       expect(option.text()).to.equal(applicationStatuses[i]);
  //       i++;
  //     });
  //   });

    // function clickEditButton() {
    //   fireEvent.click(screen.getAllByText('Edit')[0]);
    // }

    // function setApplicationStatusTo(currentStatus, newStatus) {
    //   const applicationDropdown = screen.getAllByDisplayValue(currentStatus);
    //   fireEvent.change(applicationDropdown, {target: newStatus});
    // }

    // function getScholarshipStatus() {
    //   const scholarshipDropdown = detailView
    //     .find('tr')
    //     .filterWhere(row => row.text().includes('Scholarship Teacher?'))
    //     .find('Select');
    //   return scholarshipDropdown.prop('value');
    // }

    // function setScholarshipStatusTo(newValue) {
    //   const scholarshipDropdown = detailView
    //     .find('tr')
    //     .filterWhere(row => row.text().includes('Scholarship Teacher?'))
    //     .find('Select');
    //   scholarshipDropdown.prop('onChange')({value: newValue});
    //   detailView.update();
    // }

    // function isModalShowing() {
    //   const modal = detailView
    //     .find('ConfirmationDialog')
    //     .filterWhere(
    //       dialog => dialog.prop('headerText') === 'Cannot save applicant status'
    //     )
    //     .first();
    //   return !!modal.prop('show');
    // }

    // function dismissModal() {
    //   detailView.find('ConfirmationDialog').first().prop('onOk')();
    //   detailView.update();
    // }
  });
});
