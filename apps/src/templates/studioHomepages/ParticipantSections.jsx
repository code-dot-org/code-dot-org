import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import ContentContainer from '../ContentContainer';
import Button from '@cdo/apps/templates/Button';
import SectionsAsStudentTable from './SectionsAsStudentTable';
import color from '@cdo/apps/util/color';
import styleConstants from '@cdo/apps/styleConstants';

export default class ParticipantSections extends Component {
  static propTypes = {
    sections: PropTypes.array.isRequired,
    isTeacher: PropTypes.bool,
    isPlSections: PropTypes.bool,
    updateSectionsResult: PropTypes.func.isRequired,
    updateSections: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      viewHidden: false,
    };
  }

  toggleViewHidden = () => {
    this.setState({
      viewHidden: !this.state.viewHidden,
    });
  };

  render() {
    const {isTeacher, isPlSections, sections} = this.props;
    const {viewHidden} = this.state;

    const heading = isTeacher
      ? isPlSections
        ? i18n.plSectionsJoined()
        : i18n.sectionsJoined()
      : i18n.sectionsTitle();
    const description = isTeacher ? '' : i18n.enrollmentDescription();

    const styles = {
      buttonContainer: {
        width: styleConstants['content-width'],
        textAlign: 'right',
        paddingTop: 10,
        paddingBottom: 10,
      },
      hiddenSectionLabel: {
        fontSize: 18,
        paddingBottom: 10,
        color: color.charcoal,
      },
      hiddenSectionDesc: {
        fontSize: 14,
        lineHeight: '22px',
        paddingBottom: 10,
        color: color.charcoal,
      },
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
        {liveSections.length > 0 && (
          <SectionsAsStudentTable
            sections={liveSections}
            canLeave={!!isTeacher}
            updateSections={this.props.updateSections}
            updateSectionsResult={this.props.updateSectionsResult}
            isPlSections={this.props.isPlSections}
          />
        )}
        {archivedSections.length > 0 && (
          <div>
            <div style={styles.buttonContainer}>
              <Button
                className="ui-test-show-hide"
                onClick={this.toggleViewHidden}
                icon={viewHidden ? 'caret-up' : 'caret-down'}
                text={
                  viewHidden
                    ? i18n.hideArchivedSections()
                    : i18n.viewArchivedSections()
                }
                color={Button.ButtonColor.gray}
                style={{margin: 0}}
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
                  updateSections={this.props.updateSections}
                  updateSectionsResult={this.props.updateSectionsResult}
                />
              </div>
            )}
          </div>
        )}
      </ContentContainer>
    );
  }
}
