import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import i18n from "@cdo/locale";
import ContentContainer from '../ContentContainer';
import OwnedSections from '../teacherDashboard/OwnedSections';
import {asyncLoadSectionData} from '../teacherDashboard/teacherSectionsRedux';

class TeacherSections extends Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired,
    queryStringOpen: PropTypes.string,

    //Redux provided
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
          <OwnedSections queryStringOpen={queryStringOpen}/>
        </ContentContainer>
      </div>
    );
  }
}
export const UnconnectedTeacherSections = TeacherSections;
export default connect(undefined, {
  asyncLoadSectionData,
})(TeacherSections);
