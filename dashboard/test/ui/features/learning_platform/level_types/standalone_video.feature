Feature: Standalone video levels

@as_student
Scenario: Progress is posted when continue is clicked
  Given I am on "http://studio.code.org/s/allthethings/lessons/34/levels/1"
  And I wait until element ".submitButton" is visible
  Then I verify progress in the header of the current page is "not_tried" for level 1
  When I click ".submitButton" to load a new page
  And I am on "http://studio.code.org/s/allthethings/lessons/34/levels/1"
  And I wait until element ".submitButton" is visible
  Then I verify progress in the header of the current page is "perfect" for level 1
