@eyes_mobile
Feature: Look at mobile portait view

  # When viewing our puzzles on a mobile phone in portrait mode, an image and text
  # should appear telling you to flip to landscape. We've regressed this multiple
  # times. This test is meant to prevent doing so again.
  Scenario Outline: Simple blockly level page view
    Given I am on "<url>"
    And I wait for the page to fully load
    Then I open my eyes to test "<test_name>"
    And I rotate to portrait
    And I wait for the page to fully load
    And I see no difference for "initial load"
    And I close my eyes
    Examples:
      | url                                                                      | test_name     |
      | http://studio.code.org/s/allthethings/lessons/18/levels/5?noautoplay=true  | droplet level |
      | http://studio.code.org/s/allthethings/lessons/37/levels/1?noautoplay=true  | artist level  |
