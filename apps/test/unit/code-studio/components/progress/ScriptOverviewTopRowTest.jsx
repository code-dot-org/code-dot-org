import {expect} from '../../../../util/configuredChai';
import React from 'react';
import {shallow} from 'enzyme';
import i18n from '@cdo/locale';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import SectionSelector from '@cdo/apps/code-studio/components/progress/SectionSelector';
import ScriptOverviewTopRow, {
  NOT_STARTED,
  IN_PROGRESS,
  COMPLETED,
} from '@cdo/apps/code-studio/components/progress/ScriptOverviewTopRow';
import Button from '@cdo/apps/templates/Button';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import AssignToSection from '@cdo/apps/templates/courseOverview/AssignToSection';
import ResourceType from '@cdo/apps/templates/courseOverview/resourceType';
import ProgressDetailToggle from '@cdo/apps/templates/progress/ProgressDetailToggle';

const defaultProps = {
  sectionsInfo: [],
  scriptProgress: NOT_STARTED,
  scriptId: 42,
  scriptName: 'test-script',
  scriptTitle: 'Unit test script title',
  viewAs: ViewType.Student,
  isRtl: false,
  resources: [],
  scriptHasLockableStages: false,
  scriptAllowsHiddenStages: false,
};

describe('ScriptOverviewTopRow', () => {
  it('renders "Try Now" for student', () => {
    const wrapper = shallow(
      <ScriptOverviewTopRow
        {...defaultProps}
        viewAs={ViewType.Student}
        scriptProgress={NOT_STARTED}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <Button
            href="/s/test-script/next.next"
            text={i18n.tryNow()}
            size={Button.ButtonSize.large}
          />
          <Button
            href="//support.code.org"
            text={i18n.getHelp()}
            color={Button.ButtonColor.white}
            size={Button.ButtonSize.large}
          />
        </div>
        <div>
          <span>
            <ProgressDetailToggle/>
          </span>
        </div>
      </div>
    );
  });

  it('renders "Continue" for student', () => {
    const wrapper = shallow(
      <ScriptOverviewTopRow
        {...defaultProps}
        viewAs={ViewType.Student}
        scriptProgress={IN_PROGRESS}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <Button
        href="/s/test-script/next.next"
        text={i18n.continue()}
        size={Button.ButtonSize.large}
      />
    );
  });

  it('renders "Print Certificate" for student', () => {
    const wrapper = shallow(
      <ScriptOverviewTopRow
        {...defaultProps}
        viewAs={ViewType.Student}
        scriptProgress={COMPLETED}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <Button
        href="/s/test-script/next.next"
        text={i18n.printCertificate()}
        size={Button.ButtonSize.large}
      />
    );
  });

  it('renders "Assign to section" for teacher', () => {
    const wrapper = shallow(
      <ScriptOverviewTopRow
        {...defaultProps}
        viewAs={ViewType.Teacher}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <AssignToSection
          sectionsInfo={defaultProps.sectionsInfo}
          courseId={defaultProps.currentCourseId}
          scriptId={defaultProps.scriptId}
          assignmentName={defaultProps.scriptTitle}
        />
        <div>
          <span>
            <ProgressDetailToggle/>
          </span>
        </div>
      </div>
    );
  });

  it('renders resources for teacher', () => {
    const wrapper = shallow(
      <ScriptOverviewTopRow
        {...defaultProps}
        viewAs={ViewType.Teacher}
        resources={[
          {
            type: ResourceType.curriculum,
            link: 'https://example.com/a'
          },
          {
            type: ResourceType.vocabulary,
            link: 'https://example.com/b'
          }
        ]}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <AssignToSection
          sectionsInfo={defaultProps.sectionsInfo}
          courseId={defaultProps.currentCourseId}
          scriptId={defaultProps.scriptId}
          assignmentName={defaultProps.scriptTitle}
        />
        <div>
          <DropdownButton
            text={i18n.teacherResources()}
            color={Button.ButtonColor.blue}
          >
            <a href="https://example.com/a" target="_blank">
              {i18n.curriculum()}
            </a>
            <a href="https://example.com/b" target="_blank">
              {i18n.vocabulary()}
            </a>
          </DropdownButton>
        </div>
        <div>
          <span>
            <ProgressDetailToggle/>
          </span>
        </div>
      </div>
    );
  });

  it('renders section selector if script has lockable stages', () => {
    const wrapper = shallow(
      <ScriptOverviewTopRow
        {...defaultProps}
        viewAs={ViewType.Teacher}
        scriptHasLockableStages={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <SectionSelector/>
    );
  });

  it('renders section selector if script allows hidden stages', () => {
    const wrapper = shallow(
      <ScriptOverviewTopRow
        {...defaultProps}
        viewAs={ViewType.Teacher}
        scriptAllowsHiddenStages={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <SectionSelector/>
    );
  });

  it('renders RTL without errors', () => {
    expect(() => {
      shallow(
        <ScriptOverviewTopRow
          {...defaultProps}
          isRtl={true}
        />
      );
    }).not.to.throw();
  });
});
