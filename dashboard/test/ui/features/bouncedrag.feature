Feature: Bounce blocks can be dragged

Background:
  Given I am on "http://learn.code.org/s/events/stage/1/puzzle/1?noautoplay=true"

Scenario: Connect two blocks from toolbox
  When I rotate to landscape
  And I close the dialog
  And I drag block "1" to offset "160, 0"
  And I drag block "1" to block "4"
  And I wait for 1 seconds
  Then block "5" is child of block "4"

Scenario: Connect two blocks from toolbox
  When I press "ok-button"
  And I drag block "1" to offset "160, 0"
  And I drag block "1" to block "4"
  And I wait for 1 seconds
  Then block "5" is child of block "4"
