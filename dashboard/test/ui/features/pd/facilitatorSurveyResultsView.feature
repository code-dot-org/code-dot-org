@dashboard_db_access
@eyes
@no_circle

Feature: Basic appearance for Facilitator Survey UI

Scenario: Facilitator View of surveys is as expected
  Given I log in as "pd_test_facilitator@code.org" with password "00secret"
  Given I am a facilitator with completed courses
  And I am on "http://studio.code.org/pd/workshop_dashboard/survey_results"
  And I wait to see "#surveyResultsTable"
  And I open my eyes to test "facilitator survey results"
  And I see no difference for "viewing facilitator survey results"
  And I close my eyes

Scenario: Organizer View of surveys is as expected
  Given I log in as "pd_test_facilitator@code.org" with password "00secret"
  Given I am an organizer with completed courses
  And I am on "http://studio.code.org/pd/workshop_dashboard/organizer_survey_results"
  And I wait to see "#surveyResultsTable"
  And I open my eyes to test "organizer survey results"
  And I see no difference for "viewing organizer survey results"
  And I close my eyes