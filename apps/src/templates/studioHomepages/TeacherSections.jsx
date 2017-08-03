import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from "@cdo/locale";
import experiments, {SECTION_FLOW_2017} from '@cdo/apps/util/experiments';
import ContentContainer from '../ContentContainer';
import {SectionsSetUpMessage} from './SetUpMessage';
import OwnedSections from '../teacherDashboard/OwnedSections';
import SectionsTable from '../studioHomepages/SectionsTable';
import {asyncLoadSectionData} from '../teacherDashboard/teacherSectionsRedux';
import AddSectionDialog from "../teacherDashboard/AddSectionDialog";
import shapes from './shapes';

const TeacherSections = React.createClass({
  propTypes: {
    sections: shapes.sections,
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
    isRtl: React.PropTypes.bool.isRequired,

    //Redux provided
    numTeacherSections: PropTypes.number.isRequired,
    asyncLoadSectionData: PropTypes.func.isRequired,
  },

  componentDidMount(){
    this.props.asyncLoadSectionData();
  },

  render() {
    const {sections, numTeacherSections, codeOrgUrlPrefix, isRtl} = this.props;
    const editSectionsUrl = `${codeOrgUrlPrefix}/teacher-dashboard#/sections`;
    const sectionFlow2017 = experiments.isEnabled(SECTION_FLOW_2017);

    return (
      <div className="sectionsContainer">
        <ContentContainer
          heading={i18n.sectionsTitle()}
          linkText={!sectionFlow2017 && i18n.manageSections()}
          link={!sectionFlow2017 && editSectionsUrl}
          isRtl={isRtl}
        >
          {numTeacherSections > 0 && sectionFlow2017 && (
            <OwnedSections/>
          )}
          {(numTeacherSections > 0 && !sectionFlow2017) &&
            <SectionsTable
              sections={sections}
              isRtl={isRtl}
              isTeacher
              canLeave={false}
              updateSections={this.updateSections}
              updateSectionsResult={this.updateSectionsResult}
            />
          }
          {numTeacherSections === 0 && (
            <SectionsSetUpMessage isRtl={isRtl}/>
          )}
          {numTeacherSections === 0 && sectionFlow2017 && (
            <AddSectionDialog handleImportOpen={() => {}/* TODO */}/>
          )}
        </ContentContainer>
      </div>
    );
  }
});
export default connect(state => ({
  numTeacherSections: state.teacherSections.sectionIds.length
}), {
  asyncLoadSectionData,
})(TeacherSections);
