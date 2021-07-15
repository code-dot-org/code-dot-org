Feature: AI Lab

  @as_student
  Scenario: Training a model with an in-house dataset and importing it into App Lab
    Given I am on "http://studio.code.org/s/allthethings/lessons/43/levels/1"
    And I wait to see the dynamic instructions are showing "dynamic-instruction-selectDataset" key
    And I close the instructions overlay if it exists
    And I click selector ".ailab-dataset-image"
    And I wait to see the dynamic instructions are showing "dynamic-instruction-selectedDataset" key
    And I see "#data-card"
    And I click selector "#continue-button" 
    And I wait to see the dynamic instructions are showing "dynamic-instruction-dataDisplayLabel" key
    And I close the instructions overlay if it exists
    When I select data table column "0"
    And I see "#column-inspector"
    And I click selector "#select-label-button"
    And I see "#remove-statement-label"
    And I click selector "#continue-button"
    And I wait to see the dynamic instructions are showing "dynamic-instruction-dataDisplayFeatures" key
    And I close the instructions overlay if it exists
    When I select data table column "1"
    And I wait for 3 seconds
    And I see "#column-inspector"
    And I click selector "#select-feature-button"
    And I see "#remove-statement-feature"
    And I click selector "#continue-button"
    And I wait to see the dynamic instructions are showing "dynamic-instruction-trainModel" key
    And I close the instructions overlay if it exists
    And I see ".ailab-image-hover"
    And I click selector "#continue-button"
    And I wait to see the dynamic instructions are showing "dynamic-instruction-generateResults" key
    And I see ".ailab-image-hover"
    And I click selector "#continue-button"
    And I wait to see the dynamic instructions are showing "dynamic-instruction-results" key
    And I close the instructions overlay if it exists
    And I see "#results"
    And I wait for 2 seconds
    And I see "#predict"
    And I click selector "#details-button"
    And I wait to see the dynamic instructions are showing "dynamic-instruction-resultsDetails" key
    And I see "#results-details"
    And I click selector "#continue-button"
    And I wait to see the dynamic instructions are showing "dynamic-instruction-saveModel" key
    And I close the instructions overlay if it exists
    And I see "#statement"
    And I see "#model-card-form"
    Then element "#continue-button" is disabled
    And I press keys "Model Name" for element "#model-name-input"
    And I click selector "#continue-button"
    And I wait to see the dynamic instructions are showing "dynamic-instruction-modelSummary" key
    And I see "#statement"
    And I see "#model-card"
    And I see ".ailab-image-hover"
    And I click selector "#continue-button"
    And I see "#codeApp"
    And I press the settings cog
    And I press the settings cog menu item "Manage AI Models"
    And element "#ai-trained-models-header" has text "AI Trained Model"
    And I wait for 2 seconds
    And I see "#model-card"
    And I click "#import-model-button"
    And I wait for 2 seconds
    And I see "#ModelName_predict_button"
    And I see "#ModelName_prediction"
    And element "#runButton" is visible
    And I press "runButton"
