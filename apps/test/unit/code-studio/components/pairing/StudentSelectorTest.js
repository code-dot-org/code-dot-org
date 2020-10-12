import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import StudentSelector from '@cdo/apps/code-studio/components/pairing/StudentSelector';
import {shallow} from 'enzyme';

describe('StudentSelector', () => {
  describe('with more than 4 students selected', () => {
    const students = [
      {id: 1, name: 'a'},
      {id: 2, name: 'b'},
      {id: 3, name: 'c'},
      {id: 4, name: 'd'},
      {id: 5, name: 'e'}
    ];

    it('displays warning message', () => {
      const wrapper = shallow(
        <StudentSelector students={students} handleSubmit={() => {}} />
      );
      expect(wrapper.find('p')).to.have.lengthOf(0);
      wrapper.setState({selectedStudentIds: [1, 2, 3, 4]});
      expect(wrapper.find('p')).to.have.lengthOf(1);
    });

    it('disables remaining buttons', () => {
      const wrapper = shallow(
        <StudentSelector students={students} handleSubmit={() => {}} />
      );
      expect(
        wrapper.find('button').filterWhere(item => {
          return item.prop('disabled') === true;
        })
      ).to.have.lengthOf(0);
      wrapper.setState({selectedStudentIds: [1, 2, 3, 4]});
      expect(
        wrapper.find('button').filterWhere(item => {
          return item.prop('disabled') === true;
        })
      ).to.have.lengthOf(1);
    });

    it('assigns class names to buttons correctly', () => {
      const wrapper = shallow(
        <StudentSelector students={students} handleSubmit={() => {}} />
      );
      expect(wrapper.find('.selectable')).to.have.lengthOf(5);
      wrapper.setState({selectedStudentIds: [1, 2, 3]});
      expect(wrapper.find('.selectable')).to.have.lengthOf(2);
      expect(wrapper.find('.selected')).to.have.lengthOf(3);
    });

    it('assigns updated styles to clicked buttons', () => {
      const wrapper = shallow(
        <StudentSelector students={students} handleSubmit={() => {}} />
      );
      let btnBackground = wrapper
        .find('button')
        .at(0)
        .props().style.backgroundColor;
      expect(btnBackground).to.equal('white');
      wrapper.setState({selectedStudentIds: [1]});
      btnBackground = wrapper
        .find('button')
        .at(0)
        .props().style.backgroundColor;
      expect(btnBackground).to.equal('#0094ca');
    });
  });
});
