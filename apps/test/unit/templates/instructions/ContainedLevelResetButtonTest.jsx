import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import * as CodeStudioLevels from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {UnconnectedContainedLevelResetButton as ContainedLevelResetButton} from '@cdo/apps/templates/instructions/ContainedLevelResetButton';
import experiments from '@cdo/apps/util/experiments';



describe('ContainedLevelResetButton', () => {
  let queryUserProgressSpy;
  beforeEach(() => {
    queryUserProgressSpy = jest.fn();
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
    expect(wrapper.isEmptyRender()).toBe(true);
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
    const button = wrapper.find('Button');
    expect(button.props().disabled).toBe(true);
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
    const button = wrapper.find('Button');
    expect(button.props().disabled).toBe(false);
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
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('queries user progress after successfully resetting level', async () => {
    const resetContainedLevelStub = jest.spyOn(CodeStudioLevels, 'resetContainedLevel').mockClear()
      .mockReturnValue(Promise.resolve());

    const wrapper = shallow(
      <ContainedLevelResetButton
        userId={1}
        queryUserProgress={queryUserProgressSpy}
        hasLevelResults
        userRoleInCourse="Instructor"
        codeIsRunning={false}
      />
    );
    const button = wrapper.find('Button');

    button.simulate('click');
    await setTimeout(() => {}, 50);

    expect(resetContainedLevelStub).toHaveBeenCalled().once;
    expect(queryUserProgressSpy).toHaveBeenCalled().once;
  });
});
