@dashboard_db_access

Feature: Signing in and signing out

Scenario:
  Given I am on "http://code.org/"
  And I set the language cookie
  And I create a student named "Bob"
  Given I am on "http://code.org/"
  Then I wait to see ".header_user"
  Then I click selector "#signin_button"
  And I wait to see ".new_user"
  And I fill in username and password for "Bob"
  And I click selector "input[type=submit][value='Sign in']"
  And I wait to see ".header_user"
  Then check that I am on "http://studio.code.org/"
  Then element ".user_menu span:first" has text "Hi Bob"

Scenario:
  Given I am on "http://studio.code.org/"
  And I set the language cookie
  And I create a student named "Alice"
  Given I am on "http://code.org/"
  Then I wait to see ".header_user"
  Then I click selector "#signin_button"
  And I wait to see ".new_user"
  And I fill in username and password for "Alice"
  And I click selector "input[type=submit][value='Sign in']"
  And I wait to see ".header_user"
  Then check that I am on "http://studio.code.org/"
  Then element ".user_menu span:first" has text "Hi Alice"

Scenario:
  Given I am on "http://studio.code.org/"
  And I set the language cookie
  And I create a teacher named "Casey"
  Given I am on "http://code.org/"
  Then I wait to see ".header_user"
  Then I click selector "#signin_button"
  And I wait to see ".new_user"
  And I fill in username and password for "Casey"
  And I click selector "input[type=submit][value='Sign in']"
  And I wait to see ".header_user"
  Then check that I am on "http://code.org/teacher-dashboard#/"
  Then element ".user_menu span:first" has text "Hi Casey"
