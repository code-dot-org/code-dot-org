import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from "@cdo/locale";
import experiments, {SECTION_FLOW_2017} from '@cdo/apps/util/experiments';
import ContentContainer from '../ContentContainer';
import {SectionsSetUpMessage} from './SetUpMessage';
import OwnedSections from '../teacherDashboard/OwnedSections';
import SectionsTable from '../studioHomepages/SectionsTable';
import {asyncLoadSectionData} from '../teacherDashboard/teacherSectionsRedux';
import shapes from './shapes';

class TeacherSections extends Component {
  static propTypes = {
    sections: shapes.sections, // Without experiment
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
    isRtl: React.PropTypes.bool.isRequired,

    //Redux provided
    numTeacherSections: PropTypes.number.isRequired,
    asyncLoadSectionData: PropTypes.func.isRequired,
  };

  componentDidMount(){
    this.props.asyncLoadSectionData();
  }

  renderNewSectionFlow() {
    const {isRtl} = this.props;
    return (
      <ContentContainer
        heading={i18n.sectionsTitle()}
        isRtl={isRtl}
      >
        <OwnedSections isRtl={isRtl}/>
      </ContentContainer>
    );
  }

  render() {
    if (experiments.isEnabled(SECTION_FLOW_2017)) {
      return this.renderNewSectionFlow();
    }
    const {sections, codeOrgUrlPrefix, isRtl} = this.props;
    const editSectionsUrl = `${codeOrgUrlPrefix}/teacher-dashboard#/sections`;

    return (
      <ContentContainer
        heading={i18n.sectionsTitle()}
        linkText={i18n.manageSections()}
        link={editSectionsUrl}
        isRtl={isRtl}
      >
        {sections.length > 0 ? (
          <SectionsTable
            sections={sections}
            isRtl={isRtl}
            isTeacher
            canLeave={false}
            codeOrgUrlPrefix={codeOrgUrlPrefix}
          />
        ) : (
          <SectionsSetUpMessage isRtl={isRtl}/>
        )}
      </ContentContainer>
    );
  }
}
export const UnconnectedTeacherSections = TeacherSections;
export default connect(state => ({
  numTeacherSections: state.teacherSections.sectionIds.length
}), {
  asyncLoadSectionData,
})(TeacherSections);
