import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedUnassignSectionButton as UnassignSectionButton} from '@cdo/apps/templates/UnassignSectionButton';
import i18n from '@cdo/locale';

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

    expect(wrapper.find('Button').props().text).toEqual(i18n.assigned());
    expect(wrapper.find('Button').props().icon).toEqual('check');

    wrapper.find('Button').simulate('mouseOver');

    expect(wrapper.find('Button').props().text).toEqual(i18n.unassign());
    expect(wrapper.find('Button').props().icon).toEqual('times');
  });

  it('opens unassign dialog when clicked', () => {
    const wrapper = setUp();

    expect(wrapper.find('UnassignSectionDialog').props().isOpen).toEqual(false);
    wrapper.find('Button').simulate('click');
    expect(wrapper.find('UnassignSectionDialog').props().isOpen).toEqual(true);
  });
});
