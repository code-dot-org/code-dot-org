@eyes
Feature: Looking at csedweek.org with Applitools Eyes

Scenario Outline: Simple page view
  When I open my eyes to test "<test_name>"
  And I am on "<url>"
  When I rotate to landscape
  Then I see no difference for "initial load"
  And I close my eyes
  And I sign out
Examples:
  | url                                                               | test_name                  |
  | http://csedweek.org/                                              | csedweek.org home          |
  | http://csedweek.org/about                                         | csedweek.org about         |
