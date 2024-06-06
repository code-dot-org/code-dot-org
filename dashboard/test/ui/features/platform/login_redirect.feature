Feature: Navigating to a level page with login required

# The 'starwars' level is specifically chosen because it is a level that is
# seeded in the test environment (see list in dashboard/lib/tasks/seed.rake)
# and is a cached unit. (see lib/cdo/http_cache.rb for that fixed listing)
#
# These tests are meant to track regressions on redirect-after-login.
# See https://codedotorg.atlassian.net/browse/TEACH-758 for more details.

Scenario: Student navigates to provided cached level link with a login_required parameter
  Given I create a student named "Carah Student"
  And I sign out
  Given I am on "http://studio.code.org/s/starwars/lessons/1/levels/1?login_required=true"
  Then I wait until I am on "http://studio.code.org/users/sign_in"
  And I wait to see "#signin"
  And I fill in username and password for "Carah Student"
  And I click "#signin-button" to load a new page
  Then I wait until I am on "http://studio.code.org/s/starwars/lessons/1/levels/1"

Scenario: Student already logged in navigates to provided cached level link with a login_required parameter
  Given I create a student who has never signed in named "François Student" and go home
  And I am on "http://studio.code.org/s/starwars/lessons/1/levels/1?login_required=true"
  Then I wait until I am on "http://studio.code.org/s/starwars/lessons/1/levels/1"
