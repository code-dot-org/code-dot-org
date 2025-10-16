@no_mobile
Feature: Level Group Activity Guide

@as_student
Scenario: Submit activity guide and go to next level.
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/53/levels/1"
  And I wait to see ".submitButton"
  And element ".submitButton" is visible

  And I press ".submitButton:first" using jQuery
  Then I wait until I am on a different page than I noted before

Scenario: Teacher can view student summary of responses.
  Given I create a teacher-associated student named "Lilian"
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/53/levels/1"
  And I wait until element "span:contains(1)" is visible

  Then I press "unchecked_0"
  And I type "sample response" into ".free-response > textarea"
  And I press ".submitButton" using jQuery to load a new page

  # Teacher can view summary
  When I sign in as "Teacher_Lilian"
  And I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/53/levels/1"
  And I wait until element "a:contains(View student responses)" is visible
  And I click selector "a:contains(View student responses)"
  And I wait until current URL contains "/summary"
  And I wait until element "#summary-container" is visible

Scenario: Teacher can view student summary of responses on level marked as assessment
  Given I create a teacher-associated student named "Lilian"
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/53/levels/2"
  Then I press "unchecked_0"
  And I type "sample response" into ".free-response > textarea"
  And I press ".submitButton" using jQuery to load a new page

  # Teacher can view summary, specifically on a level marked as an assessment in levelbuilder
  When I sign in as "Teacher_Lilian"
  And I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/53/levels/2"
  And I wait until element "a:contains(View student responses)" is visible
  And I click selector "a:contains(View student responses)"
  And I wait until current URL contains "/summary"
  And I wait until element "#summary-container" is visible

Scenario: Student can see level numbers for level group levels in header.
  Given I create a teacher-associated student named "Lilian"
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/53/levels/1"
  And I wait until element ".progress-bubble.enabled span:contains(1)" is visible

  # Check that the student can see this numbering on an "assessment" level too.
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/53/levels/2"
  And I wait until element ".progress-bubble.enabled span:contains(2)" is visible
