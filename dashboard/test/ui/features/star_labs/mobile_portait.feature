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
    # Stitching whether with scroll or css behaves extremely erratically on
    # mobile with the orientation warning, but fortunately this feature also
    # doesn't allow the user to scroll the page so it's not necessary to even
    # attempt. Disable stitching to prevent test flakiness.
    And I see no difference for "initial load" using stitch mode "none"
    And I close my eyes
    Examples:
      | url                                                                      | test_name     |
      | http://studio.code.org/s/allthethings/lessons/18/levels/5?noautoplay=true  | droplet level |
      | http://studio.code.org/s/allthethings/lessons/37/levels/1?noautoplay=true  | artist level  |
