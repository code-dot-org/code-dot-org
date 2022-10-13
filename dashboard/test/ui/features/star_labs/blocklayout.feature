Feature: Block auto-layout

Background:
  Given I am on "http://studio.code.org/flappy/10?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load

Scenario: Auto-placing malformed start blocks
  When I've initialized the workspace with an auto-positioned flappy puzzle with extra newlines
  Then Google Blockly block "0" is near offset "16, 16"
  And Google Blockly block "3" is near offset "16, 114"

Scenario: Auto-placing blocks
  When I've initialized the workspace with an auto-positioned flappy puzzle
  Then Google Blockly block "0" is near offset "16, 16"
  And Google Blockly block "3" is near offset "16, 114"

Scenario: Auto-placing blocks with XML positioning
  Given I am on "http://studio.code.org/s/allthethings/lessons/5/levels/4?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load

  When I've initialized the workspace with a manually-positioned playlab puzzle

  Then block "17" is near offset "20, 16"
  And block "19" is near offset "16, 20"
  And block "21" is near offset "20, 20"
  And block "23" is near offset "16, 81"
