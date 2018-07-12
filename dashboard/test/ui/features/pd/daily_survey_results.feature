@dashboard_db_access
@eyes

Feature: Basic appearance for Facilitator Survey UI

Scenario: Results view for facilitator survey UI is as expected
  Given I am a workshop administrator
  When I open my eyes to test "Daily Survey Results View"
  And I am viewing a workshop with fake survey results
  And I see no difference for "Results View"
  And I close my eyes