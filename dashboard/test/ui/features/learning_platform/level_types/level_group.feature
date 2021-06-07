@no_mobile
Feature: Level Group

@as_student
Scenario: Submit three answers.
  Given I am on "http://studio.code.org/s/allthethings/lessons/33/levels/1?noautoplay=true"
  And I wait to see ".submitButton"
  And element ".submitButton" is visible

  When element ".level-group-content:nth(1) .multi-question" contains text "The standard QWERTY keyboard has"

  # First, submit answers to all three multis.
  And I press ".level-group-content:nth(0) .answerbutton[index=2]" using jQuery
  And I press ".level-group-content:nth(1) .answerbutton[index=1]" using jQuery

  # Pressing 1, 2, 0 should result in 2, 0 being selected.
  And I press ".level-group-content:nth(2) .answerbutton[index=1]" using jQuery
  And I press ".level-group-content:nth(2) .answerbutton[index=2]" using jQuery
  And I press ".level-group-content:nth(2) .answerbutton[index=0]" using jQuery

  And I press ".submitButton:first" using jQuery
  And I wait to see ".modal"
  And element ".modal-body" contains text "You cannot edit your assessment after submitting it."
  And element ".modal-body" contains text "You left some questions incomplete."

  And I press ".modal #ok-button" using jQuery to load a new page

  # Go back to the page to see that same options are selected.
  Then I am on "http://studio.code.org/s/allthethings/lessons/33/levels/1?noautoplay=true"
  And element ".level-group-content:nth(0) #checked_2" is visible
  And element ".level-group-content:nth(1) #checked_1" is visible
  And element ".level-group-content:nth(2) #checked_2" is visible
  And element ".level-group-content:nth(2) #checked_0" is visible

@no_ie
Scenario: Match levels within level group
  Given I create a teacher-associated student named "Lilian"
  Given I am on "http://studio.code.org/s/allthethings/lessons/33/levels/1?noautoplay=true"
  And I wait to see ".submitButton"
  And element ".submitButton" is visible

  Given match level 0 question contains text "Match the code to the image that it will produce."
  And match level 0 contains 4 unplaced answers
  And match level 0 contains 4 empty slots
  And match level 1 question contains text "Match the boolean expression to the English description."
  And match level 1 contains 5 unplaced answers
  And match level 1 contains 5 empty slots

  When I drag match level 0 unplaced answer 0 to empty slot 0
  And I drag match level 1 unplaced answer 0 to empty slot 0

  Then match level 0 contains 3 unplaced answers
  And match level 0 contains 3 empty slots
  And match level 1 contains 4 unplaced answers
  And match level 1 contains 4 empty slots
  And element ".xmark" is not visible

  # Make sure the answers are saved and loaded

  Given I press ".submitButton:first" using jQuery
  And I wait to see ".modal"
  And I press ".modal #ok-button" using jQuery to load a new page

  When I am on "http://studio.code.org/s/allthethings/lessons/33/levels/1?noautoplay=true"
  And I wait to see ".submitButton"

  # Wait for moves reflecting lastAttempt to be made
  And I wait until element ".match:nth(1) .match_slots .answer" is visible

  Then match level 0 contains 3 unplaced answers
  And match level 0 contains 3 empty slots
  And match level 1 contains 4 unplaced answers
  And match level 1 contains 4 empty slots
  And element ".xmark" is not visible

  And I sign out

  # Teacher can view answers

  When I sign in as "Teacher_Lilian"
  And I am on "http://studio.code.org/s/allthethings/lessons/33/levels/1"
  And I click selector ".show-handle .fa-chevron-left"
  And I wait until element ".student-table" is visible
  And I click selector "#teacher-panel-container tr:nth(1)" to load a new page

  Then match level 0 contains 3 unplaced answers
  And match level 0 contains 3 empty slots
  And match level 1 contains 4 unplaced answers
  And match level 1 contains 4 empty slots
  And element ".xmark" is not visible

  # no answers are draggable
  And element ".ui-draggable" is not visible

@no_ie
Scenario: Submit all answers, including match levels
  Given I am on "http://studio.code.org/s/allthethings/lessons/33/levels/1?noautoplay=true"
  And I wait to see ".submitButton"
  And element ".submitButton" is visible

  When element ".level-group-content:nth(1) .multi-question" contains text "The standard QWERTY keyboard has"

  # Select answers to all three multis.

  And I press ".level-group-content:nth(0) .answerbutton[index=0]" using jQuery
  And I press ".level-group-content:nth(1) .answerbutton[index=0]" using jQuery
  And I press ".level-group-content:nth(2) .answerbutton[index=0]" using jQuery
  And I press ".level-group-content:nth(2) .answerbutton[index=1]" using jQuery

  # Select answers to both match levels.

  And I scroll the ".level-group-content:nth(3)" element into view
  And I drag match level 0 unplaced answer 0 to empty slot 0
  And I drag match level 0 unplaced answer 0 to empty slot 0
  And I drag match level 0 unplaced answer 0 to empty slot 0
  And I drag match level 0 unplaced answer 0 to empty slot 0
  And match level 0 contains 0 empty slots

  And I scroll the ".level-group-content:nth(4)" element into view
  And I drag match level 1 unplaced answer 0 to empty slot 0
  And I drag match level 1 unplaced answer 0 to empty slot 0
  And I drag match level 1 unplaced answer 0 to empty slot 0
  And I drag match level 1 unplaced answer 0 to empty slot 0
  And I drag match level 1 unplaced answer 0 to empty slot 0
  And match level 1 contains 0 empty slots

  Given I press ".submitButton:first" using jQuery
  And I wait to see ".modal"
  And element ".modal-body" contains text "You cannot edit your assessment after submitting it."
  And element ".modal-body" does not contain text "You left some questions incomplete."
