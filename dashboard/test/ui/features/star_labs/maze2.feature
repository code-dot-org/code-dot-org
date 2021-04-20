Feature: Complete a simple maze level

  Background:
    Given I am on "http://studio.code.org/reset_session"
    Given I am on "http://studio.code.org/s/20-hour/lessons/2/levels/11?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I dismiss the login reminder
    Then element ".csf-top-instructions p" has text "Ok, one last time for practice - can you solve this one using only 4 blocks?"

  # This builds an uncommon program to avoid getting a crowdsourced hint.
  @no_mobile
  Scenario: Submit an incorrect program missing a block
    Then element "#runButton" is visible
    And element "#resetButton" is hidden
    # Repeat: move forward, turn right, turn right
    Then I drag block "4" to block "5"
    And I drag block "3" into first position in repeat block "6"
    And I drag block "1" to block "7"
    And I drag block "1" to block "8"
    And I press "runButton"
    And I wait until element ".uitest-topInstructions-inline-feedback" is visible
    Then element "#runButton" is hidden
    And element "#resetButton" is visible
    And element ".uitest-topInstructions-inline-feedback" has escaped text "Not quite. You have to use a block you aren’t using yet."

  Scenario: Submit a program with an empty repeat
    Then element "#runButton" is visible
    And element "#resetButton" is hidden
    # Drag out repeat block.
    Then I drag block "4" to block "5"
    And I press "runButton"
    And I wait until element ".uitest-topInstructions-inline-feedback" is visible
    Then element "#runButton" is hidden
    And element "#resetButton" is visible
    And element ".uitest-topInstructions-inline-feedback" has escaped text "The \"Repeat\" or \"If\" block needs to have other blocks inside it to work. Make sure the inner block fits properly inside the containing block."
    And I press "resetButton"
    Then element "#runButton" is visible
    And element "#resetButton" is hidden

  Scenario: Submit a working program that uses too many blocks
    Then element "#runButton" is visible
    And element "#resetButton" is hidden
    # move forward, Repeat: move forward, turn left, move forward
    Then I drag block "1" to block "5"
    And I drag block "4" to block "6"
    And I drag block "1" into first position in repeat block "7"
    And I drag block "2" to block "8"
    And I drag block "1" to block "9"
    And I press "runButton"
    And I wait until element ".congrats" is visible
    And element ".congrats" has text "Congratulations! You completed Puzzle 11. (However, you could have used only 5 blocks.)"
    Then I press "again-button"
    And I press "resetButton"
    Then element "#runButton" is visible
    And element "#resetButton" is hidden
