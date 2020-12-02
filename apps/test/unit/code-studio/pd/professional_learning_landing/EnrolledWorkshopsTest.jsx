import React from 'react';
import {shallow} from 'enzyme';
import {EnrolledWorkshopsTable} from '@cdo/apps/code-studio/pd/professional_learning_landing/EnrolledWorkshops';
import sinon from 'sinon';
import {assert, expect} from 'chai';
import * as utils from '@cdo/apps/utils';
import moment from 'moment';
import {serializedWorkshopFactory} from '../../../../factories/professionalLearning';

describe('EnrolledWorkshops', () => {
  const workshops = [
    serializedWorkshopFactory.build({
      pre_workshop_survey_url: 'code.org/pre_survey_url',
      workshop_starting_date: '2020-01-17T00:44:05.000Z'
    }),
    serializedWorkshopFactory.build({state: 'In Progress'}),
    serializedWorkshopFactory.build({state: 'Ended', attended: true}),
    serializedWorkshopFactory.build({state: 'Ended'})
  ];

  let clock;

  beforeEach(() => {
    sinon.stub(utils, 'windowOpen');
  });

  afterEach(() => {
    if (clock) {
      clock.restore();
      clock = undefined;
    }
    utils.windowOpen.restore();
  });

  it('Clicking cancel enrollment cancels the enrollment', () => {
    const enrolledWorkshopsTable = shallow(
      <EnrolledWorkshopsTable workshops={workshops} />
    );

    // We expect there to be a table with 4 rows in the body, three of which have two buttons
    expect(enrolledWorkshopsTable.find('tbody tr')).to.have.length(4);
    expect(enrolledWorkshopsTable.find('tbody tr Button')).to.have.length(8);
    expect(enrolledWorkshopsTable.state('showCancelModal')).to.be.false;
    expect(enrolledWorkshopsTable.state('enrollmentCodeToCancel')).to.equal(
      undefined
    );

    // Pushing the button should bring up the modal
    enrolledWorkshopsTable
      .find('tbody tr')
      .at(0)
      .find('Button')
      .last()
      .simulate('click');
    expect(enrolledWorkshopsTable.state('showCancelModal')).to.be.true;
    expect(enrolledWorkshopsTable.state('enrollmentCodeToCancel')).to.equal(
      'code1'
    );
  });

  it('Clicking "Print Certificate" opens the certificate in a new tab if user attended workshop', function() {
    const enrolledWorkshopsTable = shallow(
      <EnrolledWorkshopsTable workshops={workshops} />
    );

    // Click the "Print Certificate" button
    enrolledWorkshopsTable
      .find('tbody tr')
      .at(2)
      .find('Button')
      .first()
      .simulate('click');

    assert(utils.windowOpen.calledOnce);
    assert(
      utils.windowOpen.calledWith(
        `/pd/generate_workshop_certificate/${workshops[2].enrollment_code}`
      )
    );
  });

  it('"Print Certificate" button is disabled if user did not attend workshop', function() {
    const enrolledWorkshopsTable = shallow(
      <EnrolledWorkshopsTable workshops={workshops} />
    );

    // Get disabled "Print Certificate" React Button component
    const printCertificateButton = enrolledWorkshopsTable
      .find('tbody tr')
      .at(3)
      .find('Button')
      .first();

    expect(printCertificateButton.prop('disabled')).to.be.true;
  });

  it('Pre-survey link button shown in workshops that have not started', function() {
    const enrolledWorkshopsTable = shallow(
      <EnrolledWorkshopsTable workshops={workshops} />
    );

    enrolledWorkshopsTable
      .find('tbody tr')
      .at(0)
      .find('Button')
      .first()
      .simulate('click');

    assert(utils.windowOpen.calledOnce);
  });

  it('Pre-survey link button not shown in ended workshop', function() {
    const enrolledWorkshopsTable = shallow(
      <EnrolledWorkshopsTable workshops={workshops} />
    );

    const preWorkshopSurveyButton = enrolledWorkshopsTable
      .find('tbody tr')
      .at(3)
      .find('Button')
      .findWhere(n => n.text() === 'Complete pre-workshop survey');

    expect(preWorkshopSurveyButton).to.have.lengthOf(0);
  });

  it('Pre-survey link button is disabled if more than 10 days before workshop', function() {
    clock = sinon.useFakeTimers(
      moment(workshops[0].workshop_starting_date)
        .subtract(14, 'days')
        .toDate()
    );

    const enrolledWorkshopsTable = shallow(
      <EnrolledWorkshopsTable workshops={workshops} />
    );

    const preWorkshopSurveyButton = enrolledWorkshopsTable
      .find('tbody tr')
      .at(0)
      .find('Button')
      .first();

    expect(preWorkshopSurveyButton.props().disabled).to.be.true;
  });
});
