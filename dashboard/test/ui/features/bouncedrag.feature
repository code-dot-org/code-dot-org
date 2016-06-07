Feature: Bounce blocks can be dragged

Background:
  Given I am on "http://learn.code.org/s/events/stage/1/puzzle/1?noautoplay=true"

Scenario: Connect two blocks from toolbox
  When I rotate to landscape
  And I wait to see a dialog titled "Puzzle 1 of 10"
  And I close the dialog
  And I drag block "1" to block "3"
  And I drag block "1" to block "4"
  And I wait for 1 seconds
  Then block "5" is child of block "4"
