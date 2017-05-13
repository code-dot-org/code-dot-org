import React from 'react';
import CollapsibleSection from './CollapsibleSection';
import SectionsTable from './SectionsTable';
import SetUpMessage from './SetUpMessage';
import i18n from "@cdo/locale";

const ManageSectionsCollapsible = React.createClass({
  propTypes: {
    sections: React.PropTypes.array,
    urlPrefix: React.PropTypes.string.isRequired
  },

  render() {
    const { sections, urlPrefix } = this.props;
    const url = `${urlPrefix}/teacher-dashboard#/sections`;

    return (
      <CollapsibleSection
        header={i18n.sectionsTitle()}
        linkText={i18n.editSections()}
        link={url}
      >
      {sections.length > 0 ? (
        <SectionsTable sections={sections}/>
      ) : (
        <SetUpMessage type="sections"/>
      )}
      </CollapsibleSection>
    );
  }
});

export default ManageSectionsCollapsible;
