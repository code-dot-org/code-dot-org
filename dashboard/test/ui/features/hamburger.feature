@no_mobile
Feature: Hamburger dropdown

  Scenario: Signed out user in English should not see hamburger on desktop
    Given I am on "http://code.org/"
    And I dismiss the language selector
    Then I wait to see ".header_button"
    Then element "#hamburger-icon" is not visible

  Scenario: Student viewing hamburger dropdown in English on desktop
    Given I create a student named "Sally Student"
    Then I wait until I am on "http://studio.code.org/home"
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#report-bug"
    And I see "#support"
    And I see ".divider#before-pegasus"
    And I see "#learn"
    And I see "#stats"
    And I see "#help-us"
    And I see "#about_entries"
    And I see "#educate_entries"

  Scenario: Teacher viewing hamburger dropdown (with expanded options) in English on desktop
    Given I create a teacher named "Tessa Teacher"
    Then I wait until I am on "http://studio.code.org/home"
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#report-bug"
    And I see "#support"
    And I see "#teacher-community"
    And I see ".divider#before-pegasus"
    And I see "#learn"
    And I see "#stats"
    And I see "#help-us"
    And I see "#about_entries"
    And I click selector "#about_entries"
    And I wait to see "#about-us"
    And I see "#educate_entries"
    And I click selector "#educate_entries"
    And I wait to see "#educate-overview"

  Scenario: Applab-specific help links
    Given I create a teacher named "Tessa Teacher"
    And I am on "http://studio.code.org/projects/applab/new"
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#applab-docs"
    And I see "#applab-tutorials"

  Scenario: Gamelab-specific help links
    Given I create a teacher named "Tessa Teacher"
    And I am on "http://studio.code.org/projects/gamelab/new"
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#gamelab-docs"

  Scenario: Student viewing hamburger dropdown in English on desktop on level
    Given I create a student named "Sally Student"
    And I am on "http://studio.code.org/s/allthethings/stage/1/puzzle/1"
    Then I wait until I am on "http://studio.code.org/s/allthethings/stage/1/puzzle/1"
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see ".divider#after-student"
    And I see "#report-bug"
    And I see "#support"
    And I see ".divider#before-pegasus"
    And I see "#about_entries"
    And I see "#educate_entries"
    And I see "#learn"
    And I see "#stats"
    And I see "#help-us"

  Scenario: Teacher viewing hamburger dropdown in English on desktop on level
    Given I create a teacher named "Tessa Teacher"
    And I am on "http://studio.code.org/s/allthethings/stage/1/puzzle/1"
    Then I wait until I am on "http://studio.code.org/s/allthethings/stage/1/puzzle/1"
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see ".divider#after-teacher"
    And I see "#report-bug"
    And I see "#support"
    And I see "#teacher-community"
    And I see ".divider#before-pegasus"
    And I see "#about_entries"
    And I see "#educate_entries"
    And I see "#learn"
    And I see "#stats"
    And I see "#help-us"

Scenario: Signed out user viewing hamburger dropdown in Spanish on desktop
  Given I am on "http://code.org/lang/es"
  Then I wait until I am on "http://code.org/"
  And I dismiss the language selector
  Then I wait to see "#hamburger-icon"
  And I click selector "#hamburger-icon"
  Then I wait to see "#hamburger-contents"
  And I see "#report-bug"
  And I see "#support"
  Then element "#teacher-community" is not visible
  Then element "#learn" is not visible
  Then element ".divider#before-pegasus" is not visible
  Then element "#learn" is not visible
  Then element "#educate_entries" is not visible
  Then element "#about_entries" is not visible
  Then element "#stats" is not visible
  Then element "#help-us" is not visible
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Student viewing hamburger dropdown in Spanish on desktop
  Given I create a student named "Estrella Estudiante"
  Then I wait until I am on "http://studio.code.org/home"
  Given I am on "http://studio.code.org/home/lang/es"
  Then I wait until I am on "http://studio.code.org/home"
  And I wait to see "#hamburger-icon"
  And I click selector "#hamburger-icon"
  Then I wait to see "#hamburger-contents"
  And I see "#report-bug"
  And I see "#support"
  Then element "#teacher-community" is not visible
  Then element "#learn" is not visible
  Then element ".divider#before-pegasus" is not visible
  Then element "#educate_entries" is not visible
  Then element "#about_entries" is not visible
  Then element "#stats" is not visible
  Then element "#help-us" is not visible
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Teacher viewing hamburger dropdown in Spanish on desktop
  Given I create a teacher named "Pabla Profesora"
  Then I wait until I am on "http://studio.code.org/home"
  Given I am on "http://studio.code.org/home/lang/es"
  Then I wait until I am on "http://studio.code.org/home"
  Then I wait to see "#hamburger-icon"
  And I click selector "#hamburger-icon"
  Then I wait to see "#hamburger-contents"
  And I see "#report-bug"
  And I see "#support"
  And I see "#teacher-community"
  Then element "#learn" is not visible
  Then element ".divider#before-pegasus" is not visible
  Then element "#educate_entries" is not visible
  Then element "#about_entries" is not visible
  Then element "#stats" is not visible
  Then element "#help-us" is not visible
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Student viewing hamburger dropdown in Spanish on desktop on level
  Given I create a student named "Estrella Estudiante"
  Given I am on "http://studio.code.org/s/allthethings/stage/1/puzzle/1/lang/es"
  Then I wait until I am on "http://studio.code.org/s/allthethings/stage/1/puzzle/1"
  Then I wait to see "#hamburger-icon"
  And I click selector "#hamburger-icon"
  Then I wait to see "#hamburger-contents"
  And I see ".divider#after-student"
  And I see "#report-bug"
  And I see "#support"
  Then element ".divider#before-pegasus" is not visible
  Then element "#learn" is not visible
  Then element "#educate_entries" is not visible
  Then element "#stats" is not visible
  Then element "#help-us" is not visible
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Teacher viewing hamburger dropdown in Spanish on desktop on level
  Given I create a teacher named "Pabla Profesora"
  Given I am on "http://studio.code.org/s/allthethings/stage/1/puzzle/1/lang/es"
  Then I wait until I am on "http://studio.code.org/s/allthethings/stage/1/puzzle/1"
  Then I wait to see "#hamburger-icon"
  And I click selector "#hamburger-icon"
  Then I wait to see "#hamburger-contents"
  And I see ".divider#after-teacher"
  And I see "#report-bug"
  And I see "#support"
  And I see "#teacher-community"
  Then element ".divider#before-pegasus" is not visible
  Then element "#learn" is not visible
  Then element "#educate_entries" is not visible
  Then element "#stats" is not visible
  Then element "#help-us" is not visible
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds
