@no_mobile
@as_student
Feature: Submittable multi

Background:
  # Ideally we would create a student account that has a teacher so that we don't need
  # force_submittable to be passed through.
  Given I am on "http://learn.code.org/s/allthethings/stage/9/puzzle/3?noautoplay=true&force_submittable=true"
  Then I rotate to landscape
  And I wait to see ".submitButton"
  And element ".submitButton" is visible

Scenario: Loading the level
  And element ".multi-question" has text "What is your favorite color?"

Scenario: Submit anything, unsubmit, be able to resubmit.
  # First, submit something.
  And element ".submitButton:first" is disabled
  And element ".submitButton:last" is disabled
  And I press ".answerbutton[index=2]" using jQuery
  And element ".submitButton:first" is not disabled
  And element ".submitButton:last" is not disabled
  And I press ".submitButton:first" using jQuery
  And I wait to see ".modal"

  # Reload the page to see that unsubmit is the option.
  And I reload the page
  And I wait to see ".unsubmitButton"
  And element ".unsubmitButton:first" is visible
  And element ".submitButton:first" is not visible
  And element ".submitButton:last" is not visible

  # Unsubmit.
  And I press ".unsubmitButton:first" using jQuery
  And I wait to see ".modal"
  And I press "#continue-button" using jQuery

  # Make sure that submit is the option after the page reloads.
  And I wait for 1 second
  And I wait to see ".submitButton"
  And element ".submitButton:first" is not disabled
  And element ".submitButton:last" is not disabled
