import {DetailViewContents} from '@cdo/apps/code-studio/pd/application_dashboard/detail_view_contents';
import {
  getApplicationStatuses,
  ScholarshipStatusRequiredStatuses,
} from '@cdo/apps/code-studio/pd/application_dashboard/constants';
import {PrincipalApprovalState} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import React from 'react';
import _ from 'lodash';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import {allowConsoleWarnings} from '../../../../util/testUtils';

describe('DetailViewContents', () => {
  allowConsoleWarnings();

  // We aren't testing any of the responses of the workshop selector control, so just
  // have a fake server to handle calls and suppress warnings
  let server;
  before(() => {
    server = sinon.fakeServer.create();
  });

  after(() => {
    server.restore();
  });

  let context;

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

  // Nobody is able to set an application status to incomplete or to awaiting_admin_approval from detail view
  const getSelectableApplicationStatuses = (addAutoEmail = true) =>
    _.omit(getApplicationStatuses(addAutoEmail), [
      'incomplete',
      'awaiting_admin_approval',
    ]);

  const mountDetailView = (overrides = {}) => {
    const defaultApplicationData = {
      ...DEFAULT_APPLICATION_DATA,
    };
    const defaultProps = {
      canLock: true,
      applicationId: '1',
      applicationData: defaultApplicationData,
      isWorkshopAdmin: false,
    };

    // No-op router context
    context = {
      router: {
        push() {},
      },
    };

    return mount(<DetailViewContents {..._.merge(defaultProps, overrides)} />, {
      context,
    });
  };

  describe('Notes', () => {
    it('Does not supply value for teacher applications with no notes', () => {
      const teacherDetailView = mountDetailView({
        applicationData: {notes: ''},
      });
      expect(teacherDetailView.state().notes).to.eql('');
    });
  });

  describe('Edit controls in Teacher', () => {
    it("cannot change status if application is currently in 'Awaiting Admin Approval'", () => {
      const detailView = mountDetailView({
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          status: 'awaiting_admin_approval',
        },
      });

      expect(detailView.find('#DetailViewHeader FormControl').prop('disabled'))
        .to.be.true;
    });

    it("cannot make status 'Awaiting Admin Approval' from dropdown", () => {
      const detailView = mountDetailView();
      expect(
        detailView
          .find('#DetailViewHeader select')
          .find('option')
          .find('[value="awaiting_admin_approval"]')
      ).to.have.lengthOf(0);
    });

    it("cannot make status 'Incomplete' from dropdown", () => {
      const detailView = mountDetailView();
      expect(
        detailView
          .find('#DetailViewHeader select')
          .find('option')
          .find('[value="incomplete"]')
      ).to.have.lengthOf(0);
    });

    it('incomplete status is in dropdown if teacher application is incomplete', () => {
      const detailView = mountDetailView({
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          status: 'incomplete',
          scholarship_status: null,
          update_emails_sent_by_system: false,
        },
      });
      expect(
        detailView
          .find('#DetailViewHeader select')
          .find('option')
          .find('[value="incomplete"]')
      ).to.have.lengthOf(1);
    });

    it('changelog logs all possible status changes', () => {
      let status_change_log = [];

      // get logs for changing through possible status
      Object.keys(getSelectableApplicationStatuses()).forEach(status => {
        status_change_log.push({
          changing_user: 'Test use',
          time: '2018-06-01 12:00 PDT',
          title: status,
        });
      });

      // check that recorded change logs are rendered in ChangeLog element
      const overrides = {
        applicationData: {status_change_log: status_change_log},
      };
      const detailView = mountDetailView(overrides);
      expect(detailView.find('ChangeLog').props().changeLog).to.deep.equal(
        status_change_log
      );
    });
  });

  describe('Admin edit dropdown', () => {
    it('Is not visible to regional partners', () => {
      const detailView = mountDetailView({
        isWorkshopAdmin: false,
      });
      expect(detailView.find('button#admin-edit')).to.have.length(0);
    });

    it('Is visible to admins', () => {
      const detailView = mountDetailView({
        isWorkshopAdmin: true,
      });
      expect(detailView.find('button#admin-edit')).to.have.length(2);
    });

    it('Edit redirects to edit page', () => {
      const detailView = mountDetailView({
        isWorkshopAdmin: true,
      });
      const mockRouter = sinon.mock(context.router);

      detailView.find('button#admin-edit').first().simulate('click');
      const adminEditMenuitem = detailView
        .find('.dropdown.open a')
        .findWhere(a => a.text() === '(Admin) Edit Form Data')
        .first();

      mockRouter.expects('push').withExactArgs('/1/edit');
      adminEditMenuitem.simulate('click');
      mockRouter.verify();
    });

    it('Has Delete Application menu item', () => {
      const detailView = mountDetailView({
        isWorkshopAdmin: true,
      });
      detailView.find('button#admin-edit').first().simulate('click');
      const deleteApplicationMenuitem = detailView
        .find('.dropdown.open a')
        .findWhere(a => a.text() === 'Delete Application')
        .first();

      expect(deleteApplicationMenuitem).to.have.length(1);
    });
  });

  describe('Edit controls behavior', () => {
    it('the dropdown is disabled until the Edit button is clicked in Teacher Application', () => {
      const detailView = mountDetailView();

      let expectedButtons = ['Edit', 'Delete'];
      expect(
        detailView.find('#DetailViewHeader Button').map(button => {
          return button.text();
        })
      ).to.deep.equal(expectedButtons);
      expect(detailView.find('#DetailViewHeader FormControl').prop('disabled'))
        .to.be.true;
      expect(detailView.find('textarea#notes').prop('disabled')).to.be.true;
      expect(detailView.find('textarea#notes_2').prop('disabled')).to.be.true;

      expectedButtons = ['Save', 'Cancel'];
      detailView.find('button#edit').first().simulate('click');
      expect(
        detailView.find('#DetailViewHeader Button').map(button => {
          return button.text();
        })
      ).to.deep.equal(expectedButtons);
      expect(detailView.find('#DetailViewHeader FormControl').prop('disabled'))
        .to.be.false;
      expect(detailView.find('textarea#notes').prop('disabled')).to.be.false;
      expect(detailView.find('textarea#notes_2').prop('disabled')).to.be.false;

      detailView.find('#DetailViewHeader Button').last().simulate('click');
      expect(detailView.find('#DetailViewHeader FormControl').prop('disabled'))
        .to.be.true;
      expect(detailView.find('textarea#notes').prop('disabled')).to.be.true;
      expect(detailView.find('textarea#notes_2').prop('disabled')).to.be.true;
    });
  });

  describe('Principal Approvals', () => {
    it(`Shows principal responses if approval is complete`, () => {
      const detailView = mountDetailView();
      expect(detailView.text()).to.contain(
        'Administrator Approval and School Information'
      );
    });
    it(`Shows URL to principal approval if sent and incomplete`, () => {
      const guid = '1020304';
      const detailView = mountDetailView({
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          application_guid: guid,
          principal_approval_state: PrincipalApprovalState.inProgress,
        },
      });
      expect(detailView.text()).to.contain(`Incomplete`);
      expect(
        detailView.find('#principal-approval-url').props().href
      ).to.contain(`principal_approval/${guid}`);
    });
    it(`Shows complete text for principal approval if complete`, () => {
      const guid = '1020305';
      const detailView = mountDetailView({
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          application_guid: guid,
          principal_approval_state: PrincipalApprovalState.complete,
        },
      });
      expect(detailView.text()).to.contain(`Complete`);
    });
    it(`Shows button to make principal approval required if not`, () => {
      const detailView = mountDetailView({
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          principal_approval_not_required: true,
        },
      });
      expect(detailView.find('PrincipalApprovalButtons').text()).to.contain(
        'Make required'
      );
    });
    it(`Shows button to make principal approval not required if it is`, () => {
      const detailView = mountDetailView({
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          principal_approval_not_required: null, // principal approval is required
        },
      });
      expect(detailView.find('PrincipalApprovalButtons').text()).to.contain(
        'Make not required'
      );
    });
    it(`Shows button to resend admin email if status is awaiting_admin_approval and it is allowed to be resent`, () => {
      const detailView = mountDetailView({
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          principal_approval_state: PrincipalApprovalState.inProgress,
          allow_sending_principal_email: true,
          status: 'awaiting_admin_approval',
        },
      });
      expect(detailView.find('PrincipalApprovalButtons').text()).to.contain(
        'Resend request'
      );
    });
    it(`Does not show button to resend admin email if status is awaiting_admin_approval but is not allowed to be resent`, () => {
      const detailView = mountDetailView({
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          principal_approval_state: PrincipalApprovalState.inProgress,
          allow_sending_principal_email: false,
          status: 'awaiting_admin_approval',
        },
      });
      expect(detailView.find('PrincipalApprovalButtons').text()).not.to.contain(
        'Resend request'
      );
    });
    it(`Does not show button to resend admin email if is allowed to be resent but status is pending`, () => {
      const detailView = mountDetailView({
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          principal_approval_state: PrincipalApprovalState.inProgress,
          allow_sending_principal_email: true,
          status: 'pending',
        },
      });
      expect(detailView.find('PrincipalApprovalButtons').text()).not.to.contain(
        'Resend request'
      );
    });
  });

  describe('Regional Partner View', () => {
    it('has delete button', () => {
      const detailView = mountDetailView({
        isWorkshopAdmin: false,
      });
      const deleteButton = detailView.find('button#delete');
      expect(deleteButton).to.have.length(2);
    });
  });

  describe('Scholarship Teacher? row', () => {
    it('on teacher applications', () => {
      const detailView = mountDetailView({
        isWorkshopAdmin: true,
        regionalPartners: [{id: 1, name: 'test'}],
      });
      const getLastRow = () =>
        detailView
          .find('tr')
          .filterWhere(row => row.text().includes('Scholarship Teacher?'));

      // Dropdown is disabled
      expect(getLastRow().find('Select').prop('disabled')).to.equal(true);

      // Click "Edit"
      detailView
        .find('#DetailViewHeader Button')
        .not('#admin-edit')
        .last()
        .simulate('click');

      // Dropdown is no longer disabled
      expect(getLastRow().find('Select').prop('disabled')).to.equal(false);

      // Click "Save"
      detailView.find('#DetailViewHeader Button').last().simulate('click');

      // Dropdown is disabled
      expect(getLastRow().find('Select').prop('disabled')).to.equal(true);
    });
  });

  describe('Teacher application scholarship status', () => {
    let detailView;

    afterEach(() => {
      detailView.unmount();
    });

    for (const applicationStatus of ScholarshipStatusRequiredStatuses) {
      it(`is required in order to set application status to ${applicationStatus}`, () => {
        detailView = mountDetailView({
          applicationData: {
            ...DEFAULT_APPLICATION_DATA,
            status: 'unreviewed',
            scholarship_status: null,
            update_emails_sent_by_system: false,
          },
        });
        expect(isModalShowing()).to.be.false;
        expect(getScholarshipStatus()).to.be.null;
        expect(getApplicationStatus()).to.equal('unreviewed');

        setApplicationStatusTo(applicationStatus);
        expect(isModalShowing()).to.be.true;
        expect(getApplicationStatus()).to.equal('unreviewed');

        dismissModal();
        expect(isModalShowing()).to.be.false;
        expect(getApplicationStatus()).to.equal('unreviewed');

        clickEditButton();
        setScholarshipStatusTo('no');
        expect(getScholarshipStatus()).to.equal('no');

        setApplicationStatusTo(applicationStatus);
        expect(isModalShowing()).to.be.false;
        expect(getApplicationStatus()).to.equal(applicationStatus);
      });
    }

    for (const applicationStatus of _.difference(
      Object.keys(getSelectableApplicationStatuses()),
      ScholarshipStatusRequiredStatuses
    )) {
      it(`is not required to set application status to ${applicationStatus}`, () => {
        detailView = mountDetailView({
          applicationData: {
            ...DEFAULT_APPLICATION_DATA,
            status: 'unreviewed',
            scholarship_status: null,
            update_emails_sent_by_system: false,
          },
        });
        expect(isModalShowing()).to.be.false;
        expect(getScholarshipStatus()).to.be.null;

        setApplicationStatusTo(applicationStatus);
        expect(isModalShowing()).to.be.false;
        expect(getApplicationStatus()).to.equal(applicationStatus);
      });
    }

    it('appends auto email text if set to true', () => {
      detailView = mountDetailView({
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          status: 'unreviewed',
          scholarship_status: null,
          update_emails_sent_by_system: true,
        },
      });
      let options = detailView.find('#DetailViewHeader select').find('option');
      let applicationStatuses = Object.values(
        getSelectableApplicationStatuses(true)
      );
      var i = 0;
      options.forEach(option => {
        expect(option.text()).to.equal(applicationStatuses[i]);
        i++;
      });
    });

    it('does not append auto email text if set to false', () => {
      detailView = mountDetailView({
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          status: 'unreviewed',
          scholarship_status: null,
          update_emails_sent_by_system: false,
        },
      });
      let options = detailView.find('#DetailViewHeader select').find('option');
      let applicationStatuses = Object.values(
        getSelectableApplicationStatuses(false)
      );
      var i = 0;
      options.forEach(option => {
        expect(option.text()).to.equal(applicationStatuses[i]);
        i++;
      });
    });

    function clickEditButton() {
      detailView.find('#DetailViewHeader Button').last().simulate('click');
    }

    function getApplicationStatus() {
      return detailView.find('#DetailViewHeader select').prop('value');
    }

    function setApplicationStatusTo(newStatus) {
      detailView
        .find('#DetailViewHeader select')
        .simulate('change', {target: {value: newStatus}});
    }

    function getScholarshipStatus() {
      const scholarshipDropdown = detailView
        .find('tr')
        .filterWhere(row => row.text().includes('Scholarship Teacher?'))
        .find('Select');
      return scholarshipDropdown.prop('value');
    }

    function setScholarshipStatusTo(newValue) {
      const scholarshipDropdown = detailView
        .find('tr')
        .filterWhere(row => row.text().includes('Scholarship Teacher?'))
        .find('Select');
      scholarshipDropdown.prop('onChange')({value: newValue});
      detailView.update();
    }

    function isModalShowing() {
      const modal = detailView
        .find('ConfirmationDialog')
        .filterWhere(
          dialog => dialog.prop('headerText') === 'Cannot save applicant status'
        )
        .first();
      return !!modal.prop('show');
    }

    function dismissModal() {
      detailView.find('ConfirmationDialog').first().prop('onOk')();
      detailView.update();
    }
  });
});
