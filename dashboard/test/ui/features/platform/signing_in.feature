# @no_mobile
@single_session
Feature: Signing in and signing out

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

@as_taught_student
Scenario: Signed-out joining non-picture non-word section from sign in page goes to link account page
  Given I sign out
  Given I am on "http://studio.code.org/users/sign_in/"
  And I type the section code into "#section_code"
  And I click ".section-sign-in button" to load a new page
  And I wait until element "a:contains(Create an account)" is visible
