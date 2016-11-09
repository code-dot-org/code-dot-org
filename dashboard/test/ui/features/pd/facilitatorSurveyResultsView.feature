@dashboard_db_access

Feature: Basic appearance for Facilitator Survey UI

Scenario: Facilitator View is as expected
  Given I am a facilitator with completed courses
  And I am on "http://studio.code.org/pd/workshop_dashboard/survey_results"
  And I wait to see "#surveyResultsTable"