import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import NewUnitForm from '@cdo/apps/levelbuilder/unit-editor/NewUnitForm';

describe('NewUnitFormTest', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      families: ['family-1', 'family-2'],
      versionYearOptions: ['1991', '1992'],
      familiesCourseTypes: {
        'family-1': {
          instructor_audience: 'teacher',
          participant_audience: 'student',
          instruction_type: 'teacher_led',
        },
        'family-2': {
          instructor_audience: 'universal_instructor',
          participant_audience: 'teacher',
          instruction_type: 'self_paced',
        },
      },
    };
  });

  it('can create a new unit for multi unit course', () => {
    const wrapper = shallow(<NewUnitForm {...defaultProps} />);
    expect(wrapper.find('NewCourseFields').length).toBe(0);
    expect(wrapper.find('div.savingDetailsAndButton').length).toBe(1);
    expect(wrapper.find('[name="script[name]"]').length).toBe(1);
  });

  it('hitting save opens submit confirmation dialog', () => {
    const wrapper = shallow(<NewUnitForm {...defaultProps} />);

    expect(wrapper.find('BaseDialog').props().isOpen).toBe(false);

    expect(wrapper.find('NewCourseFields').length).toBe(0);
    expect(wrapper.find('div.savingDetailsAndButton').length).toBe(1);
    expect(wrapper.find('[name="script[name]"]').length).toBe(1);

    wrapper.find('div.savingDetailsAndButton').find('button').simulate('click');

    expect(wrapper.find('BaseDialog').props().isOpen).toBe(true);
  });
});
