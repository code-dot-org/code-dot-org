@as_student
Feature: App Lab Clipping

  Scenario: Load an app to edit and see the blocks unclipped in design mode
    Given I am on "http://studio.code.org/projects/applab"
    And I wait for the lab page to fully load
    Then I reload the page
    And I switch to design mode
    And I wait until element "#designModeViz.clip-content" is visible
    And selector "#designModeViz" has class "clip-content"
