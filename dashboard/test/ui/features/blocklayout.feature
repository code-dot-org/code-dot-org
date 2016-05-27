Feature: Block auto-layout

Background:
  Given I am on "http://learn.code.org/flappy/10?noautoplay=true"
  And I rotate to landscape
  And I close the dialog

Scenario: Auto-placing malformed start blocks
  When I've initialized the workspace with an auto-positioned flappy puzzle with extra newlines
  Then block "18" is at offset "16, 16"
  And block "21" is at offset "16, 107"

Scenario: Auto-placing blocks
  When I've initialized the workspace with an auto-positioned flappy puzzle
  Then block "18" is at offset "16, 16"
  And block "21" is at offset "16, 107"

Scenario: Auto-placing blocks with XML positioning
  Given I am on "http://learn.code.org/s/allthethings/stage/5/puzzle/4?noautoplay=true"
  And I rotate to landscape
  And I close the dialog

  When I've initialized the workspace with a manually-positioned playlab puzzle

  Then block "17" is at offset "20, 16"
  And block "19" is at offset "16, 20"
  And block "21" is at offset "20, 20"
  And block "23" is at offset "16, 81"
