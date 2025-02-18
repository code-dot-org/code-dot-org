@chrome
Feature: Google Blockly Custom Blocks

Background:
  Given I create a levelbuilder named "Simone"

Scenario: Poetry blocks
  And I am on "http://studio.code.org/pools/Poetry/blocks"
  And all blocks render with no unknown blocks

Scenario: Dance Party blocks
  And I am on "http://studio.code.org/pools/Dancelab/blocks"
  And all blocks render with no unknown blocks
