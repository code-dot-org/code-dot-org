@eyes
Feature: Looking at a few things with Applitools Eyes - Part 3

  Background:
    Given I am on "http://studio.code.org/reset_session"

  @no_ci
  Scenario Outline: Temporarily circle disabled simple dashboard page view without instructions dialog
    Given I am on "http://studio.code.org/"
    And I am a student
    When I open my eyes to test "<test_name>"
    And I am on "<url>"
    And I close the instructions overlay if it exists
    Then I see no difference for "initial load"
    And I close my eyes
    And I sign out
    Examples:
      | url                                                                                            | test_name           |
      | https://studio.code.org/courses/allthethingscourse/units/1/lessons/13/levels/1?noautoplay=true | embedded blocks     |

  @properties_encryption_key
  Scenario Outline: Logged out simple page view without instructions dialog
    Given I am on "http://studio.code.org/"
    When I open my eyes to test "<test_name>"
    And I am on "<url>"
    And I dismiss the language selector
    # The sign in page does not use Font Awesome, so do not wait for it to load
    Then I see no difference for "initial load" without waiting for Font Awesome to load
    And I close my eyes
    Examples:
      | url                                               | test_name                  |
      | http://studio.code.org/                           | logged out studio homepage |
      | http://studio.code.org/courses/allthethingscourse/units/1             | logged out script progress |
