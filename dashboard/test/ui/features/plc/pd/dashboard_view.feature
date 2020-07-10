@dashboard_db_access
@eyes

Feature: Basic appearance for Facilitator Survey UI

@skip
Scenario: Facilitator View of surveys is as expected
  Given I am a facilitator with completed courses
  And I am on "http://studio.code.org/pd/workshop_dashboard/survey_results"
  And I wait to see "#surveyResultsTable"
  And I open my eyes to test "facilitator survey results"
  And I see no difference for "viewing facilitator survey results"
  And I close my eyes

Scenario: Organizer View of dashboard is as expected
  Given I am an organizer with started and completed courses
  And I am on "http://studio.code.org/pd/workshop_dashboard"
  And I wait to see element with ID "endedWorkshopsTable"
  And I wait to see element with ID "inProgressWorkshopsTable"
  And I wait to see element with ID "notStartedWorkshopsTable"
  And I open my eyes to test "organizer dashboard"
  And I see no difference for "viewing organizer dashboard"
  And I close my eyes
