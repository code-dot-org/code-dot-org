@no_mobile
Feature: Teachers can see and give feedback on Rubrics

Scenario: As teacherm I can see the rubric.
  Given I create an authorized teacher-associated student named "Lillian"


Then I sign in as "Teacher_Lillian" and go home
  And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2?enableExperiments=ai-rubrics"
  And I wait to see "#fab-contained"

Then I sign in as "Lillian"
  And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2"
  Then I wait to see "#runButton"
  And I press "runButton"
  And I wait to see "#submitButton"
  And I press "submitButton"
  And I wait to see "#confirm-button"
  And I press "confirm-button"
  And I wait to see "#song_selector"

  Then I sign in as "Teacher_Lillian" and go home
  And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/1"
  Then I wait to see "#runButton"
  And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2?enableExperiments=ai-rubrics"
  And I wait to see "#fab-contained"
  And I wait until element "#teacher-panel-container" is visible
  And I wait for 100 seconds
  And I wait until element ".uitest-sectionselect:contains(Untitled Section)" is visible
  And I select the "Untitled Section" option in dropdown "uitest-sectionselect"
  And I wait until element ".student-table" is visible
  And I click selector "#teacher-panel-container tr:nth(1)" to load a new page
  And I wait to see "#fab-contained"
  And I press "fab-contained"

