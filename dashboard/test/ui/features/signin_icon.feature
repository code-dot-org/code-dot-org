@no_mobile
Feature: Sign In Icon in Header

# TOOD: Erin B., remove the pagemode cookie related steps when launched.

Scenario: Signed Out - sign in button shows regardless of cookie
  Given I am on "http://code.org/"
  And I set the language cookie
  And I wait until element "#new_signin_button" is visible
  And I wait until element ".user_icon" is not visible
  Given I set the pagemode cookie to "create_header_2018"
  Then I reload the page
  And I wait until element ".create_menu" is visible
  And I wait until element "#new_signin_button" is visible
  And I wait until element ".user_icon" is not visible

Scenario: Teacher Signed In - shows icon with correct links
  Given I create a teacher named "Ms_Frizzle"
  Given I set the pagemode cookie to "create_header_2018"
  Then I reload the page
  And I wait until element ".create_menu" is visible
  And I wait until element ".user_icon" is visible
  And I wait until element ".fa-user" is visible
  And I click selector ".user_icon"
  And I wait until element ".display_name" is visible
  And element ".display_name" contains text "Ms_Frizzle"
  And I wait until element "#user-edit" is visible
  And I wait until element "#user-signout" is visible
  Given I am on "http://code.org/help"
  Given I set the pagemode cookie to "create_header_2018"
  Then I reload the page
  And I wait until element ".create_menu" is visible
  And I wait until element ".user_icon" is visible
  And I wait until element ".fa-user" is visible
  And I click selector ".user_icon"
  And I wait until element ".display_name" is visible
  And element ".display_name" contains text "Ms_Frizzle"
  And I wait until element "#user-edit" is visible
  And I wait until element "#user-signout" is visible
  Then I sign out
  And I wait until element "#new_signin_button" is visible
  And I wait until element ".user_icon" is not visible

Scenario: Student Signed In - shows icon with correct links
  Given I create a student named "Arnold"
  Given I set the pagemode cookie to "create_header_2018"
  Then I reload the page
  And I wait until element ".create_menu" is visible
  And I wait until element ".user_icon" is visible
  And I wait until element ".fa-user" is visible
  And I click selector ".user_icon"
  And I wait until element ".display_name" is visible
  And element ".display_name" contains text "Arnold"
  And I wait until element "#user-edit" is visible
  And I wait until element "#user-signout" is visible
  Given I am on "http://code.org/help"
  Given I set the pagemode cookie to "create_header_2018"
  Then I reload the page
  And I wait until element ".create_menu" is visible
  And I wait until element ".user_icon" is visible
  And I wait until element ".fa-user" is visible
  And I click selector ".user_icon"
  And I wait until element ".display_name" is visible
  And element ".display_name" contains text "Arnold"
  And I wait until element "#user-edit" is visible
  And I wait until element "#user-signout" is visible
  # Check that the dropdown links work
  And I click selector "#user-edit"
  And check that I am on "http://studio.code.org/users/edit"
  And I wait until element ".user_icon" is visible
  And I click selector ".user_icon"
  And I wait until element "#user-signout" is visible
  And I click selector "#user-signout"
  And I wait until element "#new_signin_button" is visible
  And I wait until element ".user_icon" is not visible

Scenario: Pair Programming Icon
  Given I create a teacher named "Dr_Seuss"
  Then I see the section set up box
  And I create a new section
  And I save the section url
  Then I sign out
  Given I create a student named "Thing_One"
  And I navigate to the section url
  Then I sign out
  Given I create a student named "Thing_Two"
  And I navigate to the section url
  Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?noautoplay=true"
  Given I set the pagemode cookie to "create_header_2018"
  Then I reload the page
  And I wait until element ".user_icon" is visible
  And I click selector ".user_icon"
  And I wait until element "#pairing_link" is visible
  And I click selector "#pairing_link"
  And I wait until element ".student" is visible
  And I click selector ".student"
  And I wait until element ".addPartners" is visible
  And I click selector ".addPartners"
  And I wait until element ".user_icon" is visible
  And I wait until element ".fa-users" is visible
