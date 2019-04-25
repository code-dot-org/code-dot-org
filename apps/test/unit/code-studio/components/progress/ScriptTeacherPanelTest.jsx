import React from 'react';
import {shallow} from 'enzyme';
import {assert, expect} from '../../../../util/reconfiguredChai';
import {UnconnectedScriptTeacherPanel as ScriptTeacherPanel} from '@cdo/apps/code-studio/components/progress/ScriptTeacherPanel';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import TeacherPanel from '@cdo/apps/code-studio/components/TeacherPanel';
import SectionSelector from '@cdo/apps/code-studio/components/progress/SectionSelector';
import ViewAsToggle from '@cdo/apps/code-studio/components/progress/ViewAsToggle';
import commonMsg from '@cdo/locale';
import FontAwesome from '../../../../../src/templates/FontAwesome';

const MINIMUM_PROPS = {
  viewAs: ViewType.Student,
  hasSections: false,
  sectionsAreLoaded: false,
  scriptHasLockableStages: false,
  scriptAllowsHiddenStages: false,
  unlockedStageNames: []
};

describe('ScriptTeacherPanel', () => {
  it('initial view as student', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel {...MINIMUM_PROPS} viewAs={ViewType.Student} />
    );

    expect(
      wrapper.containsMatchingElement(
        <TeacherPanel>
          <h3>{commonMsg.teacherPanel()}</h3>
          <div>
            <ViewAsToggle />
            <div>{commonMsg.loading()}</div>
          </div>
        </TeacherPanel>
      )
    ).to.be.true;
  });

  it('initial view as teacher', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel {...MINIMUM_PROPS} viewAs={ViewType.Teacher} />
    );
    assert(
      wrapper.containsMatchingElement(
        <TeacherPanel>
          <h3>{commonMsg.teacherPanel()}</h3>
          <div>
            <ViewAsToggle />
            <div>{commonMsg.loading()}</div>
          </div>
        </TeacherPanel>
      )
    );
  });

  it('shows loading message when sections are not loaded', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel {...MINIMUM_PROPS} sectionsAreLoaded={false} />
    );
    assert(wrapper.containsMatchingElement(<div>{commonMsg.loading()}</div>));
  });

  it('hides loading message when sections are loaded', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel {...MINIMUM_PROPS} sectionsAreLoaded={true} />
    );
    assert(!wrapper.containsMatchingElement(<div>{commonMsg.loading()}</div>));
  });

  it('shows SectionSelector if scriptHasLockableStages', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel {...MINIMUM_PROPS} scriptHasLockableStages={true} />
    );
    assert(wrapper.containsMatchingElement(<SectionSelector />));
  });

  it('shows SectionSelector if scriptAllowsHiddenStages', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel {...MINIMUM_PROPS} scriptAllowsHiddenStages={true} />
    );
    assert(wrapper.containsMatchingElement(<SectionSelector />));
  });

  it('hides SectionSelector if neither scriptAllowsHiddenStages nor scriptHasLockableStages', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel
        {...MINIMUM_PROPS}
        scriptHasLockableStages={false}
        scriptAllowsHiddenStages={false}
      />
    );
    assert(!wrapper.containsMatchingElement(<SectionSelector />));
  });

  it('shows section selection instructions if viewing as a teacher, and has sections and lockable stages', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel
        {...MINIMUM_PROPS}
        viewAs={ViewType.Teacher}
        scriptHasLockableStages={true}
        hasSections={true}
      />
    );
    assert(
      wrapper.containsMatchingElement(
        <div>
          <div>{commonMsg.selectSectionInstructions()}</div>
        </div>
      )
    );
  });

  it('adds a warning if there are also unlocked stages', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel
        {...MINIMUM_PROPS}
        viewAs={ViewType.Teacher}
        scriptHasLockableStages={true}
        hasSections={true}
        unlockedStageNames={['stage1', 'stage2']}
      />
    );
    assert(
      wrapper.containsMatchingElement(
        <div>
          <div>{commonMsg.selectSectionInstructions()}</div>
          <div>
            <div>
              <FontAwesome icon="exclamation-triangle" />
              <div>{commonMsg.dontForget()}</div>
            </div>
            <div>
              {commonMsg.lockFollowing()}
              <ul>
                <li>stage1</li>
                <li>stage2</li>
              </ul>
            </div>
          </div>
        </div>
      )
    );
  });

  describe('StudentTable', () => {
    const students = [{id: 1, name: 'Student 1'}, {id: 2, name: 'Student 2'}];

    it('displays StudentTable for teacher with students', () => {
      const wrapper = shallow(
        <ScriptTeacherPanel
          {...MINIMUM_PROPS}
          viewAs={ViewType.Teacher}
          students={students}
          onSelectUser={() => {}}
          getSelectedUserId={() => {}}
        />
      );
      expect(wrapper.find('StudentTable')).to.have.length(1);
    });

    it('does not display StudentTable for teacher with no students', () => {
      const wrapper = shallow(
        <ScriptTeacherPanel
          {...MINIMUM_PROPS}
          viewAs={ViewType.Teacher}
          students={[]}
        />
      );
      expect(wrapper.find('StudentTable')).to.have.length(0);
    });

    it('does not display StudentTable for student', () => {
      const wrapper = shallow(
        <ScriptTeacherPanel
          {...MINIMUM_PROPS}
          viewAs={ViewType.Student}
          students={students}
        />
      );
      expect(wrapper.find('StudentTable')).to.have.length(0);
    });
  });
});
