@dashboard_db_access
@eyes

Feature: Basic appearance for Facilitator Survey UI

Scenario: Facilitator View is as expected
  Given I am a facilitator with completed courses
  And I am on "http://studio.code.org/pd/workshop_dashboard/survey_results"
  And I wait to see "#surveyResultsTable"
  And I open my eyes to test "facilitator survey results"
  And I see no difference for "viewing facilitator survey results"
  And I close my eyes