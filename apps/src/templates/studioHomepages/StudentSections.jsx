import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import ContentContainer from '../ContentContainer';
import JoinSection from './JoinSection';
import JoinSectionNotifications from './JoinSectionNotifications';
import SectionsTable from '../studioHomepages/SectionsTable';

export default class StudentSections extends Component {
  static propTypes = {
    sections: PropTypes.array,
    isRtl: PropTypes.bool.isRequired,
    canLeave: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      studentSections: props.sections,
      sectionsAction: null,
      sectionsResult: null,
      sectionsResultName: null
    };
  }

  updateSections = (studentSections) => this.setState({studentSections});

  updateSectionsResult = (action, result, name) => {
    this.setState({
      sectionsAction: action,
      sectionsResult: result,
      sectionsResultName: name
    });
  };

  render() {
    const {isRtl, canLeave} = this.props;
    const studentSections = this.state.studentSections;
    const numStudentSections = studentSections.length;
    const enrolledInASection = studentSections.length > 0;
    const enrollmentDescription = i18n.enrollmentDescription();

    return (
      <div className="sectionsContainer">
        <ContentContainer
          heading={i18n.sectionsTitle()}
          isRtl={isRtl}
          description={enrollmentDescription}
        >
          <JoinSectionNotifications
            action={this.state.sectionsAction}
            result={this.state.sectionsResult}
            nameOrId={this.state.sectionsResultName}
          />
          {numStudentSections > 0 &&
            <SectionsTable
              sections={studentSections}
              isRtl={isRtl}
              isTeacher={false}
              canLeave={canLeave}
              updateSections={this.updateSections}
              updateSectionsResult={this.updateSectionsResult}
            />
          }
          <JoinSection
            enrolledInASection={enrolledInASection}
            updateSections={this.updateSections}
            updateSectionsResult={this.updateSectionsResult}
          />
        </ContentContainer>
      </div>
    );
  }
}
