@eyes
Feature: Looking at other Pegasus sites with Applitools Eyes

Scenario Outline: Simple page view
  When I open my eyes to test "<test_name>"
  And I am on "<url>"
  And I dismiss the language selector
  When I rotate to landscape
  Then I see no difference for "initial load"
  And I close my eyes
  And I sign out
Examples:
  | url                                                               | test_name                  |
  | http://advocacy.code.org/                                         | advocacy.code.org home     |
  | http://code.org/curriculum/unplugged                              | code.org curriculum        |
