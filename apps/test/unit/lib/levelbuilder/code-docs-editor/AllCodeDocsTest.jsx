import React from 'react';
import {shallow} from 'enzyme';
import AllCodeDocs from '@cdo/apps/lib/levelbuilder/code-docs-editor/AllCodeDocs';
import {expect} from '../../../../util/reconfiguredChai';

describe('AllCodeDocs', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      programmingEnvironments: [
        {
          id: 1,
          name: 'applab',
          title: 'App Lab',
        },
        {
          id: 2,
          name: 'spritelab',
        },
        {
          id: 3,
          name: 'gamelab',
          title: 'Game Lab',
        },
      ],
      allCategories: [
        {
          id: 100,
          environmentId: 2,
          environmentName: 'spritelab',
          key: 'math',
          formattedName: 'Spritelab: Math',
        },
        {
          id: 200,
          environmentId: 1,
          environmentName: 'applab',
          key: 'uicontrols',
          formattedName: 'App Lab: UI Controls',
        },
        {
          id: 300,
          environmentId: 3,
          environmentName: 'gamelab',
          key: 'sprites',
          formattedName: 'Game Lab: Sprites',
        },
      ],
    };
  });

  it('has ProgrammingExpressionsTable and ProgrammingEnvironmentsTable on load', () => {
    const wrapper = shallow(<AllCodeDocs {...defaultProps} />);
    expect(wrapper.find('ProgrammingEnvironmentsTable').length).to.equal(1);
    expect(wrapper.find('ProgrammingEnvironmentsTable').first().props().hidden)
      .to.be.false;
    expect(wrapper.find('ProgrammingExpressionsTable').length).to.equal(1);
    expect(wrapper.find('ProgrammingExpressionsTable').first().props().hidden)
      .to.be.true;
  });

  it('switches visible table when toggle is pressed', () => {
    const wrapper = shallow(<AllCodeDocs {...defaultProps} />);
    expect(wrapper.find('ProgrammingEnvironmentsTable').props().hidden).to.be
      .false;
    expect(wrapper.find('ProgrammingExpressionsTable').props().hidden).to.be
      .true;

    const environmentsButton = wrapper.find('button').at(0);
    const expressionsButton = wrapper.find('button').at(1);

    // Can switch from showing environments to showing expressions
    expressionsButton.simulate('click');
    expect(wrapper.find('ProgrammingEnvironmentsTable').props().hidden).to.be
      .true;
    expect(wrapper.find('ProgrammingExpressionsTable').props().hidden).to.be
      .false;

    // And we can go back again
    environmentsButton.simulate('click');
    expect(wrapper.find('ProgrammingEnvironmentsTable').props().hidden).to.be
      .false;
    expect(wrapper.find('ProgrammingExpressionsTable').props().hidden).to.be
      .true;

    // If we click the button for the state we're in, nothing happens
    environmentsButton.simulate('click');
    expect(wrapper.find('ProgrammingEnvironmentsTable').props().hidden).to.be
      .false;
    expect(wrapper.find('ProgrammingExpressionsTable').props().hidden).to.be
      .true;
  });
});
