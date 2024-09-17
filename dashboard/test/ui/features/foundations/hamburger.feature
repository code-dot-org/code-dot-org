@single_session
Feature: Hamburger dropdown

  @no_mobile
  Scenario: Signed out user in English should not see hamburger on large desktop
    Given I am on "http://code.org/"
    And I dismiss the language selector
    And I change the browser window size to 1300 by 768
    Then I wait to see ".header_button"
    Then element "#hamburger-icon" is not visible

  @no_mobile
  @eyes
  Scenario: Signed out user in English should see hamburger on small desktop
    Given I am on "http://code.org/"
    And I dismiss the language selector
    And I change the browser window size to 1268 by 768
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I open my eyes to test "Signed out small desktop hamburger"
    And element "#learn" is not visible
    And element "#educate_entries" is not visible
    And element "#districts" is not visible
    And I see "#stats"
    And I see "#help-us"
    And I see "#incubator"
    And I see "#about_entries"
    And I see "#legal_entries"
    And I see "#support"
    And I see "#report-bug"
    And I see no difference for "Signed out small desktop hamburger"
    And I close my eyes

  @no_mobile
  Scenario: Signed out user in English should see hamburger on tablet
    Given I am on "http://code.org/"
    And I dismiss the language selector
    And I change the browser window size to 1023 by 768
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#learn"
    And I see "#educate_entries"
    And I see "#districts"
    And I see "#stats"
    And I see "#help-us"
    And I see "#incubator"
    And I see "#about_entries"
    And I see "#legal_entries"
    And I see "#support"
    And I see "#report-bug"

  @only_phone
  Scenario: Signed out user should see Sign in and Create account buttons on code.org mobile
    Given I am on "http://code.org/"
    And I rotate to portrait
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#signin_button"
    And I see "#create_account_button"

  @only_phone
  Scenario: Signed out user should see Sign in and Create account buttons on studio.code.org mobile
    Given I am on "http://studio.code.org/catalog"
    And I rotate to portrait
    Then I wait to see "#hamburger-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#signin_button"
    And I see "#create_account_button"

  @no_mobile
  Scenario: Student viewing hamburger dropdown and help button dropdown in English on desktop
    Given I create a student named "Sally Student" and go home
    Then I wait to see "#hamburger-icon"
    Then I wait to see "#help-button"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#learn"
    And I see "#districts"
    And I see "#stats"
    And I see "#help-us"
    And I see "#about_entries"
    And I see "#educate_entries"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#report-bug"
    And I see "#support"

  @no_mobile
  Scenario: Teacher viewing hamburger dropdown (with expanded options) and help button dropdown in English on desktop
    Given I create a teacher named "Tessa Teacher" and go home
    Then I wait to see "#hamburger-icon"
    Then I wait to see "#help-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#learn"
    And I see "#districts"
    And I see "#stats"
    And I see "#help-us"
    And I see "#about_entries"
    And I click selector "#about_entries"
    And I wait to see "#about-us"
    And I see "#educate_entries"
    And I click selector "#educate_entries"
    And I wait to see "#educate-overview"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#report-bug"
    And I see "#support"
    And I see "#teacher-community"

  @no_mobile
  Scenario: Applab-specific help links
    Given I create a teacher named "Tessa Teacher"
    And I am on "http://studio.code.org/projects/applab/new"
    Then I wait to see "#help-icon"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#applab-docs"
    And I see "#applab-tutorials"

  @no_mobile
  Scenario: Gamelab-specific help links
    Given I create a teacher named "Tessa Teacher"
    And I am on "http://studio.code.org/projects/gamelab/new"
    Then I wait to see "#help-icon"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#gamelab-docs"

  @no_mobile
  Scenario: Student viewing hamburger dropdown and help button in English on desktop on level
    Given I create a student named "Sally Student"
    And I am on "http://studio.code.org/s/allthethings/lessons/1/levels/1"
    Then I wait until I am on "http://studio.code.org/s/allthethings/lessons/1/levels/1"
    Then I wait to see "#hamburger-icon"
    Then I wait to see "#help-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see ".divider#after-student"
    And I see "#learn"
    And I see "#educate_entries"
    And I see "#districts"
    And I see "#stats"
    And I see "#help-us"
    And I see "#about_entries"
    And I see "#legal_entries"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#support"
    And I see "#report-bug"

  @no_mobile
  Scenario: Teacher viewing hamburger dropdown and help button in English on desktop on level
    Given I create a teacher named "Tessa Teacher"
    And I am on "http://studio.code.org/s/allthethings/lessons/1/levels/1"
    Then I wait until I am on "http://studio.code.org/s/allthethings/lessons/1/levels/1"
    Then I wait to see "#hamburger-icon"
    Then I wait to see "#help-icon"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see ".divider#after-teacher"
    And I see "#learn"
    And I see "#educate_entries"
    And I see "#districts"
    And I see "#stats"
    And I see "#help-us"
    And I see "#about_entries"
    And I see "#legal_entries"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#report-bug"
    And I see "#support"
    And I see "#teacher-community"

  @no_mobile
  Scenario: Signed out user viewing help dropdown in Spanish on desktop
    Given I am on "http://code.org/lang/es"
    Then I wait until I am on "http://code.org/"
    And I dismiss the language selector
    And I wait to see "#help-icon"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#report-bug"
    And I see "#support"
    Then element "#teacher-community" is not visible
    Given I am on "http://studio.code.org/reset_session/lang/en"
    And I wait for 2 seconds

  @no_mobile
  Scenario: Student viewing help dropdown in Spanish on desktop
    Given I create a student named "Eva Estudiante"
    Given I am on "http://studio.code.org/home/lang/es"
    Then I wait until I am on "http://studio.code.org/home?lang=es"
    And I wait to see "#help-contents"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#report-bug"
    And I see "#support"
    Then element "#teacher-community" is not visible

    Given I am on "http://studio.code.org/reset_session/lang/en"
    And I wait for 2 seconds

  @no_mobile
  Scenario: Teacher viewing help dropdown in Spanish on desktop
    Given I create a teacher named "Pabla Profesora"
    Given I am on "http://studio.code.org/home/lang/es"
    Then I wait until I am on "http://studio.code.org/home?lang=es"
    Then I wait to see "#help-icon"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#report-bug"
    And I see "#support"
    And I see "#teacher-community"
    Given I am on "http://studio.code.org/reset_session/lang/en"
    And I wait for 2 seconds

  @no_mobile
  Scenario: Student viewing help dropdown in Spanish on desktop on level
    Given I create a student named "Eva Estudiante"
    Given I am on "http://studio.code.org/s/allthethings/lessons/1/levels/1/lang/es"
    Then I wait until I am on "http://studio.code.org/s/allthethings/lessons/1/levels/1?lang=es"
    Then I wait to see "#help-icon"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#report-bug"
    And I see "#support"
    Given I am on "http://studio.code.org/reset_session/lang/en"
    And I wait for 2 seconds

  @no_mobile
  Scenario: Teacher viewing help dropdown in Spanish on desktop on level
    Given I create a teacher named "Pabla Profesora"
    Given I am on "http://studio.code.org/s/allthethings/lessons/1/levels/1/lang/es"
    Then I wait until I am on "http://studio.code.org/s/allthethings/lessons/1/levels/1?lang=es"
    Then I wait to see "#help-icon"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#report-bug"
    And I see "#support"
    And I see "#teacher-community"
    Given I am on "http://studio.code.org/reset_session/lang/en"
    And I wait for 2 seconds
