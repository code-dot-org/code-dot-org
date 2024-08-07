import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import * as CodeStudioLevels from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {UnconnectedContainedLevelResetButton as ContainedLevelResetButton} from '@cdo/apps/templates/instructions/ContainedLevelResetButton';
import experiments from '@cdo/apps/util/experiments';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('ContainedLevelResetButton', () => {
  let queryUserProgressSpy;
  beforeEach(() => {
    queryUserProgressSpy = sinon.spy();
    experiments.setEnabled('instructorPredictLevelReset', true);
  });

  it('displays nothing if user is not an instructor', () => {
    const wrapper = shallow(
      <ContainedLevelResetButton
        userId={1}
        queryUserProgress={queryUserProgressSpy}
        hasLevelResults
        userRoleInCourse="Participant"
        codeIsRunning={false}
      />
    );
    expect(wrapper.isEmptyRender()).to.be.true;
  });

  it('display disabled button if level doesnt have results', () => {
    const wrapper = shallow(
      <ContainedLevelResetButton
        userId={1}
        queryUserProgress={queryUserProgressSpy}
        hasLevelResults={false}
        userRoleInCourse="Instructor"
        codeIsRunning={false}
      />
    );
    const button = wrapper.find({name: 'containedLevelResetButton'});
    expect(button.props().disabled).to.be.true;
  });

  it('display enabled button if level doesnt have results', () => {
    const wrapper = shallow(
      <ContainedLevelResetButton
        userId={1}
        queryUserProgress={queryUserProgressSpy}
        hasLevelResults
        userRoleInCourse="Instructor"
        codeIsRunning={false}
      />
    );
    const button = wrapper.find({name: 'containedLevelResetButton'});
    expect(button.props().disabled).to.be.false;
  });

  it('displays nothing if teacher is viewing student work', () => {
    const wrapper = shallow(
      <ContainedLevelResetButton
        userId={1}
        teacherViewingStudentWork={true}
        queryUserProgress={queryUserProgressSpy}
        hasLevelResults
        userRoleInCourse="Instructor"
        codeIsRunning={false}
      />
    );
    expect(wrapper.isEmptyRender()).to.be.true;
  });

  it('queries user progress after successfully resetting level', async () => {
    const resetContainedLevelStub = sinon
      .stub(CodeStudioLevels, 'resetContainedLevel')
      .returns(Promise.resolve());

    const wrapper = shallow(
      <ContainedLevelResetButton
        userId={1}
        queryUserProgress={queryUserProgressSpy}
        hasLevelResults
        userRoleInCourse="Instructor"
        codeIsRunning={false}
      />
    );
    const button = wrapper.find({name: 'containedLevelResetButton'});

    button.simulate('click');
    await setTimeout(() => {}, 50);

    expect(resetContainedLevelStub).to.have.been.called.once;
    expect(queryUserProgressSpy).to.have.been.called.once;
  });
});
