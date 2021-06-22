import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import i18n from '@cdo/locale';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {
  UnconnectedUnitOverviewTopRow as UnitOverviewTopRow,
  NOT_STARTED,
  IN_PROGRESS,
  COMPLETED
} from '@cdo/apps/code-studio/components/progress/UnitOverviewTopRow';
import Button from '@cdo/apps/templates/Button';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import SectionAssigner from '@cdo/apps/templates/teacherDashboard/SectionAssigner';
import ResourceType from '@cdo/apps/templates/courseOverview/resourceType';
import ProgressDetailToggle from '@cdo/apps/templates/progress/ProgressDetailToggle';
import ResourcesDropdown from '@cdo/apps/code-studio/components/progress/ResourcesDropdown';
import UnitCalendarButton from '@cdo/apps/code-studio/components/progress/UnitCalendarButton';
import {testLessons} from './unitCalendarTestData';

const defaultProps = {
  sectionsForDropdown: [],
  unitProgress: NOT_STARTED,
  scriptId: 42,
  scriptName: 'test-script',
  scriptTitle: 'Unit test script title',
  viewAs: ViewType.Student,
  isRtl: false,
  teacherResources: [],
  studentResources: [],
  showAssignButton: true,
  isMigrated: false
};

describe('UnitOverviewTopRow', () => {
  it('renders "Try Now" for student', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        viewAs={ViewType.Student}
        unitProgress={NOT_STARTED}
      />
    );

    expect(
      wrapper.containsMatchingElement(
        <div>
          <div>
            <Button
              __useDeprecatedTag
              href="/s/test-script/next"
              text={i18n.tryNow()}
              size={Button.ButtonSize.large}
            />
            <Button
              __useDeprecatedTag
              href="//support.code.org"
              text={i18n.getHelp()}
              color={Button.ButtonColor.white}
              size={Button.ButtonSize.large}
            />
          </div>
          <div />
          <div>
            <span>
              <ProgressDetailToggle />
            </span>
          </div>
        </div>
      )
    ).to.be.true;
  });

  it('renders "Continue" for student', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        viewAs={ViewType.Student}
        unitProgress={IN_PROGRESS}
      />
    );

    expect(
      wrapper.containsMatchingElement(
        <Button
          __useDeprecatedTag
          href="/s/test-script/next"
          text={i18n.continue()}
          size={Button.ButtonSize.large}
        />
      )
    ).to.be.true;
  });

  it('renders "Print Certificate" for student', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        viewAs={ViewType.Student}
        unitProgress={COMPLETED}
      />
    );

    expect(
      wrapper.containsMatchingElement(
        <Button
          __useDeprecatedTag
          href="/s/test-script/next"
          text={i18n.printCertificate()}
          size={Button.ButtonSize.large}
        />
      )
    ).to.be.true;
  });

  it('renders SectionAssigner for teacher', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow {...defaultProps} viewAs={ViewType.Teacher} />
    );

    expect(
      wrapper.containsMatchingElement(
        <div>
          <div />
          <SectionAssigner
            sections={defaultProps.sectionsForDropdown}
            courseId={defaultProps.currentCourseId}
            scriptId={defaultProps.scriptId}
            showAssignButton={defaultProps.showAssignButton}
          />
          <div>
            <span>
              <ProgressDetailToggle />
            </span>
          </div>
        </div>
      )
    ).to.be.true;
  });

  it('renders resources for teacher', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        viewAs={ViewType.Teacher}
        teacherResources={[
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
    expect(
      wrapper.containsMatchingElement(
        <ResourcesDropdown
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
          useMigratedResources={false}
        />
      )
    ).to.be.true;
  });

  it('renders migrated resources for teacher on a migrated script', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        viewAs={ViewType.Teacher}
        isMigrated={true}
        migratedTeacherResources={[
          {
            id: 1,
            key: 'curriculum',
            name: 'Curriculum',
            url: 'https://example.com/a'
          },
          {
            id: 2,
            key: 'vocabulary',
            name: 'Vocabulary',
            url: 'https://example.com/b'
          }
        ]}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <ResourcesDropdown
          migratedResources={[
            {
              id: 1,
              key: 'curriculum',
              name: 'Curriculum',
              url: 'https://example.com/a'
            },
            {
              id: 2,
              key: 'vocabulary',
              name: 'Vocabulary',
              url: 'https://example.com/b'
            }
          ]}
          useMigratedResources={true}
        />
      )
    ).to.be.true;
  });

  it('renders the unit calendar when showCalendar true for teacher', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        showCalendar
        unitCalendarLessons={testLessons}
        weeklyInstructionalMinutes={90}
        viewAs={ViewType.Teacher}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <UnitCalendarButton
          lessons={testLessons}
          weeklyInstructionalMinutes={90}
          scriptId={42}
        />
      )
    ).to.be.true;
  });

  it('does not render the unit calendar when showCalendar false for teacher', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        unitCalendarLessons={testLessons}
        weeklyInstructionalMinutes={90}
        viewAs={ViewType.Teacher}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <UnitCalendarButton
          lessons={testLessons}
          weeklyInstructionalMinutes={90}
          scriptId={42}
        />
      )
    ).to.be.false;
  });

  it('does not render the unit calendar for student', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        showCalendar
        unitCalendarLessons={testLessons}
        weeklyInstructionalMinutes={90}
        viewAs={ViewType.Student}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <UnitCalendarButton
          lessons={testLessons}
          weeklyInstructionalMinutes={90}
          scriptId={42}
        />
      )
    ).to.be.false;
  });

  it('renders dropdown button with links to printing options', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        scriptOverviewPdfUrl="/link/to/script_overview.pdf"
        scriptResourcesPdfUrl="/link/to/script_resources.pdf"
        viewAs={ViewType.Teacher}
      />
    );
    expect(wrapper.find(DropdownButton).length).to.equal(1);
    const dropdownLinks = wrapper
      .find(DropdownButton)
      .first()
      .props().children;
    expect(dropdownLinks.map(link => link.props.href)).to.eql([
      '/link/to/script_overview.pdf',
      '/link/to/script_resources.pdf'
    ]);
    expect(dropdownLinks.map(link => link.props.children)).to.eql([
      'Print Lesson Plans',
      'Print Handouts'
    ]);
  });

  it('does not render printing option dropdown for students', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        scriptOverviewPdfUrl="/link/to/script_overview.pdf"
        scriptResourcesPdfUrl="/link/to/script_resources.pdf"
        viewAs={ViewType.Student}
      />
    );
    expect(wrapper.find(DropdownButton).length).to.equal(0);
  });

  it('renders RTL without errors', () => {
    expect(() => {
      shallow(<UnitOverviewTopRow {...defaultProps} isRtl={true} />);
    }).not.to.throw();
  });
});
