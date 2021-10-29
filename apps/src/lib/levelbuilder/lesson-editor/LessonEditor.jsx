import PropTypes from 'prop-types';
import React, {useState} from 'react';
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

function LessonEditor(props) {
  const {relatedLessons, standards, opportunityStandards} = props;
  const frameworks = props.initialLessonData.frameworks;

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [displayName, setDisplayName] = useState(props.initialLessonData.name);
  const [overview, setOverview] = useState(
    props.initialLessonData.overview || ''
  );
  const [studentOverview, setStudentOverview] = useState(
    props.initialLessonData.studentOverview || ''
  );
  const [assessmentOpportunities, setAssessmentOpportunities] = useState(
    props.initialLessonData.assessmentOpportunities || ''
  );
  const [unplugged, setUnplugged] = useState(props.initialLessonData.unplugged);
  const [lockable, setLockable] = useState(props.initialLessonData.lockable);
  const [hasLessonPlan, setHasLessonPlan] = useState(
    props.initialLessonData.hasLessonPlan
  );
  const [creativeCommonsLicense, setCreativeCommonsLicense] = useState(
    props.initialLessonData.creativeCommonsLicense
  );
  const [assessment, setAssessment] = useState(
    props.initialLessonData.assessment
  );
  const [purpose, setPurpose] = useState(props.initialLessonData.purpose || '');
  const [preparation, setPreparation] = useState(
    props.initialLessonData.preparation || ''
  );
  const [announcements, setAnnouncements] = useState(
    props.initialLessonData.announcements || []
  );
  const [objectives, setObjectives] = useState(props.initialObjectives);
  const [originalLessonData, setOriginalLessonData] = useState(
    props.initialLessonData
  );

  const handleView = () => {
    navigateToHref(linkWithQueryParams(originalLessonData.lessonPath));
  };

  const handleSave = (event, shouldCloseAfterSave) => {
    event.preventDefault();

    setIsSaving(true);
    setLastSaved(null);
    setError(null);

    $.ajax({
      url: `/lessons/${originalLessonData.id}`,
      method: 'PUT',
      dataType: 'json',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify({
        name: displayName,
        lockable: lockable,
        hasLessonPlan: hasLessonPlan,
        creativeCommonsLicense: creativeCommonsLicense,
        assessment: assessment,
        unplugged: unplugged,
        overview: overview,
        studentOverview: studentOverview,
        assessmentOpportunities: assessmentOpportunities,
        purpose: purpose,
        preparation: preparation,
        objectives: JSON.stringify(objectives),
        activities: getSerializedActivities(props.activities),
        resources: JSON.stringify(props.resources.map(r => r.key)),
        vocabularies: JSON.stringify(props.vocabularies.map(r => r.key)),
        programmingExpressions: JSON.stringify(props.programmingExpressions),
        standards: JSON.stringify(props.standards),
        opportunityStandards: JSON.stringify(props.opportunityStandards),
        announcements: JSON.stringify(announcements),
        originalLessonData: JSON.stringify(originalLessonData)
      })
    })
      .done(data => {
        if (shouldCloseAfterSave) {
          if (data.hasLessonPlan) {
            navigateToHref(linkWithQueryParams(originalLessonData.lessonPath));
          } else {
            navigateToHref(linkWithQueryParams(originalLessonData.scriptPath));
          }
        } else {
          const activities = mapActivityDataForEditor(data.activities);

          props.initActivities(activities);
          setLastSaved(Date.now());
          setIsSaving(false);
          setOriginalLessonData(data);
        }
      })
      .fail(error => {
        setIsSaving(false);
        setError(error.responseText);
      });
  };

  return (
    <div style={styles.editor}>
      <h1>Editing Lesson "{displayName}"</h1>
      <label>
        Title
        <input
          value={displayName}
          style={styles.input}
          onChange={e => setDisplayName(e.target.value)}
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
            disabled={props.initialLessonData.unitIsLaunched}
            style={styles.checkbox}
            onChange={() => setLockable(!lockable)}
          />
          <HelpTip>
            {props.initialLessonData.unitIsLaunched ? (
              <p>Can't update lockable for visible unit.</p>
            ) : (
              <p>
                Check this box if this lesson should be locked for students. If
                checked, teachers will be able to unlock the lesson for their
                students.
              </p>
            )}
          </HelpTip>
        </label>
        <label>
          Has Lesson Plan
          <input
            type="checkbox"
            checked={hasLessonPlan}
            disabled={props.initialLessonData.unitIsLaunched}
            style={styles.checkbox}
            onChange={() => setHasLessonPlan(!hasLessonPlan)}
          />
          <HelpTip>
            {props.initialLessonData.unitIsLaunched ? (
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
            onChange={() => setAssessment(!assessment)}
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
            onChange={() => setUnplugged(!unplugged)}
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
            onChange={e => setCreativeCommonsLicense(e.target.value)}
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
          handleMarkdownChange={e => setOverview(e.target.value)}
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
          handleMarkdownChange={e => setStudentOverview(e.target.value)}
          features={{imageUpload: true, programmingExpression: true}}
        />
      </CollapsibleEditorSection>
      {hasLessonPlan && (
        <div>
          <CollapsibleEditorSection title="Announcements" collapsed={true}>
            <AnnouncementsEditor
              announcements={announcements}
              inputStyle={styles.input}
              updateAnnouncements={value => setAnnouncements(value)}
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
              handleMarkdownChange={e => setPurpose(e.target.value)}
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
              handleMarkdownChange={e => setPreparation(e.target.value)}
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
                setAssessmentOpportunities(e.target.value)
              }
              features={{imageUpload: true, resourceLink: true}}
            />
          </CollapsibleEditorSection>

          <CollapsibleEditorSection
            title="Resources"
            collapsed={true}
            fullWidth={true}
          >
            {originalLessonData.courseVersionId ? (
              <ResourcesEditor
                courseVersionId={originalLessonData.courseVersionId}
                resourceContext="lessonResource"
                resources={props.resources}
              />
            ) : (
              <h4>
                A unit must be in a course version, i.e. a unit must belong to a
                course or have 'Is a Standalone Course' checked, in order to add
                resources.
              </h4>
            )}
          </CollapsibleEditorSection>

          <CollapsibleEditorSection
            title="Vocabulary"
            collapsed={true}
            fullWidth={true}
          >
            {originalLessonData.courseVersionId ? (
              <VocabulariesEditor
                courseVersionId={originalLessonData.courseVersionId}
              />
            ) : (
              <h4>
                A unit must be in a course version, i.e. a unit must belong to a
                course or have 'Is a Standalone Course' checked, in order to add
                vocabulary.
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
              objectives={objectives}
              updateObjectives={value => setObjectives(value)}
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
        handleSave={handleSave}
        handleView={handleView}
        error={error}
        isSaving={isSaving}
        lastSaved={lastSaved}
      />
    </div>
  );
}

LessonEditor.propTypes = {
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
