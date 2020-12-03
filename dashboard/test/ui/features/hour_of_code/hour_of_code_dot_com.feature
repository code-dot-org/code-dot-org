@eyes
Feature: Looking at hourofcode.com with Applitools Eyes

Scenario Outline: Simple page view
  When I open my eyes to test "<test_name>"
  And I am on "<url>"
  When I rotate to landscape
  Then I see no difference for "initial load"
  And I close my eyes
  And I sign out
Examples:
  | url                                                               | test_name                  |
  | http://hourofcode.com/us                                          | hourofcode.com us          |
  | http://hourofcode.com/br                                          | hourofcode.com br          |
