@no_mobile
@as_taught_student
Feature: Submittable WebLab

Background:
  Given I am on "http://studio.code.org/s/allthethings/stage/32/puzzle/1?noautoplay=true"
  Then I rotate to landscape
  And I wait until element "#submitButton" is visible

Scenario: Submit anything, unsubmit, be able to resubmit.
  # First, submit something.
  When I press "submitButton"
  And I wait to see ".modal"
  And I press "confirm-button" to load a new page

  # Reload the page to see that unsubmit is the option.
  Then I am on "http://studio.code.org/s/allthethings/stage/32/puzzle/1?noautoplay=true"
  And I wait until element "#unsubmitButton" is visible

  # Unsubmit.
  Then I press "unsubmitButton"
  And I wait to see ".modal"
  And I press "confirm-button" to load a new page

  # Make sure that submit is the option after the page reloads.
  Then I am on "http://studio.code.org/s/allthethings/stage/32/puzzle/1?noautoplay=true"
  And I wait until element "#submitButton" is visible
