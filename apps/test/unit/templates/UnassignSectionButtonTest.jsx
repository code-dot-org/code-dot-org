import {assert} from '../../util/reconfiguredChai';
import React from 'react';
import {mount} from 'enzyme';
import i18n from '@cdo/locale';
import {UnconnectedUnassignSectionButton as UnassignSectionButton} from '@cdo/apps/templates/UnassignSectionButton';

const DEFAULT_PROPS = {
  sectionId: 1,
  courseName: 'mycourse',
  sectionName: 'mysection',
  buttonLocationAnalytics: 'course-overview',
  initialUnitId: 2,
  initialCourseId: 3,
  unassignSection: () => {},
  isRtl: false,
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return mount(<UnassignSectionButton {...props} />);
};

describe('UnassignSectionButton', () => {
  it('turns grey when user hovers over, icon and text change', () => {
    const wrapper = setUp();

    assert.equal(wrapper.find('Button').props().text, i18n.assigned());
    assert.equal(wrapper.find('Button').props().icon, 'check');

    wrapper.find('Button').simulate('mouseOver');

    assert.equal(wrapper.find('Button').props().text, i18n.unassign());
    assert.equal(wrapper.find('Button').props().icon, 'times');
  });

  it('opens unassign dialog when clicked', () => {
    const wrapper = setUp();

    assert.equal(wrapper.find('UnassignSectionDialog').props().isOpen, false);
    wrapper.find('Button').simulate('click');
    assert.equal(wrapper.find('UnassignSectionDialog').props().isOpen, true);
  });
});
