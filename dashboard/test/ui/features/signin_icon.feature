@no_mobile
Feature: Sign In Icon in Header

#TOOD: Erin B., remove the pagemode cookie related steps when launched.

@skip
Scenario: Signed Out - sign in button shows regardless of cookie
  Given I am on "http://code.org/"
  And I set the language cookie
  And I wait until element "#signin_button" is visible
  And I wait until element ".user_icon" is not visible
  Given I set the pagemode cookie to "create_header_2018"
  Then I reload the page
  And I wait to see ".create_menu"
  And I wait until element "#signin_button" is visible
  And I wait until element ".user_icon" is not visible

Scenario: Teacher Signed In - shows icon with correct links
  Given I create a teacher named "Ms_Frizzle"
  Given I set the pagemode cookie to "create_header_2018"
  Then I reload the page
  And I wait until element ".create_menu" is visible
  And I wait until element ".user_icon" is visible
  And I wait until element ".fa-user" is visible
  And I click selector ".user_icon"
  # TODO: Check for correct display name
  And I wait until element "#user-edit" is visible
  And I wait until element "#user-signout" is visible
  Given I am on "http://code.org/help"
  Given I set the pagemode cookie to "create_header_2018"
  Then I reload the page
  And I wait until element ".create_menu" is visible
  And I wait until element ".user_icon" is visible
  And I wait until element ".fa-user" is visible
  And I click selector ".user_icon"
  # TODO: Check for correct display name
  And I wait until element "#user-edit" is visible
  And I wait until element "#user-signout" is visible
  Then I sign out
  And I wait until element "#signin_button" is visible
  And I wait until element ".user_icon" is not visible

Scenario: Student Signed In - shows icon with correct links
  Given I create a student named "Arnold"
  Given I set the pagemode cookie to "create_header_2018"
  Then I reload the page
  And I wait until element ".create_menu" is visible
  And I wait until element ".user_icon" is visible
  And I wait until element ".fa-user" is visible
  And I click selector ".user_icon"
  # TODO: Check for correct display name
  And I wait until element "#user-edit" is visible
  And I wait until element "#user-signout" is visible
  Given I am on "http://code.org/help"
  Given I set the pagemode cookie to "create_header_2018"
  Then I reload the page
  And I wait until element ".create_menu" is visible
  And I wait until element ".user_icon" is visible
  And I wait until element ".fa-user" is visible
  And I click selector ".user_icon"
  # TODO: Check for correct display name
  And I wait until element "#user-edit" is visible
  And I wait until element "#user-signout" is visible
  Then I sign out
  And I wait until element "#signin_button" is visible
  And I wait until element ".user_icon" is not visible

# Pair Programming

# Links go where they should 
