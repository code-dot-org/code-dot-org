import React from 'react';
import CollapsibleSection from './CollapsibleSection';
import SectionsTable from './SectionsTable';
import SetUpMessage from './SetUpMessage';
import i18n from "@cdo/locale";

const ManageSectionsCollapsible = React.createClass({
  propTypes: {
    sections: React.PropTypes.array,
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
  },

  render() {
    const { sections, codeOrgUrlPrefix } = this.props;
    const editSectionsUrl = `${codeOrgUrlPrefix}/teacher-dashboard#/sections`;

    return (
      <CollapsibleSection
        heading={i18n.sectionsTitle()}
        linkText={i18n.editSections()}
        link={editSectionsUrl}
        showLink={true}
      >
      {sections.length > 0 ? (
        <SectionsTable sections={sections}/>
      ) : (
        <SetUpMessage
          type="sections"
          codeOrgUrlPrefix={codeOrgUrlPrefix}
        />
      )}
      </CollapsibleSection>
    );
  }
});

export default ManageSectionsCollapsible;
