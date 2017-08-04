import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import ContentContainer from '../ContentContainer';
import JoinSection from './JoinSection';
import JoinSectionNotifications from './JoinSectionNotifications';
import SectionsTable from '../studioHomepages/SectionsTable';

export default class StudentSections extends Component {
  static propTypes = {
    initialSections: PropTypes.array.isRequired,
    isRtl: PropTypes.bool.isRequired,
    canLeave: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      sections: props.initialSections,
      action: null,
      result: null,
      resultName: null
    };
  }

  updateSections = (sections) => this.setState({sections});

  updateSectionsResult = (action, result, name) => {
    this.setState({
      action: action,
      result: result,
      resultName: name
    });
  };

  render() {
    const {isRtl, canLeave} = this.props;
    const {sections, action, result, resultName} = this.state;
    const enrolledInASection = sections.length > 0;

    return (
      <ContentContainer
        heading={i18n.sectionsTitle()}
        isRtl={isRtl}
        description={i18n.enrollmentDescription()}
      >
        <JoinSectionNotifications
          action={action}
          result={result}
          nameOrId={resultName}
        />
        {enrolledInASection &&
          <SectionsTable
            sections={sections}
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
    );
  }
}
