@dashboard_db_access
@eyes
@no_circle

Feature: Basic appearance for Facilitator Survey UI

Scenario: Facilitator View of dashboard is as expected
  Given I log in as "pd_test_facilitator@code.org" with password "00secret"
  And I am on "http://studio.code.org/pd/workshop_dashboard"
  And I wait to see element with ID "endedWorkshopsTable"
  And I wait to see element with ID "inProgressWorkshopsTable"
  And I wait to see element with ID "notStartedWorkshopsTable"
  And I open my eyes to test "facilitator dashboard"
  And I see no difference for "viewing facilitator dashboard"
  And I close my eyes

Scenario: Organizer View of dashboard is as expected
  Given I log in as "pd_test_organizer@code.org" with password "00secret"
  And I am on "http://studio.code.org/pd/workshop_dashboard"
  And I wait to see element with ID "endedWorkshopsTable"
  And I wait to see element with ID "inProgressWorkshopsTable"
  And I wait to see element with ID "notStartedWorkshopsTable"
  And I open my eyes to test "organizer dashboard"
  And I see no difference for "viewing organizer dashboard"
  And I close my eyes