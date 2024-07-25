import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import SelectedStudentPairing from '@cdo/apps/code-studio/components/progress/teacherPanel/SelectedStudentPairing';

const DEFAULT_PROPS = {
  partnerNames: ['Student 1'],
  partnerCount: 1,
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<SelectedStudentPairing {...props} />);
};

describe('SelectedStudentPairing', () => {
  it('displays partner info if paired with 1 partner', () => {
    const wrapper = setUp();
    const tooltip = wrapper.find('Tooltip');

    expect(wrapper.contains('Worked With:')).toBe(true);
    expect(wrapper.contains('Student 1')).toBe(true);
    expect(tooltip).toHaveLength(0);
  });

  it('displays partner info if paired with 2 partners', () => {
    const props = {
      partnerNames: ['Student 1', 'Student 2'],
      partnerCount: 2,
    };
    const wrapper = setUp(props);
    const tooltip = wrapper.find('Tooltip');

    expect(wrapper.contains('Worked With:')).toBe(true);
    expect(wrapper.contains('Student 1 + 1')).toBe(true);
    expect(tooltip).toHaveLength(1);
    expect(tooltip.prop('text')).toBe('Student 1, Student 2');
  });

  it('displays partner info if paired with 1 unknown partner', () => {
    const props = {
      partnerNames: [],
      partnerCount: 1,
    };
    const wrapper = setUp(props);
    const tooltip = wrapper.find('Tooltip');

    expect(wrapper.contains('Worked With:')).toBe(true);
    expect(wrapper.contains('1 other student(s)')).toBe(true);
    expect(tooltip).toHaveLength(0);
  });

  it('displays partner info if paired with 1 known partner and 1 unknown partner', () => {
    const props = {
      partnerNames: ['Student 1'],
      partnerCount: 2,
    };
    const wrapper = setUp(props);
    const tooltip = wrapper.find('Tooltip');

    expect(wrapper.contains('Worked With:')).toBe(true);
    expect(wrapper.contains('Student 1 + 1')).toBe(true);
    expect(tooltip).toHaveLength(1);
    expect(tooltip.prop('text')).toBe('Student 1 + 1 other student(s)');
  });

  it('displays partner info if paired with 2 known partners and 2 unknown partners', () => {
    const props = {
      partnerNames: ['Student 1', 'Student 2'],
      partnerCount: 4,
    };
    const wrapper = setUp(props);
    const tooltip = wrapper.find('Tooltip');

    expect(wrapper.contains('Worked With:')).toBe(true);
    expect(wrapper.contains('Student 1 + 3')).toBe(true);
    expect(tooltip).toHaveLength(1);
    expect(tooltip.prop('text')).toBe(
      'Student 1, Student 2 + 2 other student(s)'
    );
  });
});
