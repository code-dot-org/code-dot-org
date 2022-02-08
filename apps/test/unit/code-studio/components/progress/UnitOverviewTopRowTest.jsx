import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import i18n from '@cdo/locale';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {UnconnectedUnitOverviewTopRow as UnitOverviewTopRow} from '@cdo/apps/code-studio/components/progress/UnitOverviewTopRow';
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
  scriptId: 42,
  scriptName: 'test-script',
  unitTitle: 'Unit test script title',
  viewAs: ViewType.Participant,
  isRtl: false,
  teacherResources: [],
  studentResources: [],
  showAssignButton: true,
  isMigrated: false,
  unitCompleted: false,
  hasPerLevelResults: false
};

describe('UnitOverviewTopRow', () => {
  it('renders "Try Now" for participant if not unitCompleted and not hasPerLevelResults', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        viewAs={ViewType.Participant}
        unitCompleted={false}
        hasPerLevelResults={false}
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

  it('renders "Continue" for participant if has level results and not unitCompleted', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        viewAs={ViewType.Participant}
        unitCompleted={false}
        hasPerLevelResults={true}
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

  it('renders "Print Certificate" for participant', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        viewAs={ViewType.Participant}
        unitCompleted={true}
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

  it('renders SectionAssigner for instructor', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow {...defaultProps} viewAs={ViewType.Instructor} />
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

  describe('instructor resources', () => {
    it('renders resources for instructor', () => {
      const wrapper = shallow(
        <UnitOverviewTopRow
          {...defaultProps}
          viewAs={ViewType.Instructor}
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

    it('renders migrated resources for instructor on a migrated script', () => {
      const wrapper = shallow(
        <UnitOverviewTopRow
          {...defaultProps}
          viewAs={ViewType.Instructor}
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

    it('renders legacy resources instead of migrated resources on migrated script', () => {
      const wrapper = shallow(
        <UnitOverviewTopRow
          {...defaultProps}
          viewAs={ViewType.Instructor}
          isMigrated={true}
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
  });

  it('renders the unit calendar when showCalendar true for instructor', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        showCalendar
        unitCalendarLessons={testLessons}
        weeklyInstructionalMinutes={90}
        viewAs={ViewType.Instructor}
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

  it('does not render the unit calendar when showCalendar false for instructor', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        unitCalendarLessons={testLessons}
        weeklyInstructionalMinutes={90}
        viewAs={ViewType.Instructor}
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

  it('does not render the unit calendar for participant', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        showCalendar
        unitCalendarLessons={testLessons}
        weeklyInstructionalMinutes={90}
        viewAs={ViewType.Participant}
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

  it('renders dropdown button with links to printing options when published state is not pilot or indevelopment', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        scriptOverviewPdfUrl="/link/to/script_overview.pdf"
        scriptResourcesPdfUrl="/link/to/script_resources.pdf"
        viewAs={ViewType.Instructor}
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

  it('does not render printing option dropdown for participants', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        scriptOverviewPdfUrl="/link/to/script_overview.pdf"
        scriptResourcesPdfUrl="/link/to/script_resources.pdf"
        viewAs={ViewType.Participant}
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
