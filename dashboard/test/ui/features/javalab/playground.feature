@eyes
Feature: Playground

  @no_circle
  Scenario: Slide Game
    When I open my eyes to test "Slide Game"
    Given I create a levelbuilder named "Simone"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/9"
    And I wait for the page to fully load
    Then I press "#levelbuilder-menu-toggle" using jQuery
    Then I press "runButton"
    And I wait for 15 seconds
    And I see no difference for "initial visualization state" using stitch mode "none"

    Then I wait to see an image "/level_starter_assets/Allthethings Java Lab Playground/tile_1_2.png"
    And I click an image "/level_starter_assets/Allthethings Java Lab Playground/tile_1_2.png"
    And I see no difference for "click handling" using stitch mode "none"
    Then I close my eyes
