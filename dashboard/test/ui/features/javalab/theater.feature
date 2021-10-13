@eyes
Feature: Theater

  @no_circle
  Scenario: GIF plays on run
    When I open my eyes to test "Theater GIF"
    Given I create a levelbuilder named "Simone"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/4"
    And I wait for the page to fully load
    Then I press "#levelbuilder-menu-toggle" using jQuery
    Then I press "runButton"
    And I wait for 15 seconds
    And I see no difference for "theater GIF" using stitch mode "none"
    Then I close my eyes
