Feature: Web Lab 2 Preview
# Safari 16 throws an error due to a regular expression. These types of regular expressions
# are supported by our minimum Safari version, 16.6, but are not supported by the version Saucelabs uses.
# Once we upgrade to 17 we can likely remove no_safari.
@no_safari
@no_mobile

# The preview doesn't load on UI tests run via localhost, so we split the preview loading and the
# general loading of the editor/instructions into two separate tests.
Scenario: Web Lab 2 Instructions and Editor load
  Given I create a student named "Penelope"
  When I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/51/levels/11"
  And I wait until element "#instructions-panel" is visible
  Then element with ID "instructions-panel" contains text "This is the level for a basic Web Lab 2 UI Test. Please do not change the start code for this level without changing the UI test!"
  And element with ID "uitest-files-list" contains text "index.html"
  And I wait until element ".codemirror-container" contains text "Hello world!"
