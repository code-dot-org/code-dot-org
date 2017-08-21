import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from "@cdo/locale";
import ContentContainer from '../ContentContainer';
import OwnedSections from '../teacherDashboard/OwnedSections';
import {asyncLoadSectionData} from '../teacherDashboard/teacherSectionsRedux';

class TeacherSections extends React.Component {
  static propTypes = {
    queryStringOpen: PropTypes.string,

    //Redux provided
    isRtl: PropTypes.bool.isRequired,
    numTeacherSections: PropTypes.number.isRequired,
    asyncLoadSectionData: PropTypes.func.isRequired,
  };

  componentDidMount(){
    this.props.asyncLoadSectionData();
  }

  render() {
    const {isRtl, queryStringOpen} = this.props;
    return (
      <div id="classroom-sections">
        <ContentContainer
          heading={i18n.sectionsTitle()}
          isRtl={isRtl}
        >
          <OwnedSections isRtl={isRtl} queryStringOpen={queryStringOpen}/>
        </ContentContainer>
      </div>
    );
  }
}
export const UnconnectedTeacherSections = TeacherSections;
export default connect(undefined, {
  asyncLoadSectionData,
})(TeacherSections);
