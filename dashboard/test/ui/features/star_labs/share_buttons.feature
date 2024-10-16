@as_student
  # need @as_student to log in in order to get to Game Lab since it's a droplet game

Feature: Share Buttons
  # Making How It Works button show up in Sprite Lab and not in Game Lab

  Scenario: How It Works Button appears for Sprite Lab share page
    Given I am on "http://studio.code.org/projects/spritelab"
    And I wait for the lab page to fully load
    When I navigate to the shared version of my project
    And I wait until element "#open-workspace" is visible
    Then I see "#open-workspace"

  Scenario: How It Works Button does not appear for Game Lab share page
    Given I am on "http://studio.code.org/projects/gamelab"
    And I wait for the lab page to fully load
    When I navigate to the shared version of my project
    And I wait until element "#gameButtons" is visible
    And element "#open-workspace" does not exist

  # Making DPad button show up in Game Lab and not in Sprite Lab for phone

  # Ideally, the DPad should show up for tablets as well.
  # However, iPads on iOS 13+ are difficult to distinguish from
  # an iOS laptop via user agent. Tracking whether we want to fix this here,
  # and setting this to only phone for now:
  # https://codedotorg.atlassian.net/browse/SL-385

  @only_phone
  Scenario: Dpad does not appear for Sprite Lab Share
    Given I am on "http://studio.code.org/projects/spritelab/"
    And I wait for the lab page to fully load
    When I navigate to the shared version of my project
    And I wait until element "#gameButtons" is visible
    And element "#studio-dpad-rim" is not displayed

  @only_phone
  Scenario: Dpad appears for Game Lab Share
    Given I am on "http://studio.code.org/projects/gamelab/"
    And I wait for the lab page to fully load
    When I navigate to the shared version of my project
    And I wait until element "#gameButtons" is visible
    And element "#studio-dpad-rim" is displayed
