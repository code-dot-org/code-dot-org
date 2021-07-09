Feature: AI Lab

  @as_student
  Scenario: Training a model with an in-house dataset
    Given I am on "http://studio.code.org/s/allthethings/lessons/43/levels/1"
    And I wait until ".editor-column" contains text "Select the data set you would like to use."
    And I close the instructions overlay if it exists
    And I click selector ".ailab-image-hover"
    And I wait for 2 seconds
    And I wait until ".editor-column" contains text "You just selected a dataset."
    And I see "#data-card"
    And I click selector "#continue-button" 
    And I wait until ".editor-column" contains text "Choose one column to predict."
    And I close the instructions overlay if it exists
    When I select table column "0"
    And I wait for 3 seconds
    And I see ".column-inspector"
    And I click selector "#select-label-button"
    And I see "#remove-statement-label"
    And I wait for 3 seconds
    And I click selector "#continue-button"
    And I wait until ".editor-column" contains text "choose one or more columns."
    And I close the instructions overlay if it exists
    When I select table column "1"
    And I wait for 3 seconds
    And I see ".column-inspector"
    And I click selector "#select-feature-button"
    And I click selector "#continue-button"
    And I wait until ".editor-column" contains text "Your model is being trained."
    And I close the instructions overlay if it exists
    And I see ".ailab-image-hover"
    And I click selector "#continue-button"
    And I wait until ".editor-column" contains text "Your model is being tested."
    And I see ".ailab-image-hover"
    And I click selector "#continue-button"
    And I wait until ".editor-column" contains text "Review the results."
    And I close the instructions overlay if it exists
    And I see "#results"
    And I wait for 3 seconds
    And I see "#predict"
    And I click selector "#details-button"
    And I wait until ".editor-column" contains text "Details of results are being shown."
    And I see "#results-details"
    And I click selector "#continue-button"
    And I wait until ".editor-column" contains text "Save the trained model for use in App Lab."
    And I close the instructions overlay if it exists
    And I see "#statement"
    And I see "#model-card-form"
    Then element "#continue-button" is disabled
    And I press keys "Name test" for element "#model-name-input"
    And I wait for 4 seconds
    And I blur selector "#model-name-input"
    And I click selector "#model-card-form"
    And I wait for 10 seconds
    And I click selector "#continue-button"
    And I wait until ".editor-column" contains text "You've successfully trained and saved your model."
    And I wait for 4 seconds
    And I close the instructions overlay if it exists
    And I wait for 4 seconds
    And I see "#statement"
    And I see "#model-card"
  
