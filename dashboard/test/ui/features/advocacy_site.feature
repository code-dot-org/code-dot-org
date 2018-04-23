@eyes
Feature: Looking at advocacy.code.org with Applitools Eyes

  Background:
    Given I am on "http://studio.code.org/reset_session"

@dashboard_db_access
Scenario Outline: Logged in simple page view
  Given I am on "http://studio.code.org/"
  And I am a student
  When I open my eyes to test "<test_name>"
  And I am on "<url>"
  When I rotate to landscape
  Then I see no difference for "initial load"
  And I close my eyes
  And I sign out
Examples:
  | url                                                               | test_name                  |
  | http://advocacy.code.org                                          | advocacy.code.org          |

Scenario Outline: Logged out simple page view
  Given I am on "http://studio.code.org/"
  When I open my eyes to test "<test_name>"
  And I am on "<url>"
  When I rotate to landscape
  Then I see no difference for "initial load"
  And I close my eyes
Examples:
  | url                                                               | test_name                    |
  | http://advocacy.code.org                                          | logged out advocacy.code.org |
