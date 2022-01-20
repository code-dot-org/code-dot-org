@as_student
Feature: Big Game Versions

  Background:
    Given I am on "http://studio.code.org/s/allthethings/lessons/13/levels/6?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And element "#runButton" is visible
    And element ".tooltip-x-close" is visible
    And callout "0" is visible
    And I close callout "0"
    And callout "0" is hidden

  @no_mobile
  Scenario: Big Game Versions

    # Create the initial version with title "VERSION_TEST"
    Then I press the first "g#game_title > .blocklyIconGroup > .blocklyText" element
    And I wait until element "#functionNameText" is visible
    And I type "" into "#functionNameText"
    And I press keys "VERSION_TEST" for element "#functionNameText"
    And I press the first "#modalEditorClose > .blocklyText" element
    And I wait until element "g#game_title > .blocklyText:eq(0)" contains text "VERSION_TEST"
    And I press "runButton"
    And I wait until element "#resetButton" is visible
    And I press "resetButton"

    # Reset the puzzle to the start
    Then I reset the puzzle to the starting version
    And I wait until element "g#game_title > .blocklyText:eq(0)" contains text "title"

    # Restore to the previous version, which should have title "VERSION_TEST"
    Then I press "versions-header"
    And I wait to see a dialog titled "Version History"
    And I close the dialog
    And I wait for 3 seconds
    Then I press "versions-header"
    And I wait until element "button:contains(Restore this Version):eq(0)" is visible
    And element "button.version-preview" is visible
    And I click selector "button:contains(Restore this Version):eq(0)"
    And I wait until element "#showVersionsModal" is gone
    And I wait for jquery to load
    And I wait until element "g#game_title > .blocklyText:eq(0)" contains text "VERSION_TEST"
