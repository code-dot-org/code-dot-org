@no_mobile
@as_taught_student
Feature: Level Group

Background:
  Given I am on "http://studio.code.org/s/allthethings/lessons/23/levels/2/page/1?noautoplay=true"
  Then I rotate to landscape
  And I wait to see ".nextPageButton"
  And element ".nextPageButton" is visible

Scenario: Submit three pages as... 1. all, 2. none, 3. some questions answered.
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
  Then I am on "http://studio.code.org/s/allthethings/lessons/23/levels/2/page/1?noautoplay=true"
  And element ".level-group-content:nth(0) #checked_2" is visible
  And element ".level-group-content:nth(1) #checked_1" is visible
  And element ".level-group-content:nth(2) #checked_2" is visible
  And element ".level-group-content:nth(2) #checked_0" is visible

  Then I reload the page
  And I wait to see ".react_stage"
  And I wait until jQuery Ajax requests are finished

  # Verify the three dots in the header are 1. all, 2. none, 3. some questions answered.
  And I verify progress in the header of the current page is "perfect_assessment" for level 2
  And I verify progress in the header of the current page is "not_tried" for level 3
  And I verify progress in the header of the current page is "attempted_assessment" for level 4

  # Open the dropdown and verify the same three dots.
  Then I open the progress drop down of the current page
  And I verify progress in the drop down of the current page is "perfect_assessment" for lesson 23 level 2
  And I verify progress in the drop down of the current page is "not_tried" for lesson 23 level 3
  And I verify progress in the drop down of the current page is "attempted_assessment" for lesson 23 level 4

  # Go to the course page and verify the same three dots.
  Then I navigate to the course page for "allthethings"
  And I wait until jQuery Ajax requests are finished
  And I verify progress for lesson 23 level 2 is "perfect_assessment"
  And I verify progress for lesson 23 level 3 is "not_tried"
  And I verify progress for lesson 23 level 4 is "attempted_assessment"

  # Submit the assessment.
  When I am on "http://studio.code.org/s/allthethings/lessons/23/levels/2/page/3?noautoplay=true"
  And I press ".submitButton" using jQuery
  And I wait to see a dialog titled "Submit your assessment"
  And I press "#ok-button" using jQuery to load a new page
  And I am on "http://studio.code.org/s/allthethings/lessons/23/levels/1?noautoplay=true"
  And I wait to see ".react_stage"
  And I wait until jQuery Ajax requests are finished

  # Verify the three dots in the header all reflect the submission.
  And I verify progress in the header of the current page is "perfect_assessment" for level 2
  And I verify progress in the header of the current page is "not_tried" for level 3
  And I verify progress in the header of the current page is "attempted_assessment" for level 4

  # Open the dropdown and verify the same three dots.
  Then I open the progress drop down of the current page
  And I verify progress in the drop down of the current page is "perfect_assessment" for lesson 23 level 2
  And I verify progress in the drop down of the current page is "not_tried" for lesson 23 level 3
  And I verify progress in the drop down of the current page is "attempted_assessment" for lesson 23 level 4

  # Go to the course page and verify the same three dots.
  Then I navigate to the course page for "allthethings"
  And I wait until jQuery Ajax requests are finished
  And I verify progress for lesson 23 level 2 is "perfect_assessment"
  And I verify progress for lesson 23 level 3 is "not_tried"
  And I verify progress for lesson 23 level 4 is "attempted_assessment"

Scenario: optional free play level
  When element ".level-group-content:nth(0) .multi-question" contains text "Which arrow gets"

  # Enter answers to all three multis on the first page.
  And I press ".level-group-content:nth(0) .answerbutton[index=2]" using jQuery
  And I press ".level-group-content:nth(1) .answerbutton[index=1]" using jQuery
  # The last question requires 2 boxes to be checked.
  And I press ".level-group-content:nth(2) .answerbutton[index=0]" using jQuery
  And I press ".level-group-content:nth(2) .answerbutton[index=1]" using jQuery

  And I press ".nextPageButton" using jQuery to load a new page
  And I wait to see ".level-group-content"
  And check that the URL contains "/page/2"
  And element ".level-group-content:nth(0) .multi-question" contains text "Which step should go"

  # Answer all three multis on page 2, but not the markdown or free response.
  And I press ".level-group-content:nth(0) .answerbutton[index=2]" using jQuery
  And I press ".level-group-content:nth(1) .answerbutton[index=1]" using jQuery
  And I press ".level-group-content:nth(2) .answerbutton[index=0]" using jQuery

  And I press ".nextPageButton" using jQuery to load a new page
  And I wait to see ".level-group-content"
  And check that the URL contains "/page/3"
  And element ".level-group-content:nth(0) .multi-question" contains text "Which repeat block"

  # Answer both multis on page 3.
  And I press ".level-group-content:nth(0) .answerbutton[index=2]" using jQuery
  And I press ".level-group-content:nth(1) .answerbutton[index=1]" using jQuery

  # Verify the bubble status and submit dialog message show incomplete

  Then I verify progress in the header of the current page is "attempted_assessment" for level 3

  When I press ".submitButton" using jQuery
  And I wait to see a dialog titled "Submit your assessment"
  Then element ".modal-body" contains text "You left some questions incomplete"

  When I press "#cancel-button" using jQuery
  And I press ".previousPageButton" using jQuery to load a new page
  And I wait to see ".level-group-content"
  And check that the URL contains "/page/2"

  # Answer all but the optional free response on page 2.
  When I type "hello world" into ".response:first"
  And I press ".nextPageButton" using jQuery to load a new page
  And I wait to see ".level-group-content"
  And check that the URL contains "/page/3"

  # Verify the bubble status and submit dialog contents are accurate
  Then I verify progress in the header of the current page is "perfect_assessment" for level 2
  Then I verify progress in the header of the current page is "perfect_assessment" for level 3
  Then I verify progress in the header of the current page is "perfect_assessment" for level 4

  When I press ".submitButton" using jQuery
  And I wait to see a dialog titled "Submit your assessment"
  Then element ".modal-body" does not contain text "You left some questions incomplete"
