Feature: Block auto-layout

Background:
  Given I am on "http://learn.code.org/flappy/10?noautoplay=true"
  And I rotate to landscape
  And I press "x-close"

Scenario: Auto-placing malformed start blocks
  When I've initialized the workspace with an auto-positioned flappy puzzle with extra newlines
  Then block "18" is at offset "70, 30"
  And block "21" is at offset "70, 230"

Scenario: Auto-placing blocks
  When I've initialized the workspace with an auto-positioned flappy puzzle
  Then block "18" is at offset "70, 30"
  And block "21" is at offset "70, 230"
