import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import AllCodeDocs from '@cdo/apps/levelbuilder/code-docs-editor/AllCodeDocs';

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
    expect(wrapper.find('ProgrammingEnvironmentsTable').length).toBe(1);
    expect(
      wrapper.find('ProgrammingEnvironmentsTable').first().props().hidden
    ).toBe(false);
    expect(wrapper.find('ProgrammingExpressionsTable').length).toBe(1);
    expect(
      wrapper.find('ProgrammingExpressionsTable').first().props().hidden
    ).toBe(true);
  });

  it('switches visible table when toggle is pressed', () => {
    const wrapper = shallow(<AllCodeDocs {...defaultProps} />);
    expect(wrapper.find('ProgrammingEnvironmentsTable').props().hidden).toBe(
      false
    );
    expect(wrapper.find('ProgrammingExpressionsTable').props().hidden).toBe(
      true
    );

    const environmentsButton = wrapper.find('button').at(0);
    const expressionsButton = wrapper.find('button').at(1);

    // Can switch from showing environments to showing expressions
    expressionsButton.simulate('click');
    expect(wrapper.find('ProgrammingEnvironmentsTable').props().hidden).toBe(
      true
    );
    expect(wrapper.find('ProgrammingExpressionsTable').props().hidden).toBe(
      false
    );

    // And we can go back again
    environmentsButton.simulate('click');
    expect(wrapper.find('ProgrammingEnvironmentsTable').props().hidden).toBe(
      false
    );
    expect(wrapper.find('ProgrammingExpressionsTable').props().hidden).toBe(
      true
    );

    // If we click the button for the state we're in, nothing happens
    environmentsButton.simulate('click');
    expect(wrapper.find('ProgrammingEnvironmentsTable').props().hidden).toBe(
      false
    );
    expect(wrapper.find('ProgrammingExpressionsTable').props().hidden).toBe(
      true
    );
  });
});
