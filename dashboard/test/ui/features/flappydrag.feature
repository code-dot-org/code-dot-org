Feature: Flappy blocks can be dragged 

Background:
  Given I am on "http://learn.code.org/flappy/1?noautoplay=true"

Scenario: Connect two blocks from toolbox
  When I rotate to landscape
  And I press "x-close"
  And I drag block "1" to offset "220, 60"
  And I drag block "1" to block "4"
  And I wait for 1 seconds
  Then block "5" is child of block "4"

Scenario: Connect two blocks from toolbox
  When I press "ok-button"
  And I drag block "1" to offset "220, 60"
  And I drag block "1" to block "4"
  And I wait for 1 seconds
  Then block "5" is child of block "4"
