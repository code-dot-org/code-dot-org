@no_mobile
Feature: Sign In Button and User Menu in Header

Scenario: Signed Out - sign in button shows
  Given I am on "http://code.org/"
  And I set the language cookie
  And I wait until element "#signin_button" is visible
  And I wait until element ".display_name" is not visible

Scenario: Teacher Signed In - shows display name with correct links
  Given I create a teacher named "Ms_Frizzle" and go home
  And I wait until element ".display_name" is visible
  And element ".display_name" contains text "Ms_Frizzle"
  And I click selector ".display_name"
  And I wait until element "#user-edit" is visible
  And I wait until element "#user-signout" is visible
  # Confirm dropdown is as expected on Pegasus
  Given I am on "http://code.org/help"
# Create menu does not display on Safari-1024px
#  And I wait until element ".create_menu" is visible
  And I wait until element ".display_name" is visible
  And element ".display_name" contains text "Ms_Frizzle"
  And I click selector ".display_name"
  And I wait until element "#user-edit" is visible
  And I wait until element "#user-signout" is visible
  Then I press "user-signout" to load a new page
  And I wait until element "#signin_button" is visible
  And I wait until element ".display_name" is not visible

Scenario: Student Signed In - shows display name with correct links
  Given I create a student named "Arnold" and go home
  And I wait until element ".display_name" is visible
  And element ".display_name" contains text "Arnold"
  And I click selector ".display_name"
  And I wait until element "#user-edit" is visible
  And I wait until element "#user-signout" is visible
  # Confirm dropdown is as expected on Pegasus
  Given I am on "http://code.org/help"
  And I dismiss the language selector
  And I wait until element ".display_name" is visible
  And element ".display_name" contains text "Arnold"
  And I click selector ".display_name"
  And I wait until element "#user-edit" is visible
  And I wait until element "#user-signout" is visible
  # Check that the dropdown links work
  And I press "user-edit" to load a new page
  And check that I am on "http://studio.code.org/users/edit"
  And I wait until element ".display_name" is visible
  And I click selector ".display_name"
  And I wait until element "#user-signout" is visible
  And I press "user-signout" to load a new page
  And I wait until element "#signin_button" is visible
  And I wait until element ".display_name" is not visible

Scenario: Unicode in display name
  Given I create a student named "Caoimhín" and go home
  And I wait until element ".display_name" is visible
  And element ".display_name" contains text "Caoimhín"
