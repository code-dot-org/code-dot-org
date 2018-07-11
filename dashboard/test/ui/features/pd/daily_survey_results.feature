@dashboard_db_access
@eyes

Feature: Basic appearance for Facilitator Survey UI

Scenario: Results view for facilitator survey UI is as expected
  Given I am a workshop administrator
  And I am viewing a workshop with fake survey results
  And I wait for 100 seconds