Feature: Bounce blocks can be dragged

Background:
  Given I am on "http://studio.code.org/s/events/lessons/1/levels/1?noautoplay=true"

Scenario: Connect two blocks from toolbox
  When I rotate to landscape
  And I wait for the page to fully load
  And I drag Google Blockly block "1" to block "0"
  And I drag Google Blockly block "2" to block "0"
  And I wait for 1 seconds
  Then Google Blockly block "2" is child of block "1"
