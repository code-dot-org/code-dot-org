Feature: Level Progress

  Scenario: Progress is saved for signed-in student
    Given I am a student

    When I complete the level on "http://studio.code.org/s/allthethings/lessons/2/levels/1"
    Then I verify progress in the header of the current page is "perfect" for level 1
    And I verify progress in the header of the current page is "not_tried" for level 2

    When I am on "http://studio.code.org/s/allthethings/lessons/2/levels/2"
    And I wait for the page to fully load
    And I wait for 2 seconds
    Then I verify progress in the header of the current page is "perfect" for level 1
    And I verify progress in the header of the current page is "not_tried" for level 2

    When I am on "http://studio.code.org/s/allthethings"
    And I wait until element "td:contains(Maze)" is visible
    And I wait for 2 seconds
    Then I verify progress for stage 2 level 1 is "perfect"
    And I verify progress for stage 2 level 2 is "not_tried"

  Scenario: Progress is saved for signed-out student
    Given I am not signed in

    When I complete the level on "http://studio.code.org/s/allthethings/lessons/2/levels/1"
    Then I verify progress in the header of the current page is "perfect" for level 1
    And I verify progress in the header of the current page is "not_tried" for level 2

    When I am on "http://studio.code.org/s/allthethings/lessons/2/levels/2"
    And I wait for the page to fully load
    And I wait for 2 seconds
    Then I verify progress in the header of the current page is "perfect" for level 1
    And I verify progress in the header of the current page is "not_tried" for level 2

    When I am on "http://studio.code.org/s/allthethings"
    And I wait until element "td:contains(Maze)" is visible
    And I wait for 2 seconds
    Then I verify progress for stage 2 level 1 is "perfect"
    And I verify progress for stage 2 level 2 is "not_tried"
