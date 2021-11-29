@eyes
Feature: Student Has Not Started Level Warning

  Background:
    Given I create an authorized teacher-associated student named "Sally"

Scenario: Game lab level where student has not started
  When I open my eyes to test "game lab student has not started"
  When I sign in as "Teacher_Sally" and go home
  And I wait until element ".uitest-owned-sections" is visible

  And I am on "http://studio.code.org/s/allthethings/lessons/38/levels/3"
  And I wait for the page to fully load
  And I wait until element "#teacher-panel-container" is visible
  And I wait until element ".uitest-sectionselect:contains(Untitled Section)" is visible
  And I wait until element ".student-table" is visible
  And I click selector "#teacher-panel-container tr:nth(1)" to load a new page
  And I wait for the page to fully load

  And I wait until element ".editor-column" contains text "This student has not started the level."
  Then I see no difference for "student not started warning"
  And I close my eyes

Scenario: Maze level where student has not started
  When I open my eyes to test "maze student has not started"
  When I sign in as "Teacher_Sally" and go home
  And I wait until element ".uitest-owned-sections" is visible

  And I am on "http://studio.code.org/s/allthethings/lessons/4/levels/2"
  And I wait for the page to fully load
  And I wait until element "#teacher-panel-container" is visible
  And I wait until element ".uitest-sectionselect:contains(Untitled Section)" is visible
  And I wait until element ".student-table" is visible
  And I click selector "#teacher-panel-container tr:nth(1)" to load a new page
  And I wait for the page to fully load

  And I wait until element ".editor-column" contains text "This student has not started the level."
  Then I see no difference for "student not started warning"
  And I close my eyes

Scenario: Contained level
  When I open my eyes to test "contained level"
  When I sign in as "Teacher_Sally" and go home
  And I wait until element ".uitest-owned-sections" is visible

  And I am on "http://studio.code.org/s/allthethings/lessons/41/levels/1"
  And I wait for the page to fully load
  And I wait until element "#teacher-panel-container" is visible
  And I wait until element ".uitest-sectionselect:contains(Untitled Section)" is visible
  And I wait until element ".student-table" is visible
  And I click selector "#teacher-panel-container tr:nth(1)" to load a new page
  And I wait for the page to fully load

  And I wait until element ".editor-column" does not contain text "This student has not started the level."
  Then I see no difference for "no student not started warning"
  And I close my eyes
