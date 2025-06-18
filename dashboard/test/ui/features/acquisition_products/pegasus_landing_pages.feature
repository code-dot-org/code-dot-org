@eyes
@single_session
@pegasus_content
Feature: Looking at tutorial landing pages on Pegasus

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
  | http://hourofcode.com/us/learn                                    | hoc learn landing page     |
