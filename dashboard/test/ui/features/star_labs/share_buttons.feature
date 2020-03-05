@as_student
  # need @as_student to log in in order to get to Game Lab since it's a droplet game

Feature: Share Buttons
  # Making How It Works button show up in Sprite Lab and not in Game Lab

  Scenario: How It Works Button appears for Sprite Lab share page
    Given I am on "http://studio.code.org/projects/spritelab"
    And I wait for the page to fully load
    When I navigate to the shared version of my project
    And I wait until element "#open-workspace" is visible
    Then I see "#open-workspace"

  Scenario: How It Works Button does not appear for Game Lab share page
    Given I am on "http://studio.code.org/projects/gamelab"
    And I wait for the page to fully load
    When I navigate to the shared version of my project
    And I wait until element "#gameButtons" is visible
    And element "#open-workspace" does not exist
