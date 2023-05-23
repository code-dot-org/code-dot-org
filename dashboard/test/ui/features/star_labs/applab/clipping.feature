@as_student
Feature: App Lab Clipping

  Scenario: Load an app to edit and see the blocks unclipped in design mode
    Given I am on "http://studio.code.org/projects/applab"
    And I wait for the page to fully load
    Then I reload the page
    And I switch to design mode
    And I wait up to 1 seconds for element "#designModeViz.clip-content" to be visible
