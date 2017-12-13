import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {sections} from './fakeSectionUtils';
import i18n from '@cdo/locale';
import StudentSections from '@cdo/apps/templates/studioHomepages/StudentSections';
import ContentContainer from "@cdo/apps/templates/ContentContainer";
import JoinSection from "@cdo/apps/templates/studioHomepages/JoinSection";
import JoinSectionNotifications from "@cdo/apps/templates/studioHomepages/JoinSectionNotifications";
import SectionsTable from "@cdo/apps/templates/studioHomepages/SectionsTable";

describe('StudentSections', () => {
  const defaultProps = {
    initialSections: [],
    isRtl: false,
    canLeave: false,
  };

  it('does not render a SectionsTable when not enrolled in any sections', () => {
    const wrapper = shallow(
      <StudentSections
        {...defaultProps}
        initialSections={[]}
      />
    );
    const instance = wrapper.instance();
    expect(wrapper).to.containMatchingElement(
      <ContentContainer
        heading="Classroom Sections"
        description={i18n.enrollmentDescription()}
        isRtl={defaultProps.isRtl}
      >
        <JoinSectionNotifications/>
        <JoinSection
          enrolledInASection={false}
          updateSections={instance.updateSections}
          updateSectionsResult={instance.updateSectionsResult}
        />
      </ContentContainer>
    );
  });

  it('renders a SectionsTable when enrolled in one or more sections', () => {
    const wrapper = shallow(
      <StudentSections
        {...defaultProps}
        initialSections={sections}
      />
    );
    const instance = wrapper.instance();
    expect(wrapper).to.containMatchingElement(
      <ContentContainer
        heading="Classroom Sections"
        description={i18n.enrollmentDescription()}
        isRtl={defaultProps.isRtl}
      >
        <JoinSectionNotifications/>
        <SectionsTable
          sections={sections}
          isTeacher={false}
          canLeave={defaultProps.canLeave}
          updateSections={instance.updateSections}
          updateSectionsResult={instance.updateSectionsResult}
        />
        <JoinSection
          enrolledInASection={true}
          updateSections={instance.updateSections}
          updateSectionsResult={instance.updateSectionsResult}
        />
      </ContentContainer>
    );
  });
});
