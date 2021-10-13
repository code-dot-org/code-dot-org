@eyes
Feature: Playground

  @no_circle
  Scenario: Initialize Playground on Run
    When I open my eyes to test "Playground Slide Game"
    Given I create a levelbuilder named "Simone"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/9"
    And I wait for the page to fully load
    Then I press "#levelbuilder-menu-toggle" using jQuery
    Then I press "runButton"
    And I wait for 15 seconds
    And I see no difference for "playground slide game" using stitch mode "none"
    Then I close my eyes
