@no_mobile
@as_student
Feature: Submittable free response

Background:
  # Ideally we would create a student account that has a teacher so that we don't need
  # force_submittable to be passed through.
  Given I am on "http://learn.code.org/s/allthethings/stage/26/puzzle/1?force_submittable=true"
  Then I rotate to landscape
  And I wait to see ".submitButton"
  And element ".submitButton" is visible

Scenario: Loading the level
  And element ".free-response > h2" has text "Submit a Lesson Plan: Routing and Packets"

Scenario: Submit anything, unsubmit, be able to resubmit.
  # First, submit something.
  And I type "sample response" into ".free-response > textarea"
  And I press ".submitButton" using jQuery
  And I wait for 5 seconds

  # Reload the page to see that unsubmit is the option.
  And I am on "http://learn.code.org/s/allthethings/stage/26/puzzle/1?force_submittable=true"
  And I wait to see ".unsubmitButton"
  And element ".free-response > textarea" contains text "sample response"
  And element ".unsubmitButton" is visible
  And element ".submitButton" is not visible

  # Unsubmit.
  And I press ".unsubmitButton" using jQuery
  And I wait to see ".modal"
  And I press the first ".modal #ok-button" element

  # Make sure that submit is the option after the page reloads.
  And I wait for 5 seconds
  And I wait to see ".submitButton"
  And element ".submitButton" is visible
  And element ".submitButton" is not disabled
