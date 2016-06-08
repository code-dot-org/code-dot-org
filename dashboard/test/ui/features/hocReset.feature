Feature: HOC reset resets client state

Scenario: hoc/reset resets videos, callouts, level progress
  Given I am on "http://studio.code.org/hoc/reset"
  And I rotate to landscape
  Then I wait to see ".video-modal"
  Then I close the dialog
  Then I wait to see a dialog titled "Puzzle 1 of 20"
  Then I close the dialog
  Then callout "1" is visible
  Then I am on "http://studio.code.org/hoc/2"
  Then I wait to see a dialog titled "Puzzle 2 of 20"
  Then I am on "http://studio.code.org/hoc/1"
  Then I wait to see a dialog titled "Puzzle 1 of 20"
  Then I close the dialog
  Then I am on "http://studio.code.org/hoc/reset"
  Then I wait until element ".video-modal" is visible
  Then I close the dialog
  Then I wait to see a dialog titled "Puzzle 1 of 20"
  Then callout "1" is visible
