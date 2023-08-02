Feature: Flappy blocks can be dragged

Scenario: Connect two blocks from toolbox
  Given I am on "http://studio.code.org/flappy/1?noautoplay=true"
  When I wait for the page to fully load
  And I dismiss the login reminder
  And I wait to see ".blocklySvg"
  And I drag block "flap" to block "whenClick"
  And I drag block "playSound" to block "flap"
  And I wait for 1 seconds
  Then block "playSound" is child of block "flap"
