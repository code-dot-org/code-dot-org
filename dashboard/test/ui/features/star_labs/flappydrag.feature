Feature: Flappy blocks can be dragged

Scenario: Connect two blocks from toolbox
  Given I am on "http://studio.code.org/flappy/1?noautoplay=true"
  When I rotate to landscape
  And I wait for the page to fully load
  And I dismiss the login reminder
  And I wait to see ".blocklySvg"
  And I drag Google Blockly block "1" to block "0"
  And I drag Google Blockly block "1" to block "0"
  And I wait for 1 seconds
  Then Google Blockly block "2" is child of block "1"
