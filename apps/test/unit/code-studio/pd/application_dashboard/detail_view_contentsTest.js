import {DetailViewContents} from '@cdo/apps/code-studio/pd/application_dashboard/detail_view_contents';
import {
  getApplicationStatuses,
  ApplicationFinalStatuses,
  ScholarshipStatusRequiredStatuses
} from '@cdo/apps/code-studio/pd/application_dashboard/constants';
import React from 'react';
import _ from 'lodash';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import {mount} from 'enzyme';

describe('DetailViewContents', () => {
  // We aren't testing any of the responses of the workshop selector control, so just
  // have a fake server to handle calls and suppress warnings
  sinon.fakeServer.create();

  let context;

  const DEFAULT_APPLICATION_DATA = {
    regionalPartner: 'partner',
    notes: 'notes',
    status: 'accepted',
    school_name: 'School Name',
    district_name: 'District Name',
    email: 'email',
    application_year: '2019-2020',
    application_type: 'Teacher',
    course_name: 'CS Discoveries',
    course: 'csd',
    registered_fit_weekend: false,
    registered_teachercon: false,
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
      taughtInPast: 'No'
    },
    response_scores: {
      meets_minimum_criteria_scores: {
        committed: 'Yes'
      },
      bonus_points_scores: {
        committed: 5,
        question_1: 5,
        question_2: 5,
        question_3: 5,
        question_4: 5,
        question_5: 5
      },
      meets_scholarship_criteria_scores: {
        principal_approval: 'Yes'
      }
    },
    school_stats: {}
  };

  const mountDetailView = (applicationType, overrides = {}) => {
    const defaultApplicationData = {
      ...DEFAULT_APPLICATION_DATA,
      application_type: applicationType
    };
    const defaultProps = {
      canLock: true,
      applicationId: '1',
      applicationData: defaultApplicationData,
      viewType: 'facilitator',
      isWorkshopAdmin: false
    };

    // No-op router context
    context = {
      router: {
        push() {}
      }
    };

    return mount(<DetailViewContents {..._.merge(defaultProps, overrides)} />, {
      context
    });
  };

  describe('Notes', () => {
    it('Uses default value for facilitator applications with no notes', () => {
      const facilitatorDetailView = mountDetailView('Facilitator', {
        applicationData: {notes: ''}
      });
      expect(facilitatorDetailView.state().notes).to.eql(
        'Strengths:\nWeaknesses:\nPotential red flags to follow-up on:\nOther notes:'
      );
    });

    it('Uses entered value for facilitator applications with notes', () => {
      const facilitatorDetailView = mountDetailView('Facilitator', {
        applicationData: {notes: 'actual notes'}
      });
      expect(facilitatorDetailView.state().notes).to.eql('actual notes');
    });

    it('Does not supply value for teacher applications with no notes', () => {
      const teacherDetailView = mountDetailView('Teacher', {
        applicationData: {notes: ''}
      });
      expect(teacherDetailView.state().notes).to.eql('');
    });
  });

  const applicationType = 'Facilitator';

  describe('Edit controls in Facilitator', () => {
    it(`allows for a subset of statuses to be locked`, () => {
      const detailView = mountDetailView(applicationType);

      // click edit
      detailView
        .find('#DetailViewHeader Button')
        .last()
        .simulate('click');

      // lock button is disabled for all statuses except "finalized"
      // statuses in the constant are an object {value: label}
      Object.keys(
        getApplicationStatuses(applicationType.toLowerCase())
      ).forEach(status => {
        const statusIsFinal = ApplicationFinalStatuses.includes(status);
        detailView
          .find('#DetailViewHeader select')
          .simulate('change', {target: {value: status}});
        expect(
          detailView
            .find('#DetailViewHeader Button')
            .first()
            .prop('disabled')
        ).to.equal(!statusIsFinal);
      });
    });

    it(`disables status dropdown when locked`, () => {
      const detailView = mountDetailView(applicationType);

      // click edit
      detailView
        .find('#DetailViewHeader Button')
        .last()
        .simulate('click');

      // change status to approved
      detailView
        .find('#DetailViewHeader select')
        .simulate('change', {target: {value: 'accepted'}});

      // lock status
      expect(
        detailView
          .find('#DetailViewHeader Button')
          .first()
          .text()
      ).to.equal('Lock');
      detailView
        .find('#DetailViewHeader Button')
        .first()
        .simulate('click');
      expect(detailView.find('#DetailViewHeader select').prop('disabled')).to.be
        .true;
      expect(
        detailView
          .find('#DetailViewHeader Button')
          .first()
          .text()
      ).to.equal('Unlock');

      // unlock status
      detailView
        .find('#DetailViewHeader Button')
        .first()
        .simulate('click');
      expect(detailView.find('#DetailViewHeader select').prop('disabled')).to.be
        .false;
      expect(
        detailView
          .find('#DetailViewHeader Button')
          .first()
          .text()
      ).to.equal('Lock');
    });
  });

  const expectedTestData = ['Teacher', 'Facilitator'];

  for (const applicationType of expectedTestData) {
    describe('Admin edit dropdown', () => {
      it('Is not visible to regional partners', () => {
        const detailView = mountDetailView(applicationType, {
          isWorkshopAdmin: false
        });
        expect(detailView.find('button#admin-edit')).to.have.length(0);
      });

      it('Is visible to admins', () => {
        const detailView = mountDetailView(applicationType, {
          isWorkshopAdmin: true
        });
        expect(detailView.find('button#admin-edit')).to.have.length(2);
      });

      it('Edit redirects to edit page', () => {
        const detailView = mountDetailView(applicationType, {
          isWorkshopAdmin: true
        });
        const mockRouter = sinon.mock(context.router);

        detailView
          .find('button#admin-edit')
          .first()
          .simulate('click');
        const adminEditMenuitem = detailView
          .find('.dropdown.open a')
          .findWhere(a => a.text() === '(Admin) Edit Form Data')
          .first();

        mockRouter.expects('push').withExactArgs('/1/edit');
        adminEditMenuitem.simulate('click');
        mockRouter.verify();
      });

      it('Has Delete Application menu item', () => {
        const detailView = mountDetailView(applicationType, {
          isWorkshopAdmin: true
        });
        detailView
          .find('button#admin-edit')
          .first()
          .simulate('click');
        const deleteApplicationMenuitem = detailView
          .find('.dropdown.open a')
          .findWhere(a => a.text() === 'Delete Application')
          .first();

        expect(deleteApplicationMenuitem).to.have.length(1);
      });

      it('Has Delete FiT Weekend Registration menu item if there is a FiT weekend registration', () => {
        const overrides = {
          isWorkshopAdmin: true,
          applicationData: {registered_fit_weekend: true}
        };
        const detailView = mountDetailView(applicationType, overrides);
        detailView
          .find('button#admin-edit')
          .first()
          .simulate('click');
        const deleteFitWeekendRegistrationMenuitem = detailView
          .find('.dropdown.open a')
          .findWhere(a => a.text() === 'Delete FiT Weekend Registration')
          .first();

        expect(deleteFitWeekendRegistrationMenuitem).to.have.length(1);
      });

      it('Does not have delete registration menu items if there are not registrations', () => {
        const detailView = mountDetailView(applicationType, {
          isWorkshopAdmin: true
        });
        detailView
          .find('button#admin-edit')
          .first()
          .simulate('click');
        const deleteTeacherconRegistrationMenuitem = detailView
          .find('.dropdown.open a')
          .findWhere(a => a.text() === 'Delete Teachercon Registration')
          .first();
        const deleteFitWeekendRegistrationMenuitem = detailView
          .find('.dropdown.open a')
          .findWhere(a => a.text() === 'Delete FiT Weekend Registration')
          .first();

        expect(deleteTeacherconRegistrationMenuitem).to.have.length(0);
        expect(deleteFitWeekendRegistrationMenuitem).to.have.length(0);
      });
    });

    describe('Edit controls behavior', () => {
      it(`the dropdown is disabled until the Edit button is clicked in ${applicationType}`, () => {
        const detailView = mountDetailView(applicationType);

        let expectedButtons =
          applicationType === 'Facilitator' ? ['Lock', 'Edit'] : ['Edit'];
        expect(
          detailView.find('#DetailViewHeader Button').map(button => {
            return button.text();
          })
        ).to.deep.equal(expectedButtons);
        expect(
          detailView.find('#DetailViewHeader FormControl').prop('disabled')
        ).to.be.true;
        expect(detailView.find('textarea#notes').prop('disabled')).to.be.true;
        expect(detailView.find('textarea#notes_2').prop('disabled')).to.be.true;

        expectedButtons =
          applicationType === 'Facilitator'
            ? ['Lock', 'Save', 'Cancel']
            : ['Save', 'Cancel'];
        detailView
          .find('#DetailViewHeader Button')
          .last()
          .simulate('click');
        expect(
          detailView.find('#DetailViewHeader Button').map(button => {
            return button.text();
          })
        ).to.deep.equal(expectedButtons);
        expect(
          detailView.find('#DetailViewHeader FormControl').prop('disabled')
        ).to.be.false;
        expect(detailView.find('textarea#notes').prop('disabled')).to.be.false;
        expect(detailView.find('textarea#notes_2').prop('disabled')).to.be
          .false;

        detailView
          .find('#DetailViewHeader Button')
          .last()
          .simulate('click');
        expect(
          detailView.find('#DetailViewHeader FormControl').prop('disabled')
        ).to.be.true;
        expect(detailView.find('textarea#notes').prop('disabled')).to.be.true;
        expect(detailView.find('textarea#notes_2').prop('disabled')).to.be.true;
      });
    });
  }

  describe('Scholarship Teacher? row', () => {
    it('on teacher applications', () => {
      const detailView = mountDetailView('Teacher', {
        isWorkshopAdmin: true,
        regionalPartners: [{id: 1, name: 'test'}]
      });
      const getLastRow = () =>
        detailView
          .find('tr')
          .filterWhere(row => row.text().includes('Scholarship Teacher?'));

      // Dropdown is disabled
      expect(
        getLastRow()
          .find('Select')
          .prop('disabled')
      ).to.equal(true);

      // Click "Edit"
      detailView
        .find('#DetailViewHeader Button')
        .not('#admin-edit')
        .last()
        .simulate('click');

      // Dropdown is enabled
      expect(
        getLastRow()
          .find('Select')
          .prop('disabled')
      ).to.equal(false);

      // Click "Save"
      detailView
        .find('#DetailViewHeader Button')
        .last()
        .simulate('click');

      // Dropdown is disabled
      expect(
        getLastRow()
          .find('Select')
          .prop('disabled')
      ).to.equal(true);
    });
  });

  describe('Teacher application scholarship status', () => {
    let detailView;

    afterEach(() => {
      detailView.unmount();
    });

    for (const applicationStatus of ScholarshipStatusRequiredStatuses) {
      it(`is required in order to set application status to ${applicationStatus}`, () => {
        detailView = mountDetailView('Teacher', {
          applicationData: {
            ...DEFAULT_APPLICATION_DATA,
            status: 'unreviewed',
            scholarship_status: null,
            update_emails_sent_by_system: false
          }
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

    for (const applicationStatus of [
      'unreviewed',
      'pending',
      'waitlisted',
      'declined',
      'withdrawn'
    ]) {
      it(`is not required to set application status to ${applicationStatus}`, () => {
        detailView = mountDetailView('Teacher', {
          applicationData: {
            ...DEFAULT_APPLICATION_DATA,
            status: 'unreviewed',
            scholarship_status: null,
            update_emails_sent_by_system: false
          }
        });
        expect(isModalShowing()).to.be.false;
        expect(getScholarshipStatus()).to.be.null;

        setApplicationStatusTo(applicationStatus);
        expect(isModalShowing()).to.be.false;
        expect(getApplicationStatus()).to.equal(applicationStatus);
      });
    }

    it('appends auto email text if set to true', () => {
      detailView = mountDetailView('Teacher', {
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          status: 'unreviewed',
          scholarship_status: null,
          update_emails_sent_by_system: true
        },
        viewType: 'teacher'
      });
      let options = detailView.find('#DetailViewHeader select').find('option');
      let applicationStatuses = Object.values(
        getApplicationStatuses('teacher', true)
      );
      var i = 0;
      options.forEach(option => {
        expect(option.text()).to.equal(applicationStatuses[i]);
        i++;
      });
    });

    it('does not appends auto email text if set to false', () => {
      detailView = mountDetailView('Teacher', {
        applicationData: {
          ...DEFAULT_APPLICATION_DATA,
          status: 'unreviewed',
          scholarship_status: null,
          update_emails_sent_by_system: false
        },
        viewType: 'teacher'
      });
      let options = detailView.find('#DetailViewHeader select').find('option');
      let applicationStatuses = Object.values(
        getApplicationStatuses('teacher', false)
      );
      var i = 0;
      options.forEach(option => {
        expect(option.text()).to.equal(applicationStatuses[i]);
        i++;
      });
    });

    function clickEditButton() {
      detailView
        .find('#DetailViewHeader Button')
        .last()
        .simulate('click');
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
      detailView
        .find('ConfirmationDialog')
        .first()
        .prop('onOk')();
      detailView.update();
    }
  });
});
