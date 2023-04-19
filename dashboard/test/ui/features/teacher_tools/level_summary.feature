@eyes
Feature: Level summary

Scenario: Free Response level 1
  Given I am a teacher
  And I create a new student section
  Given I am on "http://studio.code.org/s/allthethings/lessons/27/levels/1/summary"
  And I wait until element "#summary-container" is visible
  And I wait to see ".uitest-sectionselect"
  And I see no difference for "level summary"
  And I close my eyes

Scenario: Free Response level 2
  Given I am a teacher
  And I create a new student section
  Given I am on "http://studio.code.org/s/csp2-2022/lessons/6/levels/3/summary"
  And I wait until element "#summary-container" is visible
  And I wait to see ".uitest-sectionselect"
  And I see no difference for "level summary"
  And I close my eyes

Scenario: Free Response level 3
  Given I am a teacher
  And I create a new student section
  Given I am on "http://studio.code.org/s/csa1-2022/lessons/4/levels/1/summary"
  And I wait until element "#summary-container" is visible
  And I wait to see ".uitest-sectionselect"
  And I see no difference for "level summary"
  And I close my eyes
