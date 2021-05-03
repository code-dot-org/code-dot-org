import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import ProgressTableStudentName from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableStudentName';
import CollapserIcon from '@cdo/apps/templates/CollapserIcon';
import moment from 'moment';

const DEFAULT_PROPS = {
  name: 'Joe',
  studentId: 1,
  sectionId: 1,
  scriptId: 1,
  lastTimestamp: 1611964800,
  studentUrl: '/student-link',
  onToggleExpand: () => {},
  isExpanded: false
};

describe('ProgressTableStudentName', () => {
  it('renders tooltip with empty state when lastTimeStamp is null', () => {
    const props = {...DEFAULT_PROPS, lastTimestamp: null};
    const wrapper = shallow(<ProgressTableStudentName {...props} />);
    const tooltip = wrapper.find('#tooltipIdForStudent1');
    expect(tooltip.contains('Last Progress:')).to.be.true;
    expect(tooltip.contains('None')).to.be.true;
  });

  it('renders tooltip with timestamp when lastTimeStamp is present', () => {
    const wrapper = shallow(<ProgressTableStudentName {...DEFAULT_PROPS} />);
    const tooltip = wrapper.find('#tooltipIdForStudent1');
    expect(tooltip.contains('Last Progress:')).to.be.true;
    expect(tooltip.contains('01/30/2021')).to.be.true;
  });

  it('renders tooltip timestamp formatted for locale with moment', () => {
    moment.locale('fr');
    const wrapper = shallow(<ProgressTableStudentName {...DEFAULT_PROPS} />);
    const tooltip = wrapper.find('#tooltipIdForStudent1');
    expect(tooltip.contains('Last Progress:')).to.be.true;
    expect(tooltip.contains('30/01/2021')).to.be.true;
  });

  it('renders name as a link to studentUrl', () => {
    const wrapper = shallow(<ProgressTableStudentName {...DEFAULT_PROPS} />);
    const link = wrapper.find('a[href="/student-link"]');
    expect(link).to.have.lengthOf(1);
    expect(link.contains(DEFAULT_PROPS.name)).to.be.true;
  });

  it('renders CollapserIcon when showSectionProgressDetails is true', () => {
    const props = {...DEFAULT_PROPS, showSectionProgressDetails: true};
    const wrapper = shallow(<ProgressTableStudentName {...props} />);
    expect(wrapper.find(CollapserIcon)).to.have.lengthOf(1);
  });

  it('hide CollapserIcon when showSectionProgressDetails is false', () => {
    const props = {...DEFAULT_PROPS, showSectionProgressDetails: false};
    const wrapper = shallow(<ProgressTableStudentName {...props} />);
    expect(wrapper.find(CollapserIcon)).to.have.lengthOf(0);
  });
});
