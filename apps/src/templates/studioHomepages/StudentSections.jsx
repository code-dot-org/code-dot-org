import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import ContentContainer from '../ContentContainer';
import Button from '@cdo/apps/templates/Button';
import JoinSection from './JoinSection';
import JoinSectionNotifications from './JoinSectionNotifications';
import SectionsAsStudentTable from './SectionsAsStudentTable';
import color from '@cdo/apps/util/color';
import styleConstants from '@cdo/apps/styleConstants';

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
      resultName: null,
      resultId: null,
      sectionCapacity: null,
      viewHidden: false
    };
  }

  updateSections = sections => this.setState({sections});

  updateSectionsResult = (action, result, name, id, sectionCapacity = null) => {
    this.setState({
      action: action,
      result: result,
      resultName: name,
      resultId: id,
      sectionCapacity: sectionCapacity
    });
  };

  toggleViewHidden = () => {
    this.setState({
      viewHidden: !this.state.viewHidden
    });
  };

  render() {
    const {isTeacher} = this.props;
    const {
      sections,
      action,
      result,
      resultName,
      resultId,
      sectionCapacity,
      viewHidden
    } = this.state;
    const heading = isTeacher ? i18n.sectionsJoined() : i18n.sectionsTitle();
    const description = isTeacher ? '' : i18n.enrollmentDescription();

    const styles = {
      buttonContainer: {
        width: styleConstants['content-width'],
        textAlign: 'right',
        paddingTop: 10,
        paddingBottom: 10
      },
      hiddenSectionLabel: {
        fontSize: 18,
        paddingBottom: 10,
        color: color.charcoal
      },
      hiddenSectionDesc: {
        fontSize: 14,
        lineHeight: '22px',
        paddingBottom: 10,
        color: color.charcoal
      }
    };

    // Sort student's sections based on whether they are live or archived
    let liveSections = [];
    let archivedSections = [];
    for (const currSection of sections) {
      if (currSection.hidden) {
        archivedSections.push(currSection);
      } else {
        liveSections.push(currSection);
      }
    }

    return (
      <ContentContainer heading={heading} description={description}>
        <JoinSectionNotifications
          action={action}
          result={result}
          name={resultName}
          id={resultId}
          sectionCapacity={sectionCapacity}
        />
        {liveSections.length > 0 && (
          <SectionsAsStudentTable
            sections={liveSections}
            canLeave={!!isTeacher}
            updateSections={this.updateSections}
            updateSectionsResult={this.updateSectionsResult}
          />
        )}
        {archivedSections.length > 0 && (
          <div>
            <div style={styles.buttonContainer}>
              <Button
                __useDeprecatedTag
                className="ui-test-show-hide"
                onClick={this.toggleViewHidden}
                icon={viewHidden ? 'caret-up' : 'caret-down'}
                text={
                  viewHidden
                    ? i18n.hideArchivedSections()
                    : i18n.viewArchivedSections()
                }
                color={Button.ButtonColor.gray}
              />
            </div>
            {viewHidden && (
              <div>
                <div style={styles.hiddenSectionLabel}>
                  {i18n.archivedSections()}
                </div>
                <div style={styles.hiddenSectionDesc}>
                  {i18n.archivedSectionsStudentDescription()}
                </div>
                <SectionsAsStudentTable
                  sections={archivedSections}
                  canLeave={!!isTeacher}
                  updateSections={this.updateSections}
                  updateSectionsResult={this.updateSectionsResult}
                />
              </div>
            )}
          </div>
        )}
        <JoinSection
          enrolledInASection={liveSections.length > 0}
          updateSections={this.updateSections}
          updateSectionsResult={this.updateSectionsResult}
        />
      </ContentContainer>
    );
  }
}
