import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import ProgressTableStudentName from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableStudentName';
import * as urlHelpers from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import sinon from 'sinon';

const DEFAULT_PROPS = {
  name: 'Joe',
  studentId: 1,
  sectionId: 1,
  scriptName: 'Test Script',
  scriptId: 1,
  lastTimestamp: 1578646800000,
  localeCode: 'en-US'
};

describe('ProgressTableStudentName', () => {
  afterEach(() => {
    if (urlHelpers.scriptUrlForStudent.restore) {
      urlHelpers.scriptUrlForStudent.restore();
    }
  });

  it('renders tooltip with empty state when lastTimeStamp is null', () => {
    const props = {...DEFAULT_PROPS, lastTimestamp: null};
    const wrapper = shallow(<ProgressTableStudentName {...props} />);
    const tooltip = wrapper.find('#tooltipIdForStudent1');
    expect(tooltip.contains('Last Progress:')).to.equal(true);
    expect(tooltip.contains('None')).to.equal(true);
  });

  it('renders tooltip with timestamp when lastTimeStamp is present', () => {
    const props = {...DEFAULT_PROPS, lastTimestamp: 1578646800000};
    const wrapper = shallow(<ProgressTableStudentName {...props} />);
    const tooltip = wrapper.find('#tooltipIdForStudent1');
    expect(tooltip.contains('Last Progress:')).to.equal(true);
    expect(tooltip.contains('01/10/2020')).to.equal(true);
  });

  it('renders tooltip with timestamp in correct locale when lastTimeStamp and localeCode are present', () => {
    const props = {
      ...DEFAULT_PROPS,
      lastTimestamp: 1578646800000,
      localeCode: 'fr'
    };
    const wrapper = shallow(<ProgressTableStudentName {...props} />);
    const tooltip = wrapper.find('#tooltipIdForStudent1');
    expect(tooltip.contains('Last Progress:')).to.equal(true);
    expect(tooltip.contains('10/01/2020')).to.equal(true);
  });

  it('renders name as a link when scriptUrlForStudent returns a link', () => {
    const scriptUrlForStudentStub = sinon.stub(
      urlHelpers,
      'scriptUrlForStudent'
    );
    scriptUrlForStudentStub.returns('/student-link');

    const wrapper = shallow(<ProgressTableStudentName {...DEFAULT_PROPS} />);
    const link = wrapper.find('a[href="/student-link"]');
    expect(link).to.have.lengthOf(1);
    expect(link.contains(DEFAULT_PROPS.name)).to.equal(true);
  });

  it('renders name (not link) when scriptUrlForStudent returns null', () => {
    const scriptUrlForStudentStub = sinon.stub(
      urlHelpers,
      'scriptUrlForStudent'
    );
    scriptUrlForStudentStub.returns(null);

    const wrapper = shallow(<ProgressTableStudentName {...DEFAULT_PROPS} />);
    const link = wrapper.find('a');
    expect(link).to.have.lengthOf(0);
    expect(wrapper.contains(DEFAULT_PROPS.name)).to.equal(true);
  });
});
