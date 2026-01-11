Feature: Web Lab 2 Preview
# Safari 16 throws an error due to a regular expression. These types of regular expressions
# are supported by our minimum Safari version, 16.6, but are not supported by the version Saucelabs uses.
# Once we upgrade to 17 we can likely remove no_safari.
@no_safari
@no_mobile
# Skipping for now while we set up preview subdomains. We may not be able to run this on Drone
# because Drone runs via localhost, which has issues with service workers. We should be able to re-enable
# it on other environments however.
@skip

Scenario: Web Lab 2 Preview loads
  Given I create a student named "Penelope"
  When I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/51/levels/11"
  And I wait until element "#preview" is visible
  And I switch to the iframe "#preview"
  And I wait until element "#codeprojects-preview-container" is visible
  And I switch to the iframe "#inner-preview"
  And I wait to see element with ID "hello-world-message"
  Then element with ID "hello-world-message" contains text "Hello world!"
  And I switch to the default content
  And I sign out
