import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ActivitiesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitiesEditor';
import ResourcesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ResourcesEditor';
import VocabulariesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/VocabulariesEditor';
import ProgrammingExpressionsEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ProgrammingExpressionsEditor';
import ObjectivesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ObjectivesEditor';
import StandardsEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/StandardsEditor';
import TextareaWithMarkdownPreview from '@cdo/apps/lib/levelbuilder/TextareaWithMarkdownPreview';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import AnnouncementsEditor from '@cdo/apps/lib/levelbuilder/announcementsEditor/AnnouncementsEditor';
import CollapsibleEditorSection from '@cdo/apps/lib/levelbuilder/CollapsibleEditorSection';
import RelatedLessons from './RelatedLessons';
import {
  relatedLessonShape,
  activityShape,
  resourceShape,
  vocabularyShape,
  programmingExpressionShape,
  standardShape
} from '@cdo/apps/lib/levelbuilder/shapes';
import $ from 'jquery';
import {connect} from 'react-redux';
import {
  getSerializedActivities,
  mapActivityDataForEditor,
  initActivities
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import {linkWithQueryParams, navigateToHref} from '@cdo/apps/utils';
import SaveBar from '@cdo/apps/lib/levelbuilder/SaveBar';

class LessonEditor extends Component {
  static propTypes = {
    relatedLessons: PropTypes.arrayOf(relatedLessonShape).isRequired,
    initialObjectives: PropTypes.arrayOf(PropTypes.object).isRequired,
    initialLessonData: PropTypes.object,

    // from redux
    activities: PropTypes.arrayOf(activityShape).isRequired,
    resources: PropTypes.arrayOf(resourceShape).isRequired,
    vocabularies: PropTypes.arrayOf(vocabularyShape).isRequired,
    programmingExpressions: PropTypes.arrayOf(programmingExpressionShape)
      .isRequired,
    standards: PropTypes.arrayOf(standardShape).isRequired,
    opportunityStandards: PropTypes.arrayOf(standardShape).isRequired,
    initActivities: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      isSaving: false,
      error: null,
      lastSaved: null,
      displayName: this.props.initialLessonData.name,
      overview: this.props.initialLessonData.overview || '',
      studentOverview: this.props.initialLessonData.studentOverview || '',
      assessmentOpportunities:
        this.props.initialLessonData.assessmentOpportunities || '',
      unplugged: this.props.initialLessonData.unplugged,
      lockable: this.props.initialLessonData.lockable,
      hasLessonPlan: this.props.initialLessonData.hasLessonPlan,
      creativeCommonsLicense: this.props.initialLessonData
        .creativeCommonsLicense,
      assessment: this.props.initialLessonData.assessment,
      purpose: this.props.initialLessonData.purpose || '',
      preparation: this.props.initialLessonData.preparation || '',
      announcements: this.props.initialLessonData.announcements || [],
      objectives: this.props.initialObjectives,
      originalLessonData: this.props.initialLessonData
    };
  }

  handleView = () => {
    navigateToHref(
      linkWithQueryParams(this.state.originalLessonData.lessonPath)
    );
  };

  handleSave = (event, shouldCloseAfterSave) => {
    event.preventDefault();

    this.setState({isSaving: true, lastSaved: null, error: null});

    $.ajax({
      url: `/lessons/${this.state.originalLessonData.id}`,
      method: 'PUT',
      dataType: 'json',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify({
        name: this.state.displayName,
        lockable: this.state.lockable,
        hasLessonPlan: this.state.hasLessonPlan,
        creativeCommonsLicense: this.state.creativeCommonsLicense,
        assessment: this.state.assessment,
        unplugged: this.state.unplugged,
        overview: this.state.overview,
        studentOverview: this.state.studentOverview,
        assessmentOpportunities: this.state.assessmentOpportunities,
        purpose: this.state.purpose,
        preparation: this.state.preparation,
        objectives: JSON.stringify(this.state.objectives),
        activities: getSerializedActivities(this.props.activities),
        resources: JSON.stringify(this.props.resources.map(r => r.key)),
        vocabularies: JSON.stringify(this.props.vocabularies.map(r => r.key)),
        programmingExpressions: JSON.stringify(
          this.props.programmingExpressions
        ),
        standards: JSON.stringify(this.props.standards),
        opportunityStandards: JSON.stringify(this.props.opportunityStandards),
        announcements: JSON.stringify(this.state.announcements),
        originalLessonData: JSON.stringify(this.state.originalLessonData)
      })
    })
      .done(data => {
        if (shouldCloseAfterSave) {
          if (data.hasLessonPlan) {
            navigateToHref(
              linkWithQueryParams(this.state.originalLessonData.lessonPath)
            );
          } else {
            navigateToHref(
              linkWithQueryParams(this.state.originalLessonData.scriptPath)
            );
          }
        } else {
          const activities = mapActivityDataForEditor(data.activities);

          this.props.initActivities(activities);
          this.setState({
            lastSaved: Date.now(),
            isSaving: false,
            originalLessonData: data
          });
        }
      })
      .fail(error => {
        this.setState({isSaving: false, error: error.responseText});
      });
  };

  handleUpdateAnnouncements = newAnnouncements => {
    this.setState({announcements: newAnnouncements});
  };

  handleUpdateObjectives = newObjectives => {
    this.setState({objectives: newObjectives});
  };

  render() {
    const {
      displayName,
      overview,
      studentOverview,
      assessmentOpportunities,
      unplugged,
      lockable,
      hasLessonPlan,
      creativeCommonsLicense,
      assessment,
      purpose,
      preparation,
      announcements
    } = this.state;
    const {relatedLessons, standards, opportunityStandards} = this.props;
    const frameworks = this.props.initialLessonData.frameworks;
    return (
      <div style={styles.editor}>
        <h1>Editing Lesson "{displayName}"</h1>
        <label>
          Title
          <input
            value={displayName}
            style={styles.input}
            onChange={e => this.setState({displayName: e.target.value})}
          />
        </label>

        <RelatedLessons relatedLessons={relatedLessons} />

        {!hasLessonPlan && (
          <div style={styles.warning}>
            All lesson plan fields are hidden because "Has Lesson Plan" is NOT
            checked. If you would like to edit the lesson plan for this lesson
            please go to General Lesson Settings and check "Has Lesson Plan".
          </div>
        )}

        <CollapsibleEditorSection
          title="General Lesson Settings"
          collapsed={hasLessonPlan}
        >
          <label>
            Lockable
            <input
              type="checkbox"
              checked={lockable}
              disabled={this.props.initialLessonData.unitIsLaunched}
              style={styles.checkbox}
              onChange={() => this.setState({lockable: !lockable})}
            />
            <HelpTip>
              {this.props.initialLessonData.unitIsLaunched ? (
                <p>Can't update lockable for visible unit.</p>
              ) : (
                <p>
                  Check this box if this lesson should be locked for students.
                  If checked, teachers will be able to unlock the lesson for
                  their students.
                </p>
              )}
            </HelpTip>
          </label>
          <label>
            Has Lesson Plan
            <input
              type="checkbox"
              checked={hasLessonPlan}
              disabled={this.props.initialLessonData.unitIsLaunched}
              style={styles.checkbox}
              onChange={() => this.setState({hasLessonPlan: !hasLessonPlan})}
            />
            <HelpTip>
              {this.props.initialLessonData.unitIsLaunched ? (
                <p>Can't update has lesson plan for visible unit.</p>
              ) : (
                <p>
                  Check this box if this lesson should have a lesson plan for
                  teachers associated with it.
                </p>
              )}
            </HelpTip>
          </label>
          <label>
            Assessment
            <input
              type="checkbox"
              checked={assessment}
              style={styles.checkbox}
              onChange={() => this.setState({assessment: !assessment})}
            />
            <HelpTip>
              <p>Check this box if this lesson is an assessment or project. </p>
            </HelpTip>
          </label>
          <label>
            Unplugged Lesson
            <input
              type="checkbox"
              checked={unplugged}
              style={styles.checkbox}
              onChange={() => this.setState({unplugged: !unplugged})}
            />
            <HelpTip>
              <p>
                Check this box if the lesson does not require use of a device.
              </p>
            </HelpTip>
          </label>
          <label>
            Creative Commons Image
            <select
              style={styles.dropdown}
              value={creativeCommonsLicense}
              onChange={e =>
                this.setState({creativeCommonsLicense: e.target.value})
              }
            >
              <option value="Creative Commons BY-NC-SA">
                Creative Commons BY-NC-SA
              </option>
              <option value="Creative Commons BY-NC-ND">
                Creative Commons BY-NC-ND
              </option>
            </select>
            <HelpTip>
              <p>
                Controls what creative commons license applies to this material.
                Default is Creative Commons BY-NC-SA.
              </p>
            </HelpTip>
          </label>
        </CollapsibleEditorSection>
        <CollapsibleEditorSection
          title="Overviews"
          collapsed={true}
          fullWidth={true}
        >
          <TextareaWithMarkdownPreview
            markdown={overview}
            label={'Overview'}
            inputRows={5}
            handleMarkdownChange={e =>
              this.setState({overview: e.target.value})
            }
            features={{
              imageUpload: true,
              resourceLink: true,
              programmingExpression: true
            }}
          />
          <TextareaWithMarkdownPreview
            markdown={studentOverview}
            label={'Student Overview'}
            inputRows={5}
            helpTip={
              'This overview will appear on the students Lessons Resources page.'
            }
            handleMarkdownChange={e =>
              this.setState({studentOverview: e.target.value})
            }
            features={{imageUpload: true, programmingExpression: true}}
          />
        </CollapsibleEditorSection>
        {hasLessonPlan && (
          <div>
            <CollapsibleEditorSection title="Announcements" collapsed={true}>
              <AnnouncementsEditor
                announcements={announcements}
                inputStyle={styles.input}
                updateAnnouncements={this.handleUpdateAnnouncements}
              />
            </CollapsibleEditorSection>

            <CollapsibleEditorSection
              title="Purpose and Prep"
              collapsed={true}
              fullWidth={true}
            >
              <TextareaWithMarkdownPreview
                markdown={purpose}
                label={'Purpose'}
                inputRows={5}
                handleMarkdownChange={e =>
                  this.setState({purpose: e.target.value})
                }
                features={{
                  imageUpload: true,
                  resourceLink: true,
                  programmingExpression: true
                }}
              />
              <TextareaWithMarkdownPreview
                markdown={preparation}
                label={'Preparation'}
                inputRows={5}
                handleMarkdownChange={e =>
                  this.setState({preparation: e.target.value})
                }
                features={{
                  imageUpload: true,
                  resourceLink: true,
                  programmingExpression: true
                }}
              />
            </CollapsibleEditorSection>

            <CollapsibleEditorSection
              title="Assessment Opportunities"
              collapsed={true}
              fullWidth={true}
            >
              <TextareaWithMarkdownPreview
                markdown={assessmentOpportunities}
                label={'Assessment Opportunities'}
                inputRows={5}
                handleMarkdownChange={e =>
                  this.setState({assessmentOpportunities: e.target.value})
                }
                features={{imageUpload: true, resourceLink: true}}
              />
            </CollapsibleEditorSection>

            <CollapsibleEditorSection
              title="Resources"
              collapsed={true}
              fullWidth={true}
            >
              {this.state.originalLessonData.courseVersionId ? (
                <ResourcesEditor
                  courseVersionId={
                    this.state.originalLessonData.courseVersionId
                  }
                  resourceContext="lessonResource"
                  resources={this.props.resources}
                />
              ) : (
                <h4>
                  A unit must be in a course version, i.e. a unit must belong to
                  a course or have 'Is a Standalone Course' checked, in order to
                  add resources.
                </h4>
              )}
            </CollapsibleEditorSection>

            <CollapsibleEditorSection
              title="Vocabulary"
              collapsed={true}
              fullWidth={true}
            >
              {this.state.originalLessonData.courseVersionId ? (
                <VocabulariesEditor
                  courseVersionId={
                    this.state.originalLessonData.courseVersionId
                  }
                />
              ) : (
                <h4>
                  A unit must be in a course version, i.e. a unit must belong to
                  a course or have 'Is a Standalone Course' checked, in order to
                  add vocabulary.
                </h4>
              )}
            </CollapsibleEditorSection>

            <CollapsibleEditorSection
              title="Code"
              collapsed={true}
              fullWidth={true}
            >
              <ProgrammingExpressionsEditor />
            </CollapsibleEditorSection>

            <CollapsibleEditorSection
              title="Objectives"
              collapsed={true}
              fullWidth={true}
            >
              <ObjectivesEditor
                objectives={this.state.objectives}
                updateObjectives={this.handleUpdateObjectives}
              />
            </CollapsibleEditorSection>
            <CollapsibleEditorSection
              title="Standards"
              collapsed={true}
              fullwidth={true}
            >
              <StandardsEditor
                standardType={'standard'}
                standards={standards}
                frameworks={frameworks}
              />
            </CollapsibleEditorSection>
            <CollapsibleEditorSection
              title="Opportunity Standards"
              collapsed={true}
              fullwidth={true}
            >
              <StandardsEditor
                standardType={'opportunityStandard'}
                standards={opportunityStandards}
                frameworks={frameworks}
              />
            </CollapsibleEditorSection>
          </div>
        )}
        <CollapsibleEditorSection title="Activities & Levels" fullWidth={true}>
          <ActivitiesEditor hasLessonPlan={hasLessonPlan} />
        </CollapsibleEditorSection>

        <SaveBar
          handleSave={this.handleSave}
          handleView={this.handleView}
          error={this.state.error}
          isSaving={this.state.isSaving}
          lastSaved={this.state.lastSaved}
        />
      </div>
    );
  }
}

const styles = {
  editor: {
    width: '100%'
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '4px 6px',
    color: '#555',
    border: '1px solid #ccc',
    borderRadius: 4,
    margin: 0
  },
  checkbox: {
    margin: '0 0 0 7px'
  },
  dropdown: {
    margin: '0 6px',
    width: 300
  },
  warning: {
    fontSize: 20,
    fontStyle: 'italic',
    padding: 10
  }
};

export const UnconnectedLessonEditor = LessonEditor;

export default connect(
  state => ({
    activities: state.activities,
    resources: state.resources,
    vocabularies: state.vocabularies,
    programmingExpressions: state.programmingExpressions,
    standards: state.standards,
    opportunityStandards: state.opportunityStandards
  }),
  {
    initActivities
  }
)(LessonEditor);
