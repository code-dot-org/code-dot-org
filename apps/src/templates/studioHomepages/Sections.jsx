import React from 'react';
import ContentContainer from '../ContentContainer';
import SetUpMessage from './SetUpMessage';
import i18n from "@cdo/locale";
import SectionTable from '../teacherDashboard/SectionTable';
import { connect } from 'react-redux';
import { setSections} from '../teacherDashboard/teacherSectionsRedux';

const sectionsApiPath = '/dashboardapi/sections/';

const Sections = React.createClass({
  propTypes: {
    sections: React.PropTypes.array,
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
    isRtl: React.PropTypes.bool.isRequired,
    isTeacher: React.PropTypes.bool.isRequired,
    canLeave: React.PropTypes.bool.isRequired,

    //Redux provided
    setSections: React.PropTypes.func.isRequired,
    //setValidAssignments: React.PropTypes.func.isRequired,
  },

  componentDidMount(){
    const { setSections } = this.props;
    let validCourses;
    let sections;

    const onAsyncLoad = () => {
      if (validCourses && sections) {
        //setValidAssignments(validCourses, validScripts);
        setSections(sections);
      }
    };

    $.getJSON('/dashboardapi/courses').then(response => {
      validCourses = response;
      onAsyncLoad();
    });

    $.getJSON(sectionsApiPath).done(response => {
      sections = response;
      onAsyncLoad();
    });
  },

  render() {
    const { sections, codeOrgUrlPrefix, isRtl, isTeacher} = this.props;
    const editSectionsUrl = `${codeOrgUrlPrefix}/teacher-dashboard#/sections`;

    return (
      <div>
        <ContentContainer
          heading={i18n.sectionsTitle()}
          linkText={i18n.manageSections()}
          link={editSectionsUrl}
          showLink={isTeacher}
          isRtl={isRtl}
        >
        {sections.length > 0 && (
          <SectionTable/>
        )}
        {sections.length === 0 && isTeacher && (
          <SetUpMessage
            type="sections"
            codeOrgUrlPrefix={codeOrgUrlPrefix}
            isRtl={isRtl}
            isTeacher={isTeacher}
          />
        )}
      </ContentContainer>
    </div>
    );
  }
});

export default connect(state => ({}), { setSections})(Sections);
