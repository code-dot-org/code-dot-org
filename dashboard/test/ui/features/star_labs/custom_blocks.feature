Feature: Sprite Lab Custom Blocks

Background:
  Given I create a levelbuilder named "Simone"

Scenario:
  And I am on "http://studio.code.org/pools/Poetry/blocks"
  And all blocks render with no unknown blocks

Scenario:
  And I am on "http://studio.code.org/pools/Dancelab/blocks"
  And all blocks render with no unknown blocks
