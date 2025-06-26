@no_mobile
Feature: Sign In Button and User Menu in Header

Scenario: Signed Out - create account button shows on signed out studio page
  Given I am on "http://studio.code.org/catalog"
  And I set the language cookie
  And I wait until element "#create_account_button" is visible
  And I wait until element ".display_name" is not visible

Scenario: Teacher Signed In - shows display name with correct links
  Given I create a teacher named "Ms_Frizzle" and go home
  And I wait until element ".display_name" is visible
  And element ".display_name" contains text "Ms_Frizzle"
  And I click selector ".display_name"
  And I wait until element "#user-edit" is visible
  And I wait until element "#user-signout" is visible

Scenario: Student Signed In - shows display name with correct links
  Given I create a student named "Arnold" and go home
  And I wait until element ".display_name" is visible
  And element ".display_name" contains text "Arnold"
  And I click selector ".display_name"
  And I wait until element "#user-edit" is visible
  And I wait until element "#user-signout" is visible

Scenario: Unicode in display name
  Given I create a student named "Caoimhín" and go home
  And I wait until element ".display_name" is visible
  And element ".display_name" contains text "Caoimhín"
