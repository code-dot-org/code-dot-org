@no_mobile
Feature: Web Lab

Scenario: Web Lab iframe contents loads
  Given I am a student
  When I am on "http://studio.code.org/projects/weblab/new"
  And I wait for jquery to load
  And I wait until element ".user_menu" is visible
  And I wait until element "iframe" is visible
  And I switch to the first iframe
  Then I wait to see "#bramble"
  And I wait until element "iframe" is visible
  And I switch to the first iframe
  Then I wait to see "#editor-holder"