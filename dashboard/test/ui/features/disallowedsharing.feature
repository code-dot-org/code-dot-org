@no_mobile
Feature: Shared content restrictions

Background:
  Given I am on "http://learn.code.org/s/playlab/puzzle/10?noautoplay=true"

@webpurify
Scenario: Sharing a profane studio game
  And I've initialized the workspace with a studio say block saying "shit"
  And I close the dialog
  Then I press "runButton"
  Then I press ".share" using jQuery
  Then I wait to see "#share-fail-explanation"

Scenario: Sharing a phone number studio game
  Given I am on "http://learn.code.org/s/playlab/puzzle/10?noautoplay=true"
  And I've initialized the workspace with a studio say block saying "800.555.5555"
  And I close the dialog
  Then I press "runButton"
  Then I press ".share" using jQuery
  Then I wait to see "#share-fail-explanation"

Scenario: Sharing an email studio game
  Given I am on "http://learn.code.org/s/playlab/puzzle/10?noautoplay=true"
  And I've initialized the workspace with a studio say block saying "brian@code.org"
  And I close the dialog
  Then I press "runButton"
  Then I press ".share" using jQuery
  Then I wait to see "#share-fail-explanation"
