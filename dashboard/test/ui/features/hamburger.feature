@no_mobile
Feature: Hamburger dropdown

  Scenario: Signed out user in English should not see hamburger on desktop
    Given I am on "http://code.org/"
    Then I wait until element ".header_button" is visible
    Then I wait until element "#hamburger-icon" is not visible

  Scenario: Student viewing hamburger dropdown in English on desktop on Code.org
    Given I am on "http://code.org/"
    And I create a student named "Sally Student"
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#report-bug"
    And I see "#support"
    And I see ".divider#before-pegasus"
    And I see "#learn"
    And I see "#educate-more"
    And I see "#stats"
    And I see "#help-us"
    And I see "#about-more"

  Scenario: Teacher viewing hamburger dropdown (with expanded options) in English on desktop on Code.org
    Given I am on "http://code.org/"
    And I create a teacher named "Tessa Teacher"
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#report-bug"
    And I see "#support"
    And I see "#teacher-community"
    And I see ".divider#before-pegasus"
    And I see "#learn"
    And I see "#educate-more"
    And I see "#stats"
    And I see "#help-us"
    And I see "#about-more"
    And I click selector "#educate-more"
    And I see "#educate-overview"
    And I click selector "#about-more"
    And I see "#about-us"

  Scenario: Signed out user viewing hamburger dropdown in Spanish on desktop on Code.org
    Given I am on "http://code.org/lang/es"
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#report-bug"
    And I see "#support"
    Then I wait until element "#teacher-community" is not visible
    Then I wait until element "#learn" is not visible
    Then I wait until element ".divider#before-pegasus" is not visible
    Then I wait until element "#learn" is not visible
    Then I wait until element "#educate-more" is not visible
    Then I wait until element "#stats" is not visible
    Then I wait until element "#help-us" is not visible
    Given I am on "http://studio.code.org/reset_session/lang/en"
    And I wait for 2 seconds

  Scenario: Student viewing hamburger dropdown in Spanish on desktop on Code.org
    Given I create a student named "Estrella Estudiante"
    Then I am on "http://code.org/lang/es"
    And I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#report-bug"
    And I see "#support"
    Then I wait until element "#teacher-community" is not visible
    Then I wait until element "#learn" is not visible
    Then I wait until element ".divider#before-pegasus" is not visible
    Then I wait until element "#learn" is not visible
    Then I wait until element "#educate-more" is not visible
    Then I wait until element "#stats" is not visible
    Then I wait until element "#help-us" is not visible
    Given I am on "http://studio.code.org/reset_session/lang/en"
    And I wait for 2 seconds

  Scenario: Teacher viewing hamburger dropdown in Spanish on desktop on Code.org
    Given I am on "http://code.org/lang/es"
    And I create a teacher named "Pabla Profesora"
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#report-bug"
    And I see "#support"
    And I see "#teacher-community"
    Then I wait until element "#learn" is not visible
    Then I wait until element ".divider#before-pegasus" is not visible
    Then I wait until element "#learn" is not visible
    Then I wait until element "#educate-more" is not visible
    Then I wait until element "#stats" is not visible
    Then I wait until element "#help-us" is not visible
    Given I am on "http://studio.code.org/reset_session/lang/en"
    And I wait for 2 seconds

  Scenario: Applab-specific help links
    Given I create a teacher named "Tessa Teacher"
    And I am on "http://studio.code.org/projects/applab/new?noUseFirebase=1"
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#applab-docs"
    And I see "#applap-tutorials"

  Scenario: Gamelab-specific help links
    Given I create a teacher named "Tessa Teacher"
    And I am on "http://studio.code.org/projects/gamelab/new"
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#gamelab-docs"

  Scenario: Student viewing hamburger dropdown in English on desktop on level
    Given I create a student named "Sally Student"
    And I am on "http://studio.code.org/s/csp1/stage/2/puzzle/2"
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see ".divider#after-student"
    And I see "#report-bug"
    And I see "#support"
    And I see ".divider#before-pegasus"
    And I see "#learn"
    And I see "#educate-more"
    And I see "#stats"
    And I see "#help-us"
    And I see "#about-more"

  Scenario: Teacher viewing hamburger dropdown in English on desktop on level
    Given I create a teacher named "Tessa Teacher"
    And I am on "http://studio.code.org/s/csp1/stage/2/puzzle/2"
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see ".divider#after-teacher"
    And I see "#report-bug"
    And I see "#support"
    And I see "#teacher-community"
    And I see ".divider#before-pegasus"
    And I see "#learn"
    And I see "#educate-more"
    And I see "#stats"
    And I see "#help-us"
    And I see "#about-more"

  Scenario: Student viewing hamburger dropdown in Spanish on desktop on level
    Given I create a student named "Estrella Estudiante"
    Given I am on "http://studio.code.org/s/csp1/stage/2/puzzle/2/lang/es"
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see ".divider#after-student"
    And I see "#report-bug"
    And I see "#support"
    Then I wait until element ".divider#before-pegasus" is not visible
    Then I wait until element "#learn" is not visible
    Then I wait until element "#educate-more" is not visible
    Then I wait until element "#stats" is not visible
    Then I wait until element "#help-us" is not visible
    Given I am on "http://studio.code.org/reset_session/lang/en"
    And I wait for 2 seconds

  Scenario: Teacher viewing hamburger dropdown in Spanish on desktop on level
    Given I create a teacher named "Pabla Profesora"
    Given I am on "http://studio.code.org/s/csp1/stage/2/puzzle/2/lang/es"
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see ".divider#after-teacher"
    And I see "#report-bug"
    And I see "#support"
    And I see "#teacher-community"
    Then I wait until element ".divider#before-pegasus" is not visible
    Then I wait until element "#learn" is not visible
    Then I wait until element "#educate-more" is not visible
    Then I wait until element "#stats" is not visible
    Then I wait until element "#help-us" is not visible
    Given I am on "http://studio.code.org/reset_session/lang/en"
    And I wait for 2 seconds
