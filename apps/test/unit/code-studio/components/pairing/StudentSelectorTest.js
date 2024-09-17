import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import StudentSelector from '@cdo/apps/code-studio/components/pairing/StudentSelector';

describe('StudentSelector', () => {
  describe('with more than 4 students selected', () => {
    const students = [
      {id: 1, name: 'a'},
      {id: 2, name: 'b'},
      {id: 3, name: 'c'},
      {id: 4, name: 'd'},
      {id: 5, name: 'e'},
    ];

    it('displays warning message', () => {
      const wrapper = shallow(
        <StudentSelector students={students} handleSubmit={() => {}} />
      );
      expect(wrapper.find('p')).toHaveLength(0);
      wrapper.setState({selectedStudentIds: [1, 2, 3, 4]});
      expect(wrapper.find('p')).toHaveLength(1);
    });

    it('disables remaining buttons', () => {
      const wrapper = shallow(
        <StudentSelector students={students} handleSubmit={() => {}} />
      );
      expect(
        wrapper.find('button').filterWhere(item => {
          return item.prop('disabled') === true;
        })
      ).toHaveLength(0);
      wrapper.setState({selectedStudentIds: [1, 2, 3, 4]});
      expect(
        wrapper.find('button').filterWhere(item => {
          return item.prop('disabled') === true;
        })
      ).toHaveLength(1);
    });

    it('assigns class names to buttons correctly', () => {
      const wrapper = shallow(
        <StudentSelector students={students} handleSubmit={() => {}} />
      );
      expect(wrapper.find('.selectable')).toHaveLength(5);
      wrapper.setState({selectedStudentIds: [1, 2, 3]});
      expect(wrapper.find('.selectable')).toHaveLength(2);
      expect(wrapper.find('.selected')).toHaveLength(3);
    });

    it('assigns updated styles to clicked buttons', () => {
      const wrapper = shallow(
        <StudentSelector students={students} handleSubmit={() => {}} />
      );
      let btnBackground = wrapper.find('button').at(0).props()
        .style.backgroundColor;
      expect(btnBackground).toBe('white');
      wrapper.setState({selectedStudentIds: [1]});
      btnBackground = wrapper.find('button').at(0).props()
        .style.backgroundColor;
      expect(btnBackground).toBe('#0094ca');
    });
  });
});
