import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedProgrammingExpressionsEditor as ProgrammingExpressionsEditor} from '@cdo/apps/lib/levelbuilder/lesson-editor/ProgrammingExpressionsEditor';

describe('ProgrammingExpressionsEditor', () => {
  let defaultProps, addProgrammingExpression, removeProgrammingExpression;
  beforeEach(() => {
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

  it('renders default props', () => {
    const wrapper = mount(<ProgrammingExpressionsEditor {...defaultProps} />);
    expect(wrapper.find('tr').length).to.equal(3);
  });

  it('can remove a programming expression', () => {
    const wrapper = mount(<ProgrammingExpressionsEditor {...defaultProps} />);
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
    const wrapper = mount(<ProgrammingExpressionsEditor {...defaultProps} />);
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
    const wrapper = mount(<ProgrammingExpressionsEditor {...defaultProps} />);
    const addProgrammingExpressionButton = wrapper.find('Button');
    addProgrammingExpressionButton.simulate('click');
    expect(wrapper.find('FindProgrammingExpressionDialog')).to.have.length(1);
  });
});
