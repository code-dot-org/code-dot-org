Feature: AI Lab

  @as_student
  Scenario: Training a model with an in-house dataset and importing it into App Lab
    Given I am on "http://studio.code.org/s/allthethings/lessons/43/levels/1"
    And I wait to see ".editor-column"
    And I see the dynamic instructions are showing "selectDataset" key
    And I click selector "#overlay"
    And I click selector ".uitest-ailab-dataset-image"
    And I see the dynamic instructions are showing "selectedDataset" key
    And I see "#data-card"
    And I click selector "#uitest-continue-button" 
    And I see the dynamic instructions are showing "dataDisplayLabel" key
    And I click selector "#overlay"
    When I select data table column "0"
    And I see "#column-inspector"
    And I click selector "#uitest-select-label-button"
    And I see "#uitest-remove-statement-label"
    And I click selector "#uitest-continue-button"
    And I see the dynamic instructions are showing "dataDisplayFeatures" key
    And I click selector "#overlay"
    When I select data table column "1"
    And I see "#column-inspector"
    And I click selector "#uitest-add-feature-button"
    And I see "#uitest-remove-statement-feature"
    And I click selector "#uitest-continue-button"
    And I see the dynamic instructions are showing "trainModel" key
    And I click selector "#overlay"
    And I see ".ailab-image-hover"
    And I click selector "#uitest-continue-button"
    And I see the dynamic instructions are showing "generateResults" key
    And I see ".ailab-image-hover"
    And I click selector "#uitest-continue-button"
    And I see the dynamic instructions are showing "results" key
    And I click selector "#overlay"
    And I see "#results"
    And I wait to see "#predict"
    And I click selector "#uitest-details-button"
    And I see the dynamic instructions are showing "resultsDetails" key
    And I see "#results-details"
    And I click selector "#uitest-continue-button"
    And I see the dynamic instructions are showing "saveModel" key
    And I click selector "#overlay"
    And I see "#statement"
    And I see "#uitest-model-card-form"
    Then element "#uitest-continue-button" is disabled
    And I press keys "Model Name" for element "#uitest-model-name-input"
    And I click selector "#uitest-continue-button"
    And I see the dynamic instructions are showing "modelSummary" key
    And I see "#statement"
    And I wait to see "#uitest-model-card"
    And I see ".ailab-image-hover"
    And I click selector "#uitest-continue-button"
    And I see "#codeApp"
    And I press the settings cog
    And I press the settings cog menu item "Manage AI Models"
    And element "#uitest-ai-trained-models-header" has text "AI Trained Model"
    And I wait to see "#uitest-model-card"
    And I click "#uitest-import-model-button"
    And I wait to see "#ModelName_predict_button"
    And I see "#ModelName_prediction"
    And element "#runButton" is visible
    And I press "runButton"
