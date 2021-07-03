Feature: AI Lab

  Scenario: Training a model with an in-house dataset
    Given I am on "http://studio.code.org/s/allthethings/lessons/43/levels/1"
    And I wait until ".editor-column" contains text "Select the data set you would like to use."
    And I close the instructions overlay if it exists
    And I click selector ".ailab-image-hover"
    And I wait for 3 seconds
    And I see "#data-card"
    And I click selector "#continue-button" 
    And I wait until ".editor-column" contains text "Choose one column to predict."
    And I wait for 3 seconds
    And I close the instructions overlay if it exists
    When I select table column "1"
    And I see ".column-inspector"
    And I wait for 3 seconds
    And I click selector "#select-label-button"
    And I see "#remove-statement-label"
    And I wait for 3 seconds
    And I click selector "#continue-button"
    And I wait for 3 seconds
    And I wait until ".editor-column" contains text "choose one or more columns."
    And I close the instructions overlay if it exists
    When I select table column "2"
    And I wait for 3 seconds
    And I see ".column-inspector"
    And I click selector "#select-feature-button"
    And I click selector "#continue-button"
    

    