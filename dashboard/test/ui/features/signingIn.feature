@dashboard_db_access
@no_mobile

Feature: Signing in and signing out

Scenario: Student sign in from code.org
  Given I am on "http://code.org/"
  And I set the language cookie
  And I create a student named "Bob"
  And I sign out
  Given I am on "http://code.org/"
  And I reload the page
  Then I wait to see ".header_user"
  Then I click selector "#signin_button"
  And I wait to see ".new_user"
  And I fill in username and password for "Bob"
  And I click selector "#signin-button"
  Then I wait until I am on "http://studio.code.org/home"
  Then I wait to see ".user_menu"
  Then element ".user_menu span:first" has text "Hi Bob"

Scenario: Student sign in from studio.code.org
  Given I am on "http://studio.code.org/"
  And I set the language cookie
  And I create a student named "Alice"
  And I sign out
  Given I am on "http://studio.code.org/"
  And I reload the page
  Then I wait to see ".header_user"
  Then I click selector "#signin_button"
  And I wait to see ".new_user"
  And I fill in username and password for "Alice"
  And I click selector "#signin-button"
  Then I wait until I am on "http://studio.code.org/home"
  Then I wait to see ".user_menu"
  Then element ".user_menu span:first" has text "Hi Alice"

Scenario: Teacher sign in from studio.code.org
  Given I am on "http://studio.code.org/"
  And I set the language cookie
  And I create a teacher named "Casey"
  And I sign out
  Given I am on "http://code.org/"
  And I reload the page
  Then I wait to see ".header_user"
  Then I click selector "#signin_button"
  And I wait to see ".new_user"
  And I fill in username and password for "Casey"
  And I click selector "#signin-button" to load a new page
  Then I wait until I am on "http://studio.code.org/home"
  Then I wait to see ".user_menu"
  Then element ".user_menu span:first" has text "Hi Casey"
