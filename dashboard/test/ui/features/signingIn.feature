@dashboard_db_access
@no_mobile

Feature: Signing in and signing out

# student signin from code.org
Scenario:
  Given I am on "http://code.org/"
  And I set the language cookie
  And I create a student named "Bob"
  And I sign out
  Given I am on "http://code.org/"
  And I reload the page
  Then I wait for 2 seconds
  Then I wait to see ".header_user"
  Then I click selector "#signin_button"
  And I wait to see ".new_user"
  And I fill in username and password for "Bob"
  And I click selector "input[type=submit][value='Sign in']"
  And I wait to see ".header_user"
  Then check that I am on "http://studio.code.org/"
  Then element ".user_menu span:first" has text "Hi Bob"
  Then I click selector ".user_menu span:first"
  Then I click selector ".user_menu a:last"
  Then I wait for 2 seconds
  Then I wait to see ".header_user"

# student signin from studio.code.org
Scenario:
  Given I am on "http://studio.code.org/"
  And I set the language cookie
  And I create a student named "Alice"
  And I sign out
  Given I am on "http://studio.code.org/"
  And I reload the page
  Then I wait for 2 seconds
  Then I wait to see ".header_user"
  Then I click selector "#signin_button"
  And I wait to see ".new_user"
  And I fill in username and password for "Alice"
  And I click selector "input[type=submit][value='Sign in']"
  And I wait to see ".header_user"
  Then check that I am on "http://studio.code.org/"
  Then element ".user_menu span:first" has text "Hi Alice"
  Then I click selector ".user_menu span:first"
  Then I click selector ".user_menu a:last"
  Then I wait for 2 seconds
  Then I wait to see ".header_user"

# teacher sign in
Scenario:
  Given I am on "http://studio.code.org/"
  And I set the language cookie
  And I create a teacher named "Casey"
  And I sign out
  Given I am on "http://code.org/"
  And I reload the page
  Then I wait for 2 seconds
  Then I wait to see ".header_user"
  Then I click selector "#signin_button"
  And I wait to see ".new_user"
  And I fill in username and password for "Casey"
  And I click selector "input[type=submit][value='Sign in']"
  Then I wait for 2 seconds
  And I wait to see ".header_user"
  Then I wait for 2 seconds
  Then check that the url contains "teacher-dashboard"
  Then element ".user_menu span:first" has text "Hi Casey"
  Then I click selector ".user_menu span:first"
  Then I click selector ".user_menu a:last"
  Then I wait for 2 seconds
  Then I wait to see ".header_user"
