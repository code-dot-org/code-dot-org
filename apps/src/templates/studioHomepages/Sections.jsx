import React from 'react';
import ContentContainer from '../ContentContainer';
import SetUpMessage from './SetUpMessage';
import i18n from "@cdo/locale";
import SectionsPage from '../teacherDashboard/SectionsPage';
import { connect } from 'react-redux';
import {setValidAssignments, setSections} from '../teacherDashboard/teacherSectionsRedux';

const sectionsApiPath = '/dashboardapi/sections/';

const Sections = React.createClass({
  propTypes: {
    sections: React.PropTypes.array,
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
    isRtl: React.PropTypes.bool.isRequired,
    isTeacher: React.PropTypes.bool.isRequired,
    canLeave: React.PropTypes.bool.isRequired,
    validScripts: React.PropTypes.array,
    teacherHomepage: React.PropTypes.bool,

    //Redux provided
    setSections: React.PropTypes.func.isRequired,
    setValidAssignments: React.PropTypes.func.isRequired,
  },

  componentDidMount(){
    const { setSections, setValidAssignments } = this.props;
    let validCourses;
    let sections;

    const onAsyncLoad = () => {
      if (validCourses && sections) {
        setValidAssignments(validCourses, this.props.validScripts);
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

    return (
      <div>
        <ContentContainer
          heading={i18n.sectionsTitle()}
          isRtl={isRtl}
        >
          {sections.length > 0 && (
            <SectionsPage
              validScripts={this.props.validScripts}
              teacherHomepage={this.props.teacherHomepage}
            />
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

export default connect(state => ({}), {setValidAssignments, setSections})(Sections);
