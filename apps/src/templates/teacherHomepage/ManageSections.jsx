import React from 'react';
import CollapsibleSection from './CollapsibleSection';
// import SectionsTable from './SectionsTable';
import SetUpMessage from './SetUpMessage';
import i18n from "@cdo/locale";

const ManageSections = React.createClass({
  propTypes: {
    sectionName1: React.PropTypes.string,
  },

  render() {
    const { sectionName1 } = this.props;

    return (
      <CollapsibleSection
        header={i18n.manageSections()}
        linkText={i18n.addNewSection()}
        link="https://code.org/teacher-dashboard#/sections"
      >
      {sectionName1 ? (
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

export default ManageSections;
