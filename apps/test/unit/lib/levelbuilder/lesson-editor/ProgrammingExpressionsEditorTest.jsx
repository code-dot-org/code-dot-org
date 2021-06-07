import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedProgrammingExpressionsEditor as ProgrammingExpressionsEditor} from '@cdo/apps/lib/levelbuilder/lesson-editor/ProgrammingExpressionsEditor';
import {Provider} from 'react-redux';
import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers
} from '@cdo/apps/redux';
import reducers, {
  init
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';

describe('ProgrammingExpressionsEditor', () => {
  let defaultProps,
    addProgrammingExpression,
    removeProgrammingExpression,
    store;
  beforeEach(() => {
    stubRedux();
    registerReducers({
      ...reducers
    });

    store = getStore();
    store.dispatch(init([], {}, [], false));

    addProgrammingExpression = sinon.spy();
    removeProgrammingExpression = sinon.spy();
    defaultProps = {
      programmingExpressions: [
        {
          id: 1,
          key: '1',
          name: 'playSound',
          category: 'UI controls',
          programmingEnvironmentName: 'applab'
        },
        {
          id: 2,
          key: '2',
          name: 'stopSound',
          category: 'UI controls',
          programmingEnvironmentName: 'applab'
        }
      ],
      programmingEnvironments: [],
      addProgrammingExpression,
      removeProgrammingExpression
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
    expect(wrapper.find('tr').length).to.equal(3);
  });

  it('can remove a programming expression', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ProgrammingExpressionsEditor {...defaultProps} />
      </Provider>
    );
    const numProgrammingExpressions = wrapper.find('tr').length;
    expect(numProgrammingExpressions).at.least(2);
    // Find one of the "remove" buttons and click it
    const removeProgrammingExpressionButton = wrapper
      .find('.unit-test-remove-programming-expression')
      .first();
    removeProgrammingExpressionButton.simulate('mouseDown');
    const removeDialog = wrapper.find('Dialog');
    const deleteButton = removeDialog.find('button').at(1);
    deleteButton.simulate('click');
    expect(removeProgrammingExpression).to.have.been.calledOnce;
  });

  it('can cancel removing a programmingExpression', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ProgrammingExpressionsEditor {...defaultProps} />
      </Provider>
    );
    const numProgrammingExpressions = wrapper.find('tr').length;
    expect(numProgrammingExpressions).at.least(2);
    // Find one of the "remove" buttons and click it
    const removeProgrammingExpressionButton = wrapper
      .find('.unit-test-remove-programming-expression')
      .first();
    removeProgrammingExpressionButton.simulate('mouseDown');
    const removeDialog = wrapper.find('Dialog');
    const cancelButton = removeDialog.find('button').at(0);
    cancelButton.simulate('click');
    expect(removeProgrammingExpression).not.to.have.been.called;
  });

  it('clicking add a programming expression opens dialog', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ProgrammingExpressionsEditor {...defaultProps} />
      </Provider>
    );
    const addProgrammingExpressionButton = wrapper.find('Button');
    addProgrammingExpressionButton.simulate('click');
    expect(wrapper.find('FindProgrammingExpressionDialog')).to.have.length(1);
  });
});
