import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import CloneProgrammingExpressionDialog, {
  CloneFormDialog,
} from '@cdo/apps/lib/levelbuilder/code-docs-editor/CloneProgrammingExpressionDialog';

describe('CloneFormDialog', () => {
  let defaultProps, onCloneSuccessSpy;

  beforeEach(() => {
    onCloneSuccessSpy = jest.fn();
    defaultProps = {
      itemToClone: {
        id: 7,
        name: 'makeSprite',
        environmentId: 3,
      },
      programmingEnvironmentsForSelect: [
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
      categoriesForSelect: [
        {
          environmentName: 'spritelab',
          key: 'math',
          formattedName: 'Spritelab: Math',
        },
        {
          environmentName: 'applab',
          key: 'uicontrols',
          formattedName: 'App Lab: UI Controls',
        },
        {
          environmentName: 'gamelab',
          key: 'sprites',
          formattedName: 'Game Lab: Sprites',
        },
      ],
      onClose: () => {},
      onCloneSuccess: onCloneSuccessSpy,
    };
  });

  it('displays dialog with environment dropdown on first render', () => {
    const wrapper = shallow(<CloneFormDialog {...defaultProps} />);
    const environmentSelect = wrapper.find('select').at(0);
    // Expressions can't be cloned to their own environment, so gamelab should not appear in the dropdown in this case. However, there is an empty option, so we're expecting 3 options
    expect(environmentSelect.find('option').length).toBe(3);
    expect(environmentSelect.find('option').map(o => o.props().value)).toEqual([
      '',
      'applab',
      'spritelab',
    ]);
    expect(environmentSelect.find('option').map(o => o.text())).toEqual([
      '',
      'App Lab',
      'spritelab',
    ]);
  });

  it('displays category dropdown after environment is selected', () => {
    const wrapper = shallow(<CloneFormDialog {...defaultProps} />);
    expect(wrapper.find('select').length).toBe(1);
    wrapper
      .find('select')
      .at(0)
      .simulate('change', {target: {value: 'applab'}});
    // Now there should be a dropdown for the category
    expect(wrapper.find('select').length).toBe(2);
    const categorySelect = wrapper.find('select').at(1);
    // This dropdown filters to only the categories in the selected programming environment, plus an empty option
    expect(categorySelect.find('option').length).toBe(2);
    expect(categorySelect.find('option').map(o => o.props().value)).toEqual([
      '',
      'uicontrols',
    ]);
    expect(categorySelect.find('option').map(o => o.text())).toEqual([
      '',
      'App Lab: UI Controls',
    ]);
  });

  it('calls clone when submit is pressed', () => {
    // The buttons in the dialog are owned by StylizedBaseDialog here, so we need to mount in order to access them
    const wrapper = mount(<CloneFormDialog {...defaultProps} />);
    wrapper
      .find('select')
      .at(0)
      .simulate('change', {target: {value: 'applab'}});
    wrapper
      .find('select')
      .at(1)
      .simulate('change', {target: {value: 'uicontrols'}});

    const returnData = {editUrl: '/programming_expressions/100/edit'};
    const fetchStub = jest
      .spyOn(window, 'fetch')
      .mockClear()
      .mockImplementation();
    fetchStub.mockImplementation((...args) => {
      if (args[0] === '/programming_expressions/7/clone') {
        return Promise.resolve({ok: true, json: () => returnData});
      }
    });
    wrapper.find('Button').last().simulate('click');
    return new Promise(resolve => setTimeout(resolve, 0)).then(() => {
      expect(onCloneSuccessSpy).toHaveBeenCalledTimes(1);
      fetchStub.mockRestore();
    });
  });
});

describe('CloneProgrammingExpressionDialog integration test', () => {
  it('clones expression then shows success message', () => {
    const wrapper = mount(
      <CloneProgrammingExpressionDialog
        itemToClone={{
          id: 7,
          name: 'makeSprite',
          environmentId: 3,
        }}
        programmingEnvironmentsForSelect={[
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
        ]}
        categoriesForSelect={[
          {
            environmentName: 'spritelab',
            key: 'math',
            formattedName: 'Spritelab: Math',
          },
          {
            environmentName: 'applab',
            key: 'uicontrols',
            formattedName: 'App Lab: UI Controls',
          },
          {
            environmentName: 'gamelab',
            key: 'sprites',
            formattedName: 'Game Lab: Sprites',
          },
        ]}
        onClose={() => {}}
      />
    );
    expect(wrapper.find('select').length).toBe(1);
    wrapper
      .find('select')
      .at(0)
      .simulate('change', {target: {value: 'applab'}});
    const returnData = {editUrl: '/programming_expressions/100/edit'};
    const fetchStub = jest
      .spyOn(window, 'fetch')
      .mockClear()
      .mockImplementation();
    fetchStub.mockImplementation((...args) => {
      if (args[0] === '/programming_expressions/7/clone') {
        return Promise.resolve({ok: true, json: () => returnData});
      }
    });
    wrapper.find('Button').last().simulate('click');
    return new Promise(resolve => setTimeout(resolve, 0)).then(() => {
      wrapper.update();
      expect(wrapper.find('FooterButton').length).toBe(1);
      expect(wrapper.find('TextLink').props().href).toBe(
        '/programming_expressions/100/edit'
      );
      fetchStub.mockRestore();
    });
  });
});
