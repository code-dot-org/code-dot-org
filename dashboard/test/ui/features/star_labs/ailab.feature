Feature: AI Lab

  # We don't run this test on Drone currently because trained models can't be
  # saved to s3 from Drone with the current configuration.
  # JIRA STAR-1713
  @no_circle
  @as_student
  Scenario: Training a model with an in-house dataset and importing it into App Lab
    Given I am on "http://studio.code.org/s/allthethings/lessons/43/levels/1"
    And I wait to see ".editor-column"
    And I see the dynamic instructions are showing "selectDataset" key
    And I click selector "#overlay"
    And I select dataset "0"
    And I see the dynamic instructions are showing "selectedDataset" key
    And I wait to see "#data-card"
    And I click selector "#uitest-continue-button"
    And I see the dynamic instructions are showing "dataDisplayLabel" key
    And I click selector "#overlay"
    When I select data table column "1"
    And I see "#column-inspector"
    And I click selector "#uitest-select-label-button"
    And I see "#uitest-remove-statement-label"
    And I click selector "#uitest-continue-button"
    And I see the dynamic instructions are showing "dataDisplayFeatures" key
    And I click selector "#overlay"
    When I select data table column "2"
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
    And I press keys "123" for element "#uitest-model-name-input"
    And I wait until "#uitest-continue-button" is not disabled
    Then selector "#uitest-continue-button" doesn't have class "opacity"
    And I click "#uitest-continue-button"
    And I see the dynamic instructions are showing "modelSummary" key
    And I see "#statement"
    And I wait to see "#uitest-model-card"
    And I see ".ailab-image-hover"
    And I click selector "#uitest-continue-button"
    And I see "#codeApp"
    And I press the settings cog
    And I press the settings cog menu item "Manage AI Models"
    And I see "#uitest-ai-trained-models-header"
    And I wait to see "#uitest-model-card"
    And I click "#uitest-import-model-button"
    And I wait to see "#ModelName_predict_button"
    And I see "#ModelName_prediction"
    And element "#runButton" is visible
    And I press "runButton"
