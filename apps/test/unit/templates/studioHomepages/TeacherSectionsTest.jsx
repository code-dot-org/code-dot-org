import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {throwOnConsoleWarnings} from '../../../util/testUtils';
import {sections} from './fakeSectionUtils';
import experiments, {SECTION_FLOW_2017} from '@cdo/apps/util/experiments';
import {
  UnconnectedTeacherSections as TeacherSections
} from '@cdo/apps/templates/studioHomepages/TeacherSections';
import ContentContainer from "@cdo/apps/templates/ContentContainer";
import OwnedSections from "@cdo/apps/templates/teacherDashboard/OwnedSections";

describe('TeacherSections', () => {
  throwOnConsoleWarnings();

  const defaultProps = {
    sections: [],
    isRtl: false,
    numTeacherSections: 0,
    asyncLoadSectionData: () => {},
  };

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
