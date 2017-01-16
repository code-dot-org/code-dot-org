Feature: Showing embedded blocks in non-blockly levels
  Checks a non-blockly level with blocks embedded in an iframe, and makes sure
  that those blocks are rendered.

  Background:
    Given I am on "http://studio.code.org/s/allthethings/stage/13/puzzle/3?noautoplay=true"

  Scenario:
    When I wait until element ".content2 > iframe" is visible
    And I wait until element "svg.blocklySvg" is visible within element ".content2 > iframe"
    Then SVG element "g[block-id='1']" within element ".content2 > iframe" has class "blocklyUndraggable"
