# TODO: (Brad) Fix and re-enable on Firefox
@no_firefox
@no_mobile
@no_circle
@as_taught_student
Feature: Level Group

Background:
  Given I am on "http://studio.code.org/s/allthethings/stage/23/puzzle/2/page/1?noautoplay=true"
  Then I rotate to landscape
  And I wait to see ".nextPageButton"
  And element ".nextPageButton" is visible

Scenario: Submit three pages as... 1. some, 2. none, 3. all questions answered.
  When element ".level-group-content:nth(0) .multi-question" contains text "Which arrow gets"

  # Enter answers to all three multis on the first page.
  And I press ".level-group-content:nth(0) .answerbutton[index=2]" using jQuery
  And I press ".level-group-content:nth(1) .answerbutton[index=1]" using jQuery
  # Pressing 1, 2, 0 should result in 2, 0 being selected.
  And I press ".level-group-content:nth(2) .answerbutton[index=1]" using jQuery
  And I press ".level-group-content:nth(2) .answerbutton[index=2]" using jQuery
  And I press ".level-group-content:nth(2) .answerbutton[index=0]" using jQuery

  And I press ".nextPageButton" using jQuery to load a new page
  And I wait to see ".level-group-content"
  And check that the URL contains "/page/2"
  And element ".level-group-content:nth(0) .multi-question" contains text "Which step should go"

  # Enter no answers on the second page.

  And I press ".nextPageButton" using jQuery to load a new page
  And I wait to see ".level-group-content"
  And check that the URL contains "/page/3"
  And element ".level-group-content:nth(0) .multi-question" contains text "Which repeat block"

  # Enter answers to only the first multi on the third page.
  And I press ".level-group-content:nth(0) .answerbutton[index=2]" using jQuery

  And I wait until jQuery Ajax requests are finished

  # Go back to the first page to see that correct options are selected.
  Then I am on "http://studio.code.org/s/allthethings/stage/23/puzzle/2/page/1?noautoplay=true"
  And element ".level-group-content:nth(0) #checked_2" is visible
  And element ".level-group-content:nth(1) #checked_1" is visible
  And element ".level-group-content:nth(2) #checked_2" is visible
  And element ".level-group-content:nth(2) #checked_0" is visible

  Then I reload the page
  And I wait to see ".react_stage"

  # Verify the three dots in the header are 1. some, 2. none, 3. all questions answered.
  And I verify progress in the header of the current page is "perfect" for level 2
  And I verify progress in the header of the current page is "not_tried" for level 3
  And I verify progress in the header of the current page is "attempted" for level 4

  # Open the dropdown and verify the same three dots.
  Then I open the progress drop down of the current page
  And I verify progress in the drop down of the current page is "perfect" for stage 23 level 2
  And I verify progress in the drop down of the current page is "not_tried" for stage 23 level 3
  And I verify progress in the drop down of the current page is "attempted" for stage 23 level 4

  # Go to the course page and verify the same three dots.
  Then I navigate to the course page for "allthethings"
  And I verify progress for stage 23 level 2 is "perfect"
  And I verify progress for stage 23 level 3 is "not_tried"
  And I verify progress for stage 23 level 4 is "attempted"
