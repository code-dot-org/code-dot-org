import React from 'react';
import ContentContainer from '../ContentContainer';
import SectionsTable from './SectionsTable';
import {SectionsSetUpMessage} from './SetUpMessage';
import JoinSection from './JoinSection';
import JoinSectionNotifications from './JoinSectionNotifications';
import i18n from "@cdo/locale";

const Sections = React.createClass({
  propTypes: {
    sections: React.PropTypes.array,
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
    isRtl: React.PropTypes.bool.isRequired,
    isTeacher: React.PropTypes.bool.isRequired,
    canLeave: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      sections: this.props.sections,
      sectionsAction: null,
      sectionsResult: null,
      sectionsResultName: null
    };
  },

  updateSections(sections) {
    this.setState({sections});
  },

  updateSectionsResult(action, result, name) {
    this.setState({
      sectionsAction: action,
      sectionsResult: result,
      sectionsResultName: name
    });
  },

  render() {
    const sections = this.state.sections;
    const { codeOrgUrlPrefix, isRtl, isTeacher, canLeave } = this.props;
    const editSectionsUrl = `${codeOrgUrlPrefix}/teacher-dashboard#/sections`;
    const enrolledInASection = sections.length === 0 ? false : true;
    const enrollmentDescription = isTeacher ? "" : i18n.enrollmentDescription();

    return (
      <div>
        <ContentContainer
          heading={i18n.sectionsTitle()}
          linkText={i18n.manageSections()}
          link={editSectionsUrl}
          showLink={isTeacher}
          isRtl={isRtl}
          description={enrollmentDescription}
        >
          <JoinSectionNotifications
            action={this.state.sectionsAction}
            result={this.state.sectionsResult}
            nameOrId={this.state.sectionsResultName}
          />
          {sections.length > 0 && (
            <SectionsTable
              sections={sections}
              isRtl={isRtl}
              isTeacher={isTeacher}
              codeOrgUrlPrefix={codeOrgUrlPrefix}
              canLeave={canLeave}
              updateSections={this.updateSections}
              updateSectionsResult={this.updateSectionsResult}
            />
          )}
          {sections.length === 0 && isTeacher && (
            <SectionsSetUpMessage
              codeOrgUrlPrefix={codeOrgUrlPrefix}
              isRtl={isRtl}
            />
          )}
          {!isTeacher && (
            <JoinSection
              enrolledInASection={enrolledInASection}
              updateSections={this.updateSections}
              updateSectionsResult={this.updateSectionsResult}
            />
          )}
        </ContentContainer>
      </div>
    );
  }
});

export default Sections;
