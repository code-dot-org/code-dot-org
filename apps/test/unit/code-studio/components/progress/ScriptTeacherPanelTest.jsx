import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/configuredChai';
import {
  UnconnectedScriptTeacherPanel as ScriptTeacherPanel
} from '@cdo/apps/code-studio/components/progress/ScriptTeacherPanel';
import {ViewType} from "@cdo/apps/code-studio/viewAsRedux";
import TeacherPanel from "@cdo/apps/code-studio/components/TeacherPanel";
import SectionSelector from '@cdo/apps/code-studio/components/progress/SectionSelector';
import ViewAsToggle from '@cdo/apps/code-studio/components/progress/ViewAsToggle';
import commonMsg from '@cdo/locale';
import FontAwesome from "../../../../../src/templates/FontAwesome";

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
      <ScriptTeacherPanel
        {...MINIMUM_PROPS}
        viewAs={ViewType.Student}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <TeacherPanel>
        <h3>{commonMsg.teacherPanel()}</h3>
        <div className="content">
          <ViewAsToggle/>
          <div>{commonMsg.loading()}</div>
        </div>
      </TeacherPanel>
    );
  });

  it('initial view as teacher', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel
        {...MINIMUM_PROPS}
        viewAs={ViewType.Teacher}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <TeacherPanel>
        <h3>{commonMsg.teacherPanel()}</h3>
        <div className="content">
          <ViewAsToggle/>
          <div>{commonMsg.loading()}</div>
        </div>
      </TeacherPanel>
    );
  });

  it('shows loading message when sections are not loaded', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel
        {...MINIMUM_PROPS}
        sectionsAreLoaded={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>{commonMsg.loading()}</div>
    );
  });

  it('hides loading message when sections are loaded', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel
        {...MINIMUM_PROPS}
        sectionsAreLoaded={true}
      />
    );
    expect(wrapper).not.to.containMatchingElement(
      <div>{commonMsg.loading()}</div>
    );
  });

  it('shows SectionSelector if scriptHasLockableStages', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel
        {...MINIMUM_PROPS}
        scriptHasLockableStages={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <SectionSelector/>
    );
  });

  it('shows SectionSelector if scriptAllowsHiddenStages', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel
        {...MINIMUM_PROPS}
        scriptAllowsHiddenStages={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <SectionSelector/>
    );
  });

  it('hides SectionSelector if neither scriptAllowsHiddenStages nor scriptHasLockableStages', () => {
    const wrapper = shallow(
      <ScriptTeacherPanel
        {...MINIMUM_PROPS}
        scriptHasLockableStages={false}
        scriptAllowsHiddenStages={false}
      />
    );
    expect(wrapper).not.to.containMatchingElement(
      <SectionSelector/>
    );
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
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          {commonMsg.selectSectionInstructions()}
        </div>
      </div>
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
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          {commonMsg.selectSectionInstructions()}
        </div>
        <div>
          <div>
            <FontAwesome icon="exclamation-triangle"/>
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
    );
  });
});
