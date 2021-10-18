@eyes
Feature: Playground

  @no_circle
  Scenario: Interactive slide game renders and has clickable images
    When I open my eyes to test "Javalab Playground Slide Game"
    Given I create a levelbuilder named "Simone"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/9"
    And I wait for the page to fully load
    And I dismiss the teacher panel
    Then I press "#levelbuilder-menu-toggle" using jQuery
    And I see no difference for "initial page load" using stitch mode "none"
    Then I press "runButton"
    And I wait for 15 seconds
    And I see no difference for "initial game state" using stitch mode "none"

    # Click a tile and confirm that it moves as expected  
    Then I wait to see an image "/level_starter_assets/Allthethings Java Lab Playground/tile_1_2.png"
    And I click an image "/level_starter_assets/Allthethings Java Lab Playground/tile_1_2.png"
    And I wait for 2 seconds
    And I see no difference for "image clicked" using stitch mode "none"
    Then I close my eyes
