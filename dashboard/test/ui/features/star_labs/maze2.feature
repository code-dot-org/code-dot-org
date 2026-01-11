Feature: Complete a simple maze level

  Background:
    Given I am on "http://studio.code.org/reset_session"
    Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/2/levels/4?noautoplay=true"
    And I wait for the lab page to fully load
    And I dismiss the login reminder
    Then element ".csf-top-instructions p" has text "Use the \"repeat\" block to solve the puzzle quickly..."

  @no_mobile
  Scenario: Submit an incorrect program missing a block
    Then element "#runButton" is visible
    And element "#resetButton" is hidden
    Then I've initialized the workspace with incorrect maze blocks
    And I press "runButton"
    And I wait until element ".uitest-topInstructions-inline-feedback" is visible
    Then element "#runButton" is hidden
    And element "#resetButton" is visible
    And element ".uitest-topInstructions-inline-feedback" has escaped text "Not quite. Try using a block you aren’t using yet."

  Scenario: Submit a program with an empty repeat
    Then element "#runButton" is visible
    And element "#resetButton" is hidden
    # Drag out repeat block.
    Then I've initialized the workspace with empty repeat maze blocks
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
    Then I've initialized the workspace with too many maze blocks
    And I press "runButton"
    And I wait until element ".congrats" is visible
    And element ".congrats" has text "Congratulations! You completed Puzzle 4. (However, you could have used only 3 blocks.)"
    Then I press "again-button"
    And I press "resetButton"
    Then element "#runButton" is visible
    And element "#resetButton" is hidden
