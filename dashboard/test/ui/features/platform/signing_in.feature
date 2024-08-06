# @no_mobile
@single_session
Feature: Signing in and signing out

Scenario: Student sign in from code.org
  Given I create a student named "Bob"
  And I sign out
  And I set the cookie named "_loc_notice" to "1"
  Given I am on "http://code.org/"
  Then I wait to see "#header_user_signin"
  Then I click "#header_user_signin"
  And I wait to see "#signin"
  And I fill in username and password for "Bob"
  And I click "#signin-button" to load a new page
  Then I wait until I am on "http://studio.code.org/home"
  Then I wait to see "#header_user_menu"
  And I wait until element ".display_name" is visible
  And element ".display_name" contains text "Bob"
  And I delete the cookie named "_loc_notice"

Scenario: Student sign in from studio.code.org
  Given I create a student named "Alice"
  And I sign out
  Given I am on "http://studio.code.org/users/sign_in"
  And I wait to see "#signin"
  And I fill in username and password for "Alice"
  And I click "#signin-button" to load a new page
  Then I wait until I am on "http://studio.code.org/home"
  Then I wait to see "#header_user_menu"
  And I wait until element ".display_name" is visible
  And element ".display_name" contains text "Alice"

Scenario: Student sign in from studio.code.org in the eu
  Given I create a student in the eu named "Alice"
  And I sign out
  Given I am on "http://studio.code.org/users/sign_in"
  And I wait to see "#signin"
  And I fill in username and password for "Alice"
  And I click "#signin-button" to load a new page
  Then I wait until I am on "http://studio.code.org/home"
  Then I wait to see "#header_user_menu"
  And I wait until element ".display_name" is visible
  And element ".display_name" contains text "Alice"

Scenario: Teacher sign in from studio.code.org
  Given I create a teacher named "Casey"
  And I sign out
  Given I am on "http://studio.code.org/users/sign_in"
  And I wait to see "#signin"
  And I fill in username and password for "Casey"
  And I click "#signin-button" to load a new page
  Then I wait until I am on "http://studio.code.org/home"
  Then I wait to see "#header_user_menu"
  And I wait until element ".display_name" is visible
  And element ".display_name" contains text "Casey"

Scenario: Join non-existent section from sign in page shows error
  Given I am on "http://studio.code.org/users/sign_in/"
  And I type "9999999999" into "#section_code"
  And I click ".section-sign-in button" to load a new page
  Then I wait until I am on "http://studio.code.org/join"
  Then I wait to see ".alert-danger"
  And element ".alert-danger" contains text "Could not find a section with code"

@as_taught_student
Scenario: Join existing section from sign in page goes to section join page
  Given I sign out
  Given I am on "http://studio.code.org/users/sign_in/"
  And I type the section code into "#section_code"
  And I click ".section-sign-in button" to load a new page
  Then I wait to see ".main"
  And element ".main" contains text "Register to join section"
