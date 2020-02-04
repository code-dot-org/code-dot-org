@no_mobile
@as_student
Feature: App Lab Blocks Documentation

  Background:
    Given I create a student named "Lillian"

  Scenario: Documentation Renders Correct
    Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/4"
    And I wait for the page to fully load
    And element "#runButton" is visible
    # You only need to hover but click was a quick easy way to get the mouse in the right place
    When I click "#droplet_palette_block_moveForward"
    And I wait until element ".tooltip-example-link" is visible
    And I wait until element ".tooltip-example-link" contains text "See examples"
    When I click ".tooltip-example-link"
    And I switch to the first iframe
    And I wait for 1 second
    And I wait until element ".documentation-ui-test" is visible
    And I wait until ".content" contains text "moveForward"
    And I wait until "#doc_category" contains text "Turtle"
