import AdminCohortView from '@cdo/apps/code-studio/pd/application_dashboard/admin_cohort_view';
import {assert, expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';

describe('AdminCohortView component', () => {
  // FiT cohort data is combination of application and registration data
  const DEFAULT_FIT_COHORT_DATA = [
    {
      accepted_fit: 'Yes',
      applicant_name: 'applicant',
      assigned_fit: 'fit',
      assigned_workshop: 'workshop',
      course_name: 'CS Discoveries',
      date_accepted: '2019-03-22',
      district_name: 'district',
      email: 'teacher@school.edu',
      form_data: {
        ableToAttend: 'Yes',
        addressCity: 'city',
        addressState: 'state',
        addressStreet: 'street',
        addressZip: '12345',
        agreeShareContact: true,
        city: null,
        contactFirstName: 'first',
        contactLastName: 'last',
        contactPhone: '1234567890',
        contactRelationship: 'me',
        date: 'June 1-1, 2019',
        dietaryNeeds: ['None'],
        email: 'teacher@school.edu',
        howTraveling: 'I will drive by myself',
        howTraveling_carpooling_with_attendee: 'the passenger',
        lastName: 'last',
        liabilityWaiver: true,
        liveFarAway: 'Yes',
        needAda: 'Yes',
        needDisabilitySupport: 'Yes',
        needHotel: 'Yes',
        phone: '1234567890',
        photoRelease: true,
        preferredFirstName: 'first'
      },
      id: 1,
      locked: true,
      notes: '3/21: Approved by Code.org.',
      notes_2: 'Questions has for us:\n',
      notes_3:
        'Strengths: \nWeaknesses: \nPotential red flags to follow- up on: \nOther notes:',
      notes_4: null,
      notes_5: null,
      regional_partner_name: 'partner',
      registered_fit: true,
      registered_fit_submission_time: 'Mar 22 2019 12:02am UTC',
      registered_workshop: false,
      role: 'Lead Facilitator',
      school_name: 'school',
      status: 'accepted',
      type: 'Pd::Application::Facilitator1920Application'
    }
  ];

  const minProps = {route: {cohortType: 'FiT'}};

  before(() => {
    // Prevent AdminCohortView load() function to send ajax request to server
    // by stubbing it and faking the server-returned data.
    sinon.stub(AdminCohortView.prototype, 'load');
  });

  after(() => {
    AdminCohortView.prototype.load.restore();
  });

  it('can be rendered', () => {
    const wrapper = shallow(<AdminCohortView {...minProps} />);
    expect(wrapper).not.to.be.null;
  });

  it('can sanitize strings', () => {
    const testCases = [
      {input: undefined, expected: ''},
      {input: '', expected: ''},
      {input: '\ta ', expected: 'a'},
      {input: 'a  b\t\tc \t d', expected: 'a b c d'},
      {input: '\na\nb\rc\n\rd\r\ne\n\nf\r\r', expected: '. a. b. c. d. e. f.'}
    ];

    testCases.forEach(testCase => {
      expect(AdminCohortView.sanitizeString(testCase.input)).to.equal(
        testCase.expected
      );
    });
  });

  it('can compile data to export to CSV', () => {
    let downloadCsvSpy = sinon.spy();
    const wrapper = shallow(
      <AdminCohortView {...minProps} downloadCsv={downloadCsvSpy} />
    );

    // Fake component state instead of loading real data from server
    wrapper.setState({
      cohort: DEFAULT_FIT_COHORT_DATA,
      filteredCohort: DEFAULT_FIT_COHORT_DATA,
      loading: false
    });

    // Test part of handleDownloadCsv function to the point where it calls downloadCsv function.
    wrapper.instance().handleDownloadCsv();

    expect(downloadCsvSpy).to.have.been.calledOnce;

    let spyCallArgs = downloadCsvSpy.lastCall.args[0];
    assert.strictEqual(
      spyCallArgs.filename,
      `${minProps.route.cohortType.toLowerCase()}_cohort.csv`,
      'CSV file name is not as expected'
    );

    let missingKeyCnt = 0;
    Object.keys(DEFAULT_FIT_COHORT_DATA[0].form_data).forEach(key => {
      if (
        !spyCallArgs.headers.hasOwnProperty(key) ||
        !spyCallArgs.data[0].hasOwnProperty(key)
      ) {
        missingKeyCnt += 1;
      }
    });
    assert.equal(missingKeyCnt, 0, 'Form data keys are missing');
  });
});
