import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import ContentContainer from '../ContentContainer';
import JoinSection from './JoinSection';
import JoinSectionNotifications from './JoinSectionNotifications';
import SectionsAsStudentTable from './SectionsAsStudentTable';

export default class StudentSections extends Component {
  // isTeacher will be set false for teachers who are seeing this as a student in another teacher's section.
  static propTypes = {
    initialSections: PropTypes.array.isRequired,
    isTeacher: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {
      sections: props.initialSections,
      action: null,
      result: null,
      sectionName: null,
      sectionCode: null
    };
  }

  updateSections = sections => this.setState({sections});

  updateSectionsResult = (action, result, sectionName, sectionCode) => {
    this.setState({
      action: action,
      result: result,
      sectionName: sectionName,
      sectionCode: sectionCode
    });
  };

  render() {
    const {isTeacher} = this.props;
    const {sections, action, result, sectionName, sectionCode} = this.state;
    const enrolledInASection = sections.length > 0;
    const heading = isTeacher ? i18n.sectionsJoined() : i18n.sectionsTitle();
    const description = isTeacher ? '' : i18n.enrollmentDescription();

    return (
      <ContentContainer heading={heading} description={description}>
        <JoinSectionNotifications
          action={action}
          result={result}
          name={sectionName}
          code={sectionCode}
        />
        {enrolledInASection && (
          <SectionsAsStudentTable
            sections={sections}
            canLeave={!!isTeacher}
            updateSections={this.updateSections}
            updateSectionsResult={this.updateSectionsResult}
          />
        )}
        <JoinSection
          enrolledInASection={enrolledInASection}
          updateSections={this.updateSections}
          updateSectionsResult={this.updateSectionsResult}
        />
      </ContentContainer>
    );
  }
}
