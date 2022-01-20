Feature: Playing match levels

Background:
  Given I am on "http://studio.code.org/s/course1/lessons/14/levels/13?noautoplay=true"
  Then I rotate to landscape
  And I wait to see ".submitButton"
  And element ".submitButton" is visible

Scenario: Loading the level
  And element ".match .content2" has text "Match the blocks"

# drag simulation does not work in IE/iOS, so we exclude them for now
@no_ie
@no_mobile
Scenario: Solving puzzle
  And I dismiss the login reminder
  And I drag ".answer[originalindex=0]" to ".emptyslot:first"
  And I drag ".answer[originalindex=1]" to ".emptyslot:first"
  And I drag ".answer[originalindex=2]" to ".emptyslot:first"
  And I drag ".answer[originalindex=3]" to ".emptyslot:first"
  And I press ".submitButton:first" using jQuery
  Then I wait to see ".modal"
  And element ".modal .dialog-title" contains text "Correct"

@no_ie
@no_mobile
@as_student
Scenario: Submitting an incorrect solution
  Given match level 0 contains 4 empty slots
  And I drag ".answer[originalindex=3]" to ".emptyslot:first"
  And I drag ".answer[originalindex=2]" to ".emptyslot:first"
  And I drag ".answer[originalindex=1]" to ".emptyslot:first"
  And I drag ".answer[originalindex=0]" to ".emptyslot:first"
  And match level 0 contains 0 empty slots
  And I press ".submitButton:last" using jQuery
  Then I wait to see ".modal"
  And element ".modal .dialog-title" contains text "Incorrect"
  And I press ".modal #ok-button" using jQuery
  And I wait until element ".xmark" is visible

  # For signed-in users, we remember the previous answer and display it when
  # they next come back to the page.

  When I reload the page
  And I wait to see ".submitButton"
  And I wait until element ".emptyslot" is not visible
  And match placed answer 0 has original index 3
  And match placed answer 1 has original index 2
  And match placed answer 2 has original index 1
  And match placed answer 3 has original index 0
