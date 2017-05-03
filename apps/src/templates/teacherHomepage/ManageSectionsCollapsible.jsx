import React from 'react';
import CollapsibleSection from './CollapsibleSection';
// import SectionsTable from './SectionsTable';
import SetUpMessage from './SetUpMessage';
import i18n from "@cdo/locale";

const ManageSectionsCollapsible = React.createClass({
  propTypes: {
    sections: React.PropTypes.array,
  },

  render() {
    const { sections } = this.props;

    return (
      <CollapsibleSection
        header={i18n.mySections()}
        linkText={i18n.editSections()}
        link="https://code.org/teacher-dashboard#/sections"
      >
      {sections ? (
        <div>
          This is where the sections table will go.
        </div>
      ) : (
        <SetUpMessage type="sections"/>
      )}
      </CollapsibleSection>
    );
  }
});

export default ManageSectionsCollapsible;
