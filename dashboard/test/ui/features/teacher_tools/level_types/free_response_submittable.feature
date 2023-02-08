@no_mobile
@as_taught_student
Feature: Submittable free response

Background:
  Given I am on "http://studio.code.org/s/allthethings/lessons/27/levels/1"
  Then I rotate to landscape
  And I wait to see ".submitButton"
  And element ".submitButton" is visible

Scenario: Loading the level
  And element ".free-response > h1" has text "Submit a Lesson Plan: Routing and Packets"

Scenario: Submit anything, unsubmit, be able to resubmit.
  # First, submit something.
  And I type "sample response" into ".free-response > textarea"
  And I press ".submitButton" using jQuery to load a new page

  # Reload the page to see that unsubmit is the option.
  And I am on "http://studio.code.org/s/allthethings/lessons/27/levels/1"
  And I wait to see ".unsubmitButton"
  And element ".free-response > textarea" contains text "sample response"
  And element ".unsubmitButton" is visible
  And element ".submitButton" is not visible

  # Unsubmit.
  And I press ".unsubmitButton" using jQuery
  And I wait to see ".modal"
  And I press the first ".modal #ok-button" element to load a new page
  And I wait to see ".submitButton"
  And element ".submitButton" is visible
  And element ".submitButton" is not disabled
