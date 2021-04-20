@no_mobile
Feature: Submittable AppLab

Background:
  Given I create a teacher-associated student named "Lillian"
  And I am on "http://studio.code.org/s/allthethings/lessons/18/levels/7?noautoplay=true"
  Then I rotate to landscape
  And I wait to see "#runButton"

Scenario: Submit anything, unsubmit, be able to resubmit.
  # First, submit something.
  When I submit this level

  # Reload the page to see that unsubmit is the option.
  Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/7?noautoplay=true"
  And I wait to see "#unsubmitButton"

  # Unsubmit.
  Then I press "unsubmitButton"
  And I wait to see ".modal"
  And I press "confirm-button" to load a new page

  # Make sure that submit is the option after the page reloads.
  Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/7?noautoplay=true"
  And I press "runButton"
  And I wait to see "#submitButton"

Scenario: Submit anything, teacher is able to unsubmit
  # First, submit something.
  When I submit this level

  # Reload the page to see that unsubmit is the option.
  Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/7?noautoplay=true"
  And I wait to see "#unsubmitButton"

  # Unsubmit as teacher
  Then I sign in as "Teacher_Lillian"
  Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/7?noautoplay=true"
  And I wait to see ".show-handle"
  Then I click selector ".show-handle .fa-chevron-left"
  And I wait until element ".student-table" is visible
  And I click selector "#teacher-panel-container tr:nth(1)" to load a new page
  And I wait to see "#teacher-panel-container"
  Then I wait until element "#unsubmit-button-uitest" is visible
  And I press "#unsubmit-button-uitest" using jQuery to load a new page

  # Unsubmit should be disabled now
  And I wait for the page to fully load
  And I wait to see ".show-handle"
  And I wait until element ".student-table" is visible
  Then I wait until element "#unsubmit-button-uitest" is visible
  And element "#unsubmit-button-uitest" is disabled
  Then I sign out
