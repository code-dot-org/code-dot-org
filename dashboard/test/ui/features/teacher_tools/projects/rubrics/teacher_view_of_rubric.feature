@no_mobile
Feature: Teachers can see and give feedback on Rubrics

Scenario: Teachers can give and send feedback on the rubric to students.
  Given I create an authorized teacher-associated student named "Lillian"

  # Student can see the rubric and submit work
  And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2?enableExperiments=ai-rubrics"
  And I click selector ".uitest-taRubricTab" once I see it
  Then I wait to see "#runButton"
  And I press "runButton"
  And I wait to see "#submitButton"
  And I press "submitButton"
  And I wait to see "#confirm-button"
  And I press "confirm-button"
  And I wait to see "#song_selector"

  # Teacher can see and submit feedback for a student
  Then I sign in as "Teacher_Lillian" and go home
  And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2?enableExperiments=ai-rubrics"
  And I wait to see "#ui-floatingActionButton"
  And I wait until element "#teacher-panel-container" is visible
  And I wait until element ".student-table" is visible
  And I click selector ".student-table tr:nth(1)" to load a new page
  And I click selector "#ui-floatingActionButton" once I see it
  And I click selector ".src-templates-rubrics-rubrics-module__learningGoalHeader strong:contains(Code Quality)" once I see it
  And I wait until element "span:contains(Extensive Evidence)" is visible
  Then I click selector "span:contains(Extensive Evidence)"
  And I click selector "#ui-teacherFeedback" once I see it
  And I press keys "Nice work Lillian!" for element "#ui-teacherFeedback"
  And I wait to see "#ui-autosaveConfirm"
  And I click selector "#ui-submitFeedbackButton" once I see it
  And I wait until element "p:contains(Feedback submitted at)" is visible

  # The teacher given feedback is recieved by the student
  Then I sign in as "Lillian"
  And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2?enableExperiments=ai-rubrics"
  And I click selector ".uitest-taRubricTab" once I see it
  And I wait until element "p:contains(Extensive Evidence)" is visible
  And I click selector ".src-templates-rubrics-rubrics-module__learningGoalHeader strong:contains(Code Quality)" once I see it
  And I wait until element "textarea:contains(Nice work Lillian!)" is visible


