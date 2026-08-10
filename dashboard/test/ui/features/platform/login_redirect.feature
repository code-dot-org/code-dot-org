@playwright
Feature: Navigating to a level page with login required

# The 'ui-test-oceans' level is specifically chosen because it is a cached unit
# (see UI_TEST_CACHED_UNITS_MAP in lib/cdo/http_cache.rb) which lives in the
# UI-test curriculum partition, seeded by `rake seed:ui_test` (see
# dashboard/test/ui/config/README.md).
#
# These tests are meant to track regressions on redirect-after-login.
# See https://codedotorg.atlassian.net/browse/TEACH-758 for more details.

Scenario: Student navigates to provided cached level link with a login_required parameter
  Given I create a student named "Carah Student"
  And I sign out
  Given I am on "http://studio.code.org/courses/ui-test-oceans/units/1/lessons/1/levels/1?login_required=true"
  Then I wait until I am on "http://studio.code.org/users/sign_in"
  And I wait to see "#signin"
  And I fill in username and password for "Carah Student"
  And I click "#signin-button" to load a new page
  Then I wait until I am on "http://studio.code.org/courses/ui-test-oceans/units/1/lessons/1/levels/1"

Scenario: Student already logged in navigates to provided cached level link with a login_required parameter
  Given I create a student who has never signed in named "François Student" and go home
  And I am on "http://studio.code.org/courses/ui-test-oceans/units/1/lessons/1/levels/1?login_required=true"
  Then I wait until I am on "http://studio.code.org/courses/ui-test-oceans/units/1/lessons/1/levels/1"
