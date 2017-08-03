import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {
  throwOnConsoleErrors,
  throwOnConsoleWarnings
} from '../../../util/testUtils';
import {sections} from './fakeSectionUtils';
import experiments, {SECTION_FLOW_2017} from '@cdo/apps/util/experiments';
import {
  UnconnectedTeacherSections as TeacherSections
} from '@cdo/apps/templates/studioHomepages/TeacherSections';
import ContentContainer from "@cdo/apps/templates/ContentContainer";
import SectionsTable from "@cdo/apps/templates/studioHomepages/SectionsTable";
import {SectionsSetUpMessage} from "@cdo/apps/templates/studioHomepages/SetUpMessage";
import OwnedSections from "@cdo/apps/templates/teacherDashboard/OwnedSections";

describe('TeacherSections', () => {
  throwOnConsoleErrors();
  throwOnConsoleWarnings();

  const defaultProps = {
    sections: [],
    codeOrgUrlPrefix: 'https://code.org',
    isRtl: false,
    numTeacherSections: 0,
    asyncLoadSectionData: () => {},
  };

  beforeEach(() => experiments.setEnabled(SECTION_FLOW_2017, false));

  it('renders a SectionsSetUpMessage when no sections are set up', () => {
    const wrapper = shallow(
      <TeacherSections
        {...defaultProps}
        sections={[]}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <ContentContainer
        heading="Classroom Sections"
        linkText="Manage sections"
        link="https://code.org/teacher-dashboard#/sections"
        isRtl={defaultProps.isRtl}
      >
        <SectionsSetUpMessage
          isRtl={defaultProps.isRtl}
        />
      </ContentContainer>
    );
  });

  it('renders a SectionsTable when the teacher has sections', () => {
    const wrapper = shallow(
      <TeacherSections
        {...defaultProps}
        sections={sections}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <ContentContainer
        heading="Classroom Sections"
        linkText="Manage sections"
        link="https://code.org/teacher-dashboard#/sections"
        isRtl={defaultProps.isRtl}
      >
        <SectionsTable
          sections={sections}
          isRtl={defaultProps.isRtl}
          isTeacher
          canLeave={false}
          codeOrgUrlPrefix={defaultProps.codeOrgUrlPrefix}
        />
      </ContentContainer>
    );
  });

  describe(`(${SECTION_FLOW_2017})`, () => {
    beforeEach(() => experiments.setEnabled(SECTION_FLOW_2017, true));
    afterEach(() => experiments.setEnabled(SECTION_FLOW_2017, false));

    it('renders an OwnedSections component', () => {
      const wrapper = shallow(
        <TeacherSections
          {...defaultProps}
          sections={sections}
          numTeacherSections={sections.length}
        />
      );
      expect(wrapper).to.containMatchingElement(
        <ContentContainer
          heading="Classroom Sections"
          isRtl={defaultProps.isRtl}
        >
          <OwnedSections/>
        </ContentContainer>
      );
    });
  });
});
