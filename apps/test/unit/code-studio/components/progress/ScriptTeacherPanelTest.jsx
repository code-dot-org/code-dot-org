import React from 'react';
import {shallow} from 'enzyme';
import {assert, expect} from '../../../../util/reconfiguredChai';
import {UnconnectedScriptTeacherPanel as ScriptTeacherPanel} from '@cdo/apps/code-studio/components/progress/ScriptTeacherPanel';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import TeacherPanel from '@cdo/apps/code-studio/components/TeacherPanel';
import SectionSelector from '@cdo/apps/code-studio/components/progress/SectionSelector';
import ViewAsToggle from '@cdo/apps/code-studio/components/progress/ViewAsToggle';
import i18n from '@cdo/locale';
import FontAwesome from '../../../../../src/templates/FontAwesome';

const MINIMUM_PROPS = {
  viewAs: ViewType.Student,
  hasSections: false,
  sectionsAreLoaded: false,
  scriptHasLockableStages: false,
  scriptAllowsHiddenStages: false,
  unlockedStageNames: [],
  sectionData: null,
  onSelectUser: () => {},
  getSelectedUserId: () => {}
};

const students = [{id: 1, name: 'Student 1'}, {id: 2, name: 'Student 2'}];

describe('ScriptTeacherPanel', () => {
  describe('on script page', () => {
    it('initial view as student', () => {
      const wrapper = shallow(
        <ScriptTeacherPanel {...MINIMUM_PROPS} viewAs={ViewType.Student} />
      );

      expect(
        wrapper.containsMatchingElement(
          <TeacherPanel>
            <h3>{i18n.teacherPanel()}</h3>
            <div>
              <ViewAsToggle />
              <div>{i18n.loading()}</div>
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
            <h3>{i18n.teacherPanel()}</h3>
            <div>
              <ViewAsToggle />
              <div>{i18n.loading()}</div>
            </div>
          </TeacherPanel>
        )
      );
    });
  });

  it('shows loading message when sections are not loaded', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel {...MINIMUM_PROPS} sectionsAreLoaded={false} />
    );
    assert(wrapper.containsMatchingElement(<div>{i18n.loading()}</div>));
  });

  it('hides loading message when sections are loaded', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel {...MINIMUM_PROPS} sectionsAreLoaded={true} />
    );
    assert(!wrapper.containsMatchingElement(<div>{i18n.loading()}</div>));
  });

  it('shows SectionSelector if hasSections and sectionsAreLoaded', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel
        {...MINIMUM_PROPS}
        hasSections={true}
        sectionsAreLoaded={true}
      />
    );
    assert(wrapper.containsMatchingElement(<SectionSelector />));
  });

  it('hides SectionSelector if hasSections is false', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel {...MINIMUM_PROPS} hasSections={false} />
    );
    assert(!wrapper.containsMatchingElement(<SectionSelector />));
  });

  it('hides SectionSelector if sectionsAreLoaded is false', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel {...MINIMUM_PROPS} sectionsAreLoaded={false} />
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
          <div>{i18n.selectSectionInstructions()}</div>
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
          <div>{i18n.selectSectionInstructions()}</div>
          <div>
            <div>
              <FontAwesome icon="exclamation-triangle" />
              <div>{i18n.dontForget()}</div>
            </div>
            <div>
              {i18n.lockFollowing()}
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
    it('displays StudentTable for teacher with students', () => {
      const wrapper = shallow(
        <ScriptTeacherPanel
          {...MINIMUM_PROPS}
          viewAs={ViewType.Teacher}
          students={students}
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

  describe('SelectedStudentInfo', () => {
    describe('on script', () => {
      it('does not display SelectedStudentInfo', () => {
        const wrapper = shallow(
          <ScriptTeacherPanel
            {...MINIMUM_PROPS}
            viewAs={ViewType.Teacher}
            students={students}
            getSelectedUserId={() => {
              return 0;
            }}
          />
        );
        expect(wrapper.find('SelectedStudentInfo')).to.have.length(0);
      });
    });

    describe('on level', () => {
      it('displays SelectedStudentInfo when student selected', () => {
        const wrapper = shallow(
          <ScriptTeacherPanel
            {...MINIMUM_PROPS}
            viewAs={ViewType.Teacher}
            students={students}
            getSelectedUserId={() => {
              return 1;
            }}
            sectionData={{
              section: {
                students: students
              },
              section_script_levels: [{user_id: 1}]
            }}
          />
        );
        expect(wrapper.find('SelectedStudentInfo')).to.have.length(1);
      });
    });
  });

  describe('Example Solutions', () => {
    describe('on script', () => {
      it('does not display example solutions', () => {
        const wrapper = shallow(
          <ScriptTeacherPanel {...MINIMUM_PROPS} viewAs={ViewType.Teacher} />
        );
        expect(wrapper.find('Button')).to.have.length(0);
      });
    });

    describe('on level', () => {
      it('displays example solution for level with one example solution', () => {
        const wrapper = shallow(
          <ScriptTeacherPanel
            {...MINIMUM_PROPS}
            viewAs={ViewType.Teacher}
            sectionData={{
              level_examples: [
                'https://studio.code.org/projects/applab/8cik_q8RCK57-Zv4Xeot_Q/view'
              ],
              section: {
                students: students
              },
              section_script_levels: [{user_id: 1}]
            }}
          />
        );
        expect(wrapper.find('Button')).to.have.length(1);
      });

      it('does not display example solution for level with no example solution', () => {
        const wrapper = shallow(
          <ScriptTeacherPanel
            {...MINIMUM_PROPS}
            viewAs={ViewType.Teacher}
            sectionData={{
              level_examples: null,
              section: {
                students: students
              },
              section_script_levels: [{user_id: 1}]
            }}
          />
        );
        expect(wrapper.find('Button')).to.have.length(0);
      });
    });
  });
});
