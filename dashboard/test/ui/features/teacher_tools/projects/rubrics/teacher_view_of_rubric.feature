@dashboard_db_access
@no_mobile
Feature: Teachers can see and give feedback on Rubrics

Background:
  Given I create a teacher-associated student named "Lillian"
  And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2"
  Then I wait to see "#runButton"
  And I press "runButton"
  And I wait to see "#submitButton"
  And I press "submitButton"
  And I wait to see "#confirm-button"
  And I press "confirm-button"

Scenario: As teacherm I can see the rubric.
  Then I sign in as "Teacher_Lillian"
  And I give user "Teacher_Lillian" authorized teacher permission
  And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2?enableExperiments=ai-rubrics"
  And I wait to see "#fab-contained"