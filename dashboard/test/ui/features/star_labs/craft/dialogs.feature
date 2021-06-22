#  @eyes
@chrome
Feature: Minecraft dialog levels

  Scenario: Playing level 1, seeing character select dialog and re-playing
    Given I am on "http://studio.code.org/s/mc/lessons/1/levels/1?noautoplay=true&customSlowMotion=0.1"
#    And I open my eyes to test "Minecraft Level 1 dialogs"
    And "when run" refers to block "4"
    And "move forward" refers to block "1"
    And I rotate to landscape
    And I wait for the page to fully load
    Then I wait to see a "#getting-started-header"
#    And I see no difference for "Character select dialog"
    And I press "x-close"
#    And I see no difference for "Instructions dialog"
    And I wait to see "#runButton"
    And element "#runButton" is visible
    Then I wait until the Minecraft game is loaded
    And I press "runButton"
    Then I wait to see a ".uitest-topInstructions-inline-feedback"
    And element ".uitest-topInstructions-inline-feedback" has escaped text "Try using more commands to walk to the sheep."
#    And I see no difference for "Try again dialog"
    And I wait to see "#resetButton"
    And I press "resetButton"
    And I wait to see "#runButton"
    When I drag block "move forward" to block "when run"
    And I press "runButton"
    Then I wait to see a congrats dialog with title containing "Congratulations"
#    And I see no difference for "Congrats dialog with Replay"
    And I press "again-button"
    And I wait until element ".congrats" is gone
#    And I see no difference for "Closed congrats"
    And I wait to see "#resetButton"
    And I press "resetButton"
    And I wait to see "#runButton"
    And element "#runButton" is visible

#  @eyes
  @skip
  Scenario: Playing level 6, seeing house select dialog
    Given I am on "http://studio.code.org/s/mc/lessons/1/levels/6?noautoplay=true&customSlowMotion=0.1"
#    And I open my eyes to test "Minecraft Level 6 dialogs"
    And "when run" refers to block "12"
    And "toolbox repeat" refers to block "6"
    And "dragged repeat" refers to block "17"
    And "inner repeat" refers to block "13"
    And I rotate to landscape
    And I wait for the page to fully load
    Then I wait to see a "#getting-started-header"
#    And I see no difference for "House select dialog"
    And I press "close-house-select"
#    And I see no difference for "Instructions dialog"
    And I wait to see "#runButton"
    And element "#runButton" is visible
    Then I wait until the Minecraft game is loaded
    And I press "runButton"
    Then I wait to see a ".congrats"
    Then I wait to see a congrats dialog with title containing "Place blocks"
#    And I see no difference for "Try again dialog"
    And I wait to see "#resetButton"
    And I press "resetButton"
    And I wait to see "#runButton"
    When I drag block "toolbox repeat" to block "when run"
    When I drag block "inner repeat" to block "dragged repeat" plus offset 25, 25
    And I press "runButton"
    Then I wait to see a congrats dialog with title containing "Congratulations"
#    And I see no difference for "Congrats dialog with Replay"
    And I press "again-button"
    And I wait until element ".congrats" is gone
#    And I see no difference for "Closed congrats"
    And I wait to see "#resetButton"
    And I press "resetButton"
    And I wait to see "#runButton"
    And element "#runButton" is visible
