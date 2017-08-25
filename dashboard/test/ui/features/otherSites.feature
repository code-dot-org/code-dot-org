@eyes
Feature: Looking at other Pegasus sites with Applitools Eyes

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
  | http://uk.code.org/                                               | uk.code.org home           |
  | http://uk.code.org/about                                          | uk.code.org about          |
  | http://ro.code.org/                                               | ro.code.org home           |
  | http://ro.code.org/about                                          | ro.code.org about          |
  | http://code.org/curriculum/unplugged                              | code.org curriculum        |
