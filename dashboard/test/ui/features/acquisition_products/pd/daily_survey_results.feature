@dashboard_db_access
@eyes
@skip

Feature: Basic appearance for Daily Survey UI

Scenario: Results view for facilitator survey UI is as expected
  Given I am a workshop administrator
  When I open my eyes to test "Daily Survey Results View"
  And I am viewing a workshop with fake survey results
  And I wait to see element with ID "SurveyTab"
  And I see no difference for "Pre Workshop Results View"
  And I click selector "#SurveyTab-tab-2"
  And I wait for 1 second
  And I see no difference for "Day 1 Results View"
  And I close my eyes
