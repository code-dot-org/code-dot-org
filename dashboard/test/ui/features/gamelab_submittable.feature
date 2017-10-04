@no_mobile
@as_taught_student
Feature: Submittable GameLab

Background:
  Given I am on "http://studio.code.org/s/allthethings/stage/19/puzzle/1?noautoplay=true"
  Then I rotate to landscape
  And I wait to see "#runButton"

Scenario: Submit anything, unsubmit, be able to resubmit.
  # First, submit something.
  When I press "runButton"
  And I wait to see "#submitButton"
  And I press "submitButton"
  And I wait to see ".modal"
  And I press "confirm-button" to load a new page

  # Reload the page to see that unsubmit is the option.
  Then I am on "http://studio.code.org/s/allthethings/stage/19/puzzle/1?noautoplay=true"
  And I wait to see "#unsubmitButton"

  # Unsubmit.
  Then I press "unsubmitButton"
  And I wait to see ".modal"
  And I press "confirm-button" to load a new page

  # Make sure that submit is the option after the page reloads.
  Then I am on "http://studio.code.org/s/allthethings/stage/19/puzzle/1?noautoplay=true"
  And I press "runButton"
  And I wait to see "#submitButton"

Scenario: 'Help & Tips' and 'Instruction' tabs are visible
  Given I am on "http://studio.code.org/s/allthethings/stage/19/puzzle/3?enableExperiments=resourcesTab"
  When I click selector ".uitest-helpTab" if I see it
  And I wait until ".editor-column" contains text "Help Tab"
  And I click selector ".uitest-instructionsTab" if I see it
  And I wait until ".editor-column" contains text "Instructions"
  Then I am on "http://studio.code.org/s/allthethings/stage/19/puzzle/3?disableExperiments=resourcesTab"
