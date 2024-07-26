@eyes
Feature: Theater

  @no_circle
  Scenario: GIF plays on run
    When I open my eyes to test "Javalab Theater GIF Playback"
    Given I create a levelbuilder named "Simone"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/4"
    And I wait for the lab page to fully load
    And I dismiss the teacher panel
    Then I press "#levelbuilder-menu-toggle" using jQuery
    And I see no difference for "initial page load" using stitch mode "none"
    Then I press "runButton"
    And I wait for 15 seconds
    And I see no difference for "GIF end state" using stitch mode "none"
    Then I close my eyes
