Feature: Navigating to a level page with login required

Scenario: Student navigates to provided cached level link with a login_required parameter
  Given I create a student named "Carah Student"
  And I sign out
  Given I am on "http://studio.code.org/s/poem-art-2021/lessons/1/levels/1?login_required=true"
  Then I wait until I am on "http://studio.code.org/users/sign_in"
  And I wait to see "#signin"
  And I fill in username and password for "Carah Student"
  And I click "#signin-button" to load a new page
  Then I wait until I am on "http://studio.code.org/s/poem-art-2021/lessons/1/levels/1"

Scenario: Student already logged in navigates to provided cached level link with a login_required parameter
  Given I create a student who has never signed in named "François Student" and go home
  And I am on "http://studio.code.org/s/poem-art-2021/lessons/1/levels/1?login_required=true"
  Then I wait until I am on "http://studio.code.org/s/poem-art-2021/lessons/1/levels/1"
