import React from 'react';
import {shallow, mount} from 'enzyme';
import ProgrammingEnvironmentsTable from '@cdo/apps/lib/levelbuilder/code-docs-editor/ProgrammingEnvironmentsTable';
import {expect} from '../../../../util/reconfiguredChai';

describe('ProgrammingEnvironmentsTable', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      programmingEnvironments: [
        {
          id: 1,
          name: 'applab',
          title: 'App Lab',
          editPath: '/programming_environment/1/edit',
        },
        {
          id: 2,
          name: 'spritelab',
          editPath: '/programming_environment/2/edit',
        },
        {
          id: 3,
          name: 'gamelab',
          title: 'Game Lab',
          editPath: '/programming_environment/3/edit',
        },
      ],
      hidden: false,
    };
  });

  it('shows table with environments', () => {
    const wrapper = shallow(<ProgrammingEnvironmentsTable {...defaultProps} />);

    expect(wrapper.find('Header').length).to.equal(1);
    expect(wrapper.find('Body').length).to.equal(1);
    expect(wrapper.find('Body').props().rows).to.eql(
      defaultProps.programmingEnvironments
    );
  });

  it('doesnt show table if hidden is true', () => {
    const wrapper = shallow(
      <ProgrammingEnvironmentsTable {...defaultProps} hidden />
    );

    expect(wrapper.find('Header').length).to.equal(0);
    expect(wrapper.find('Body').length).to.equal(0);
  });

  it('shows confirmation dialog if destroy is pressed', () => {
    // We need mount here to access the buttons
    const wrapper = mount(<ProgrammingEnvironmentsTable {...defaultProps} />);

    wrapper.find('BodyRow').at(1).find('Button').at(1).simulate('click');
    expect(wrapper.find('StylizedBaseDialog').length).to.equal(1);
  });
});
