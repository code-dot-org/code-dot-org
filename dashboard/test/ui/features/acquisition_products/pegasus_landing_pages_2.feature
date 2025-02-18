@eyes
@single_session
Feature: Looking at tutorial landing pages on Pegasus part Two

Scenario Outline: Simple page view
  When I open my eyes to test "<test_name>"
  And I am on "<url>"
  And I dismiss the language selector
  And I wait for the video thumbnails to load
  Then I see no difference for "initial load"
  And I close my eyes
  And I sign out
Examples:
  | url                                                               | test_name                  |
  | http://code.org/tools/applab                                      | app lab tutorial landing   |
  | http://code.org/dance                                             | dance tutorial landing     |
