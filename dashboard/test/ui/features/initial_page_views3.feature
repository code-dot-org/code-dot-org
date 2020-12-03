@eyes
Feature: Looking at a few things with Applitools Eyes - Part 3

  Background:
    Given I am on "http://studio.code.org/reset_session"

  @no_circle
  Scenario Outline: Temporarily circle disabled simple page view without instructions dialog
    Given I am on "http://studio.code.org/"
    And I am a student
    When I open my eyes to test "<test_name>"
    And I am on "<url>"
    When I rotate to landscape
    And I close the instructions overlay if it exists
    Then I see no difference for "initial load"
    And I close my eyes
    And I sign out
    Examples:
      | url                                                               | test_name                  |
      | http://code.org/                                                  | code.org homepage          |
      | https://studio.code.org/s/allthethings/stage/13/puzzle/3?noautoplay=true | embedded blocks     |

  Scenario Outline: Logged out simple page view without instructions dialog
    Given I am on "http://studio.code.org/"
    When I open my eyes to test "<test_name>"
    And I am on "<url>"
    And I dismiss the language selector
    When I rotate to landscape
    Then I see no difference for "initial load"
    And I close my eyes
    Examples:
      | url                                               | test_name                  |
      | http://studio.code.org/                           | logged out studio homepage |
      | http://studio.code.org/s/allthethings             | logged out script progress |
      | http://code.org/educate/regional-partner/playbook | regional partner playbook  |

  @no_circle
  Scenario Outline: Temporarily eyes disabled simple page view without instructions dialog
    Given I am on "http://studio.code.org/"
    When I open my eyes to test "<test_name>"
    And I am on "<url>"
    And I dismiss the language selector
    When I rotate to landscape
    Then I see no difference for "initial load"
    And I close my eyes
    Examples:
      | url                                                               | test_name                    |
      | http://code.org/?lock-hero=true                                   | logged out code.org homepage |
