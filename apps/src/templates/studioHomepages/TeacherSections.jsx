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
    sections: shapes.sections, // Without experiment
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
    isRtl: React.PropTypes.bool.isRequired,

    //Redux provided
    numTeacherSections: PropTypes.number.isRequired,
    asyncLoadSectionData: PropTypes.func.isRequired,
  },

  componentDidMount(){
    this.props.asyncLoadSectionData();
  },

  renderNewSectionFlow() {
    const {numTeacherSections, isRtl} = this.props;
    return (
      <ContentContainer
        heading={i18n.sectionsTitle()}
        isRtl={isRtl}
      >
        {numTeacherSections > 0 ? (
          <OwnedSections/>
        ) : (
          <div>
            <SectionsSetUpMessage isRtl={isRtl}/>
            <AddSectionDialog handleImportOpen={() => {}/* TODO */}/>
          </div>
        )}
      </ContentContainer>
    );
  },

  render() {
    if (experiments.isEnabled(SECTION_FLOW_2017)) {
      return this.renderNewSectionFlow();
    }
    const {sections, numTeacherSections, codeOrgUrlPrefix, isRtl} = this.props;
    const editSectionsUrl = `${codeOrgUrlPrefix}/teacher-dashboard#/sections`;

    return (
      <ContentContainer
        heading={i18n.sectionsTitle()}
        linkText={i18n.manageSections()}
        link={editSectionsUrl}
        isRtl={isRtl}
      >
        {numTeacherSections > 0 ? (
          <SectionsTable
            sections={sections}
            isRtl={isRtl}
            isTeacher
            canLeave={false}
            updateSections={this.updateSections}
            updateSectionsResult={this.updateSectionsResult}
          />
        ) : (
          <SectionsSetUpMessage isRtl={isRtl}/>
        )}
      </ContentContainer>
    );
  }
});
export default connect(state => ({
  numTeacherSections: state.teacherSections.sectionIds.length
}), {
  asyncLoadSectionData,
})(TeacherSections);
