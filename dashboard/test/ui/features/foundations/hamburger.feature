@single_session
Feature: Hamburger dropdown
  @eyes
  Scenario: Student user sees the hamburger dropdown
    Given I create a student named "Sally Student" and go home
    And I open my eyes to test "Hamburger Menu in English Student"
    Then I wait until element "#hamburger-icon" is visible
    And I click selector "#hamburger-icon"
    And I see no difference for "Hamburger Menu: English Student" using stitch mode "none"
    And I close my eyes

  @eyes
  Scenario: Student user sees the Teach, about and Legal dropdowns in hamburger
    Given I create a student named "Sally Student" and go home
    And I open my eyes to test "Hamburger Dropdowns in English Student"
    Then I wait until element "#hamburger-icon" is visible
    And I click selector "#hamburger-icon"
    Then I wait until element "#educate_entries" is visible
    And I click selector "#educate_entries"
    And I see no difference for "Teach Entries Hamburger Menu: English Student" using stitch mode "none"
    Then I wait until element "#educate_entries" is visible
    And I click selector "#educate_entries"
    Then I wait until element "#about_entries" is visible
    And I click selector "#about_entries"
    And I see no difference for "About Entries Hamburger Menu: English Student" using stitch mode "none"
    And I click selector "#about_entries"
    Then I wait until element "#legal_entries" is visible
    And I click selector "#legal_entries"
    And I see no difference for "Legal Entries Hamburger Menu: English Student" using stitch mode "none"
    And I close my eyes
  
  @eyes
  Scenario: Teacher user sees the Teach, about and Legal dropdowns in hamburger
    Given I create a teacher named "Teacher Tom" and go home
    And I open my eyes to test "Hamburger Dropdowns in English Teacher"
    Then I wait until element "#hamburger-icon" is visible
    And I click selector "#hamburger-icon"
    Then I wait until element "#educate_entries" is visible
    And I click selector "#educate_entries"
    And I see no difference for "Teach Entries Hamburger Menu: English Teacher" using stitch mode "none"
    Then I wait until element "#educate_entries" is visible
    And I click selector "#educate_entries"
    Then I wait until element "#about_entries" is visible
    And I click selector "#about_entries"
    And I see no difference for "About Entries Hamburger Menu: English Teacher" using stitch mode "none"
    And I click selector "#about_entries"
    Then I wait until element "#legal_entries" is visible
    And I click selector "#legal_entries"
    And I see no difference for "Legal Entries Hamburger Menu: English Teacher" using stitch mode "none"
    And I close my eyes

  @only_mobile
  Scenario: Signed out user in English can see hamburger on mobile
    Given I am on "http://code.org/"
    And I rotate to portrait
    And I wait for 0.5 seconds
    Then I wait until element "#hamburger-icon" is visible
    And I click selector "#hamburger-icon"
    And I wait until element "a:contains(Course Catalog)" is visible
    And I wait until element "a:contains(Projects)" is visible
    And I wait until element "a:contains(Incubator)" is visible
    And I wait until element "a:contains(Help and support)" is visible
    And I wait until element "a:contains(Report a problem)" is visible
    And I wait until element "a:contains(Learn)" is visible
    And I wait until element "div:contains(Teach)" is visible
    And I wait until element "a:contains(Stats)" is visible
    And I wait until element "a:contains(Help Us)" is visible
    And I wait until element "div:contains(About)" is visible
    And I wait until element "div:contains(Privacy & Legal)" is visible
    


  @no_mobile
  Scenario: Signed out user in English should not see hamburger on desktop
    Given I am on "http://code.org/"
    And I dismiss the language selector
    Then I wait to see ".header_button"
    Then element "#hamburger-icon" is not visible

  @no_mobile
  Scenario: Student viewing hamburger dropdown and help button dropdown in English on desktop
    Given I create a student named "Sally Student" and go home
    Then I wait to see "#hamburger-icon"
    Then I wait to see "#help-button"
    And I click selector "#hamburger-icon"
    Then I wait to see "#hamburger-contents"
    And I see "#learn"
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
    And I see "#about_entries"
    And I see "#educate_entries"
    And I see "#learn"
    And I see "#stats"
    And I see "#help-us"
    Then I click selector "#help-icon"
    Then I wait to see "#help-contents"
    And I see "#report-bug"
    And I see "#support"
  
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
    And I see "#about_entries"
    And I see "#educate_entries"
    And I see "#learn"
    And I see "#stats"
    And I see "#help-us"
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
