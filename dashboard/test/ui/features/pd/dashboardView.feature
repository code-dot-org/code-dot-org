@dashboard_db_access
@eyes

Feature: Basic appearance for Facilitator Survey UI

Scenario: Facilitator View of dashboard is as expected
  Given I am a facilitator with started and completed courses
  And I am on "http://studio.code.org/pd/workshop_dashboard"
  And I wait for 5 seconds
  And I open my eyes to test "facilitator dashboard"
  And I see no difference for "viewing facilitator dashboard"
  And I close my eyes

Scenario: Facilitator View of dashboard is as expected
  Given I am an organizer with started and completed courses
  And I am on "http://studio.code.org/pd/workshop_dashboard"
  And I wait for 5 seconds
  And I open my eyes to test "organizer dashboard"
  And I see no difference for "viewing organizer dashboard"
  And I close my eyes