@no_mobile
Feature: Map Levels

  # Map levels should render the content from curriculum builder inside an iframe

  Background:
    Given I create a student named "Lillian"

  Scenario: Map level displays content
    Given I am on "http://studio.code.org/s/allthethings/stage/35/puzzle/1?noautoplay=true"
    Then I rotate to landscape
    And I wait to see "#curriculum-reference"
    And I switch to the first iframe
    And I wait until "#body" contains text "Welcome to the Circuit Playground"
    And I wait until "#body" contains text "The Light Emitting Diode (LED)"
