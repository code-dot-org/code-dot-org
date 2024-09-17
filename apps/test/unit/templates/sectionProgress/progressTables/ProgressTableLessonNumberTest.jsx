import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import ReactTooltip from 'react-tooltip';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import ProgressTableLessonNumber, {
  unitTestExports,
} from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableLessonNumber';
import color from '@cdo/apps/util/color';

const DEFAULT_PROPS = {
  id: 1,
  name: 'Intro to Problem Solving',
  number: 1,
  lockable: false,
  highlighted: false,
  onClick: () => {},
  includeArrow: false,
  isAssessment: false,
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<ProgressTableLessonNumber {...props} />);
};

describe('ProgressTableLessonNumber', () => {
  it('renders tooltip with an icon if isAssessment is true', () => {
    const wrapper = setUp({isAssessment: true});
    const tooltipIcon = wrapper.find({icon: 'check-circle'});
    expect(tooltipIcon).toHaveLength(1);
  });

  it('renders tooltip without an icon if isAssessment is false', () => {
    const wrapper = setUp({isAssessment: false});
    const tooltipIcon = wrapper.find({icon: 'check-circle'});
    expect(tooltipIcon).toHaveLength(0);
  });

  it('renders the name in the tooltip', () => {
    const wrapper = setUp();
    const tooltipComponent = wrapper.find(ReactTooltip);
    expect(tooltipComponent.contains(DEFAULT_PROPS.name)).toBe(true);
  });

  it('calls onClick when clicked', () => {
    const onClickSpy = jest.fn();
    const wrapper = setUp({onClick: onClickSpy});
    wrapper.simulate('click');
    expect(onClickSpy).toHaveBeenCalled();
  });

  it('displays highlighed styles when highlighted is true', () => {
    const wrapper = setUp({highlighted: true});
    expect(wrapper.props().style.backgroundColor).toBe(color.teal);
  });

  it('displays line and arrow when includeArrow is true', () => {
    const wrapper = setUp({includeArrow: true});
    expect(wrapper.find(unitTestExports.LessonArrow)).toHaveLength(1);
  });

  it('displays the lock icon if lockable is true', () => {
    const wrapper = setUp({lockable: true});
    const lockIcon = wrapper.find(FontAwesome).find({icon: 'lock'});
    expect(lockIcon).toHaveLength(1);
  });

  it('displays number if lockable is false', () => {
    const wrapper = setUp({lockable: false});
    const lockIcon = wrapper.find(FontAwesome).find({icon: 'lock'});
    expect(lockIcon).toHaveLength(0);
    expect(wrapper.contains(DEFAULT_PROPS.number)).toBe(true);
  });
});
