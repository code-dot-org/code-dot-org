@no_mobile
@as_student
Feature: Level Group

Background:
  Given I am on "http://learn.code.org/s/allthethings/stage/22/puzzle/2/page/1?noautoplay=true&force_submittable=true"
  Then I rotate to landscape
  And I wait to see ".nextPageButton"
  And element ".nextPageButton" is visible

Scenario: Submit three pages.
  When element ".level-group-content:nth(0) .multi-question" contains text "Which arrow gets"

  # Enter answers to all three multis on the first page.
  And I press ".level-group-content:nth(0) .answerbutton[index=2]" using jQuery
  And I press ".level-group-content:nth(1) .answerbutton[index=1]" using jQuery
  # Pressing 1, 2, 0 should result in 2, 0 being selected.
  And I press ".level-group-content:nth(2) .answerbutton[index=1]" using jQuery
  And I press ".level-group-content:nth(2) .answerbutton[index=2]" using jQuery
  And I press ".level-group-content:nth(2) .answerbutton[index=0]" using jQuery

  And I press ".nextPageButton" using jQuery
  And I wait for 1 second
  And I wait to see ".level-group-content"
  And check that the URL contains "/page/2"
  And element ".level-group-content:nth(0) .multi-question" contains text "Which step should go"

  # Enter answers to all three multis on the second page.
  And I press ".level-group-content:nth(0) .answerbutton[index=2]" using jQuery
  And I press ".level-group-content:nth(1) .answerbutton[index=0]" using jQuery
  And I press ".level-group-content:nth(2) .answerbutton[index=1]" using jQuery

  And I press ".nextPageButton" using jQuery
  And I wait for 1 second
  And I wait to see ".level-group-content"
  And check that the URL contains "/page/3"
  And element ".level-group-content:nth(0) .multi-question" contains text "Which repeat block"

  # Enter answers to both multis on the third page.
  And I press ".level-group-content:nth(0) .answerbutton[index=2]" using jQuery
  And I press ".level-group-content:nth(1) .answerbutton[index=1]" using jQuery

  # Submit the long assessment
  And I press ".submitButton:first" using jQuery
  And I wait to see ".modal"
  And I press ".modal #ok-button" using jQuery
  And I wait for 5 seconds

  # Go back to the first page to see that correct options are selected.
  Then I am on "http://learn.code.org/s/allthethings/stage/22/puzzle/2/page/1?noautoplay=true&force_submittable=true"
  And element ".level-group-content:nth(0) #checked_2" is visible
  And element ".level-group-content:nth(1) #checked_1" is visible
  And element ".level-group-content:nth(2) #checked_2" is visible
  And element ".level-group-content:nth(2) #checked_0" is visible

  # Go to the second page to see that correct options are selected.
  Then I am on "http://learn.code.org/s/allthethings/stage/22/puzzle/2/page/2?noautoplay=true&force_submittable=true"
  And element ".level-group-content:nth(0) #checked_2" is visible
  And element ".level-group-content:nth(1) #checked_0" is visible
  And element ".level-group-content:nth(2) #checked_1" is visible

  # Go to the third page to see that correct options are selected.
  Then I am on "http://learn.code.org/s/allthethings/stage/22/puzzle/2/page/3?noautoplay=true&force_submittable=true"
  And element ".level-group-content:nth(0) #checked_2" is visible
  And element ".level-group-content:nth(1) #checked_1" is visible
