Feature: Block auto-layout
Background:
  Given I am on "http://studio.code.org/flappy/10?noautoplay=true"
  And I wait for the lab page to fully load

Scenario: Auto-placing malformed start blocks
  When I've initialized the workspace with an auto-positioned flappy puzzle with extra newlines
  Then block "whenClick" is near offset "16, 81"
  And block "whenCollideGround" is near offset "16, 172"

Scenario: Auto-placing blocks
  When I've initialized the workspace with an auto-positioned flappy puzzle
  Then block "whenClick" is near offset "16, 81"
  And block "whenCollideGround" is near offset "16, 172"

Scenario: Auto-placing blocks with XML positioning
  Given I am on "http://studio.code.org/s/allthethings/lessons/5/levels/4?noautoplay=true"
  And I wait for the lab page to fully load

  When I've initialized the workspace with a manually-positioned playlab puzzle

  Then block "17" is near offset "20, 16"
  And block "19" is near offset "16, 20"
  And block "21" is near offset "20, 20"
  And block "23" is near offset "16, 81"
