import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import manageStudents, {
  setLoginType,
  setShowSharingColumn
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import teacherSections, {
  setSections,
  selectSection,
  setRosterProvider,
  setValidAssignments,
  setValidGrades,
  setTextToSpeechScriptIds,
  setPreReaderScriptIds,
  setLessonExtrasScriptIds
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import sectionData, {setSection} from '@cdo/apps/redux/sectionDataRedux';
import stats from '@cdo/apps/templates/teacherDashboard/statsRedux';
import textResponses from '@cdo/apps/templates/textResponses/textResponsesRedux';
import sectionAssessments from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';
import sectionProgress, {
  setShowSectionProgressDetails
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import sectionStandardsProgress from '@cdo/apps/templates/sectionProgress/standards/sectionStandardsProgressRedux';
import scriptSelection from '@cdo/apps/redux/scriptSelectionRedux';
import TeacherDashboard from '@cdo/apps/templates/teacherDashboard/TeacherDashboard';
import currentUser, {
  setCurrentUserId,
  setCurrentUserName,
  setCurrentUserHasSeenStandardsReportInfo
} from '@cdo/apps/templates/currentUserRedux';
import {setValidScripts} from '../../../../redux/scriptSelectionRedux';
import locales, {setLocaleCode} from '@cdo/apps/redux/localesRedux';

const script = document.querySelector('script[data-dashboard]');
const scriptData = JSON.parse(script.dataset.dashboard);
const {
  section,
  sections,
  validGrades,
  validScripts,
  studentScriptIds,
  validCourses,
  currentUserId,
  hasSeenStandardsReportInfo,
  localeCode,
  textToSpeechScriptIds,
  preReaderScriptIds,
  lessonExtrasScriptIds,
  showSectionProgressDetails
} = scriptData;
const baseUrl = `/teacher_dashboard/sections/${section.id}`;

$(document).ready(function() {
  registerReducers({
    teacherSections,
    sectionData,
    manageStudents,
    sectionProgress,
    scriptSelection,
    stats,
    textResponses,
    sectionAssessments,
    currentUser,
    sectionStandardsProgress,
    locales
  });
  const store = getStore();
  // TODO: (madelynkasula) remove duplication in sectionData.setSection and teacherSections.setSections
  store.dispatch(setCurrentUserId(currentUserId));
  store.dispatch(setCurrentUserName(scriptData.userName));
  store.dispatch(
    setCurrentUserHasSeenStandardsReportInfo(hasSeenStandardsReportInfo)
  );
  store.dispatch(setSection(section));
  store.dispatch(setSections(sections));
  store.dispatch(selectSection(section.id));
  store.dispatch(setRosterProvider(section.login_type));
  store.dispatch(setLoginType(section.login_type));
  store.dispatch(setValidAssignments(validCourses, validScripts));
  store.dispatch(setValidGrades(validGrades));
  store.dispatch(setLocaleCode(localeCode));
  store.dispatch(setLessonExtrasScriptIds(lessonExtrasScriptIds));
  store.dispatch(setTextToSpeechScriptIds(textToSpeechScriptIds));
  store.dispatch(setPreReaderScriptIds(preReaderScriptIds));
  store.dispatch(setShowSectionProgressDetails(showSectionProgressDetails));

  if (!section.sharing_disabled && section.script.project_sharing) {
    store.dispatch(setShowSharingColumn(true));
  }

  store.dispatch(
    setValidScripts(validScripts, studentScriptIds, validCourses, section)
  );

  ReactDOM.render(
    <Provider store={store}>
      <Router basename={baseUrl}>
        <Route
          path="/"
          component={props => (
            <TeacherDashboard
              {...props}
              studioUrlPrefix={scriptData.studioUrlPrefix}
              sectionId={section.id}
              sectionName={section.name}
              studentCount={section.students.length}
            />
          )}
        />
      </Router>
    </Provider>,
    document.getElementById('teacher-dashboard')
  );
});
