import React from 'react';
import ContentContainer from '../ContentContainer';
import SectionsTable from './SectionsTable';
import SetUpMessage from './SetUpMessage';
import i18n from "@cdo/locale";

const Sections = React.createClass({
  propTypes: {
    sections: React.PropTypes.array,
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
    isRtl: React.PropTypes.bool.isRequired
  },

  render() {
    const { sections, codeOrgUrlPrefix, isRtl } = this.props;
    const editSectionsUrl = `${codeOrgUrlPrefix}/teacher-dashboard#/sections`;

    return (
      <div>
        <ContentContainer
          heading={i18n.sectionsTitle()}
          linkText={i18n.manageSections()}
          link={editSectionsUrl}
          showLink={true}
          isRtl={isRtl}
        >
        {sections.length > 0 && (
          <SectionsTable
            sections={sections}
            isRtl={isRtl}
          />
        )}
        {sections.length === 0 && (
          <SetUpMessage
            type="sections"
            codeOrgUrlPrefix={codeOrgUrlPrefix}
            isRtl={isRtl}
            isTeacher={false}
          />
        )}
      </ContentContainer>
    </div>
    );
  }
});

export default Sections;
