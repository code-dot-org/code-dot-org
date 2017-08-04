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
import SetUpSections from "@cdo/apps/templates/studioHomepages/SetUpSections";
import OwnedSections from "@cdo/apps/templates/teacherDashboard/OwnedSections";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

describe('TeacherSections', () => {
  throwOnConsoleErrors();
  throwOnConsoleWarnings();

  const defaultProps = {
    sections: [],
    isRtl: false,
    numTeacherSections: 0,
    asyncLoadSectionData: () => {},
  };

  beforeEach(() => experiments.setEnabled(SECTION_FLOW_2017, false));

  it('renders SetUpSections when no sections are set up', () => {
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
        link={pegasus('/teacher-dashboard#/sections')}
        isRtl={defaultProps.isRtl}
      >
        <SetUpSections
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
        link={pegasus('/teacher-dashboard#/sections')}
        isRtl={defaultProps.isRtl}
      >
        <SectionsTable
          sections={sections}
          isRtl={defaultProps.isRtl}
          isTeacher
          canLeave={false}
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
