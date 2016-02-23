Feature: Blocks can be dragged

Background:
  Given I am on "http://learn.code.org/s/20-hour/stage/2/puzzle/5?noautoplay=true"

Scenario: Connect two blocks from toolbox in landscape mode
  When I rotate to landscape
  And I close the dialog
  And I drag block "1" to offset "160, 100"
  And I drag block "1" to block "5"
  And I wait for 1 seconds
  Then block "6" is child of block "5"

Scenario: Connect two blocks from toolbox in portait mode
  When I wait to see "#ok-button"
  And I press "ok-button"
  And I drag block "1" to offset "160, 100"
  And I drag block "1" to block "5"
  And I wait for 1 seconds
  Then block "6" is child of block "5"
