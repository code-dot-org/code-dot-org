@as_student
Feature: Game Lab Export

Scenario: Export library animation
  Given I start a new Game Lab project
  And I switch to the animation tab
  And I add the bear animation from the library
  And I switch to the code tab in Game Lab
  And I press "runButton"

  Then I switch to the animation tab
  And I wait for the page to fully load
  And I wait until element ".icon-settings-export-white" is visible within element "iframe[src='/blockly/js/piskel/index.html']"
  And I switch to the first iframe
  And I wait until I don't see selector "#loadingMask"
  And I press the first ".icon-settings-export-white" element
  And I press the first ".gif-download-button" element
  And I switch to the default content
  And I add a new, blank animation