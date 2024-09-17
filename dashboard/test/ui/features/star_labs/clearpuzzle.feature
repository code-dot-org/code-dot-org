Feature: Clear Puzzle

Background:
  Given I am on "http://studio.code.org/hoc/1?noautoplay=true"
  And I wait for the lab page to fully load
  Then element "#runButton" is visible
  And element "#resetButton" is hidden

Scenario: Deleting start blocks then clearing the puzzle
  Then I delete block "startBlock"
  Then I press "clear-puzzle-header"
  And I wait to see ".modal"
  And I press "confirm-button"
  Then block "startBlock" is child of block "topBlock"

Scenario: Adding blocks then clearing the puzzle
  Then I drag block "moveForward" to block "startBlock"
  Then I drag block "turnRight" to block "moveForward"
  Then I press "clear-puzzle-header"
  And I wait to see ".modal"
  And I press "confirm-button"
  And block "moveForward" has been deleted
  And block "turnRight" has been deleted
