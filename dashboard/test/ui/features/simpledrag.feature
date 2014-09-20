Feature: Blocks can be dragged

Background:
  Given I am on "http://learn.code.org/s/1/level/6?noautoplay=true"

Scenario: Connect two blocks from toolbox in landscape mode
  When I rotate to landscape
  And I press "x-close"
  And I drag block "1" to offset "160, 0"
  And I drag block "1" to block "5"
  And I wait for 1 seconds
  Then block "6" is child of block "5"

Scenario: Connect two blocks from toolbox in portait mode
  When I press "ok-button"
  And I drag block "1" to offset "160, 0"
  And I drag block "1" to block "5"
  And I wait for 1 seconds
  Then block "6" is child of block "5"
