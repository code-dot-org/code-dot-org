Feature: Blocks can be dragged from popouts

Background:
  Given I am on "http://learn.code.org/s/1/level/59?noautoplay=true"

Scenario: Connect two blocks from toolbox
  When I rotate to landscape
  And I press "x-close"
  And I press ":1.label"
  And I drag block "2" to block "1"
  And I press ":2.label"
  And I drag block "8" to block "6"
  And I wait for 1 seconds
  Then block "12" is child of block "6"
