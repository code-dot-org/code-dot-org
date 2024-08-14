import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';

import reducers, {
  initActivities,
  initLevelSearching,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import {UnconnectedProgrammingExpressionsEditor as ProgrammingExpressionsEditor} from '@cdo/apps/lib/levelbuilder/lesson-editor/ProgrammingExpressionsEditor';
import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers,
} from '@cdo/apps/redux';

describe('ProgrammingExpressionsEditor', () => {
  let defaultProps,
    addProgrammingExpression,
    removeProgrammingExpression,
    store;
  beforeEach(() => {
    stubRedux();
    registerReducers({
      ...reducers,
    });

    store = getStore();
    store.dispatch(initActivities([]));
    store.dispatch(
      initLevelSearching({searchOptions: {}, programmingEnvironments: []})
    );

    addProgrammingExpression = jest.fn();
    removeProgrammingExpression = jest.fn();
    defaultProps = {
      programmingExpressions: [
        {
          id: 1,
          key: '1',
          name: 'playSound',
          category: 'UI controls',
          programmingEnvironmentName: 'applab',
        },
        {
          id: 2,
          key: '2',
          name: 'stopSound',
          category: 'UI controls',
          programmingEnvironmentName: 'applab',
        },
      ],
      programmingEnvironments: [],
      addProgrammingExpression,
      removeProgrammingExpression,
    };
  });

  afterEach(() => {
    restoreRedux();
  });

  it('renders default props', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ProgrammingExpressionsEditor {...defaultProps} />
      </Provider>
    );
    expect(wrapper.find('tr').length).toBe(3);
  });

  it('can remove a programming expression', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ProgrammingExpressionsEditor {...defaultProps} />
      </Provider>
    );
    const numProgrammingExpressions = wrapper.find('tr').length;
    expect(numProgrammingExpressions).toBeGreaterThanOrEqual(2);
    // Find one of the "remove" buttons and click it
    const removeProgrammingExpressionButton = wrapper
      .find('.unit-test-remove-programming-expression')
      .first();
    removeProgrammingExpressionButton.simulate('mouseDown');
    const removeDialog = wrapper.find('Dialog');
    const deleteButton = removeDialog.find('button').at(2);
    deleteButton.simulate('click');
    expect(removeProgrammingExpression).toHaveBeenCalledTimes(1);
  });

  it('can cancel removing a programmingExpression', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ProgrammingExpressionsEditor {...defaultProps} />
      </Provider>
    );
    const numProgrammingExpressions = wrapper.find('tr').length;
    expect(numProgrammingExpressions).toBeGreaterThanOrEqual(2);
    // Find one of the "remove" buttons and click it
    const removeProgrammingExpressionButton = wrapper
      .find('.unit-test-remove-programming-expression')
      .first();
    removeProgrammingExpressionButton.simulate('mouseDown');
    const removeDialog = wrapper.find('Dialog');
    const cancelButton = removeDialog.find('button').at(1);
    cancelButton.simulate('click');
    expect(removeProgrammingExpression).not.toHaveBeenCalled();
  });

  it('clicking add a programming expression opens dialog', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ProgrammingExpressionsEditor {...defaultProps} />
      </Provider>
    );
    const addProgrammingExpressionButton = wrapper.find('Button');
    addProgrammingExpressionButton.simulate('click');
    expect(wrapper.find('FindProgrammingExpressionDialog')).toHaveLength(1);
  });
});
