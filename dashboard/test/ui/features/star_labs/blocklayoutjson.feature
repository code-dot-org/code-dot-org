Feature: Block auto-layout after JSON conversion

Background:
  Given I am on "http://studio.code.org/flappy/10?noautoplay=true&enableExperiments=blocklyJson"
  And I rotate to landscape
  And I wait for the page to fully load

Scenario: Auto-placing malformed start blocks
  When I've initialized the workspace with an auto-positioned flappy puzzle with extra newlines
  Then block "whenClick" is near offset "16, 86"
  And block "whenCollideGround" is near offset "16, 114"

Scenario: Auto-placing blocks
  When I've initialized the workspace with an auto-positioned flappy puzzle
  Then block "whenClick" is near offset "16, 86"
  And block "whenCollideGround" is near offset "16, 114"
