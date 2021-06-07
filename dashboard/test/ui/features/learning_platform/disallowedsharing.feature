# Brad (2018-11-14) Skip on IE due to webdriver exception
@no_ie
@no_mobile
Feature: Shared content restrictions

Background:
  Given I am on "http://studio.code.org/s/playlab/lessons/1/levels/10?noautoplay=true"
  And I wait for the page to fully load

@webpurify
Scenario: Sharing a profane studio game
  And I've initialized the workspace with a studio say block saying "shit"
  Then I press "runButton"
  Then I press ".share" using jQuery
  Then I wait to see "#share-fail-explanation"

Scenario: Sharing a phone number studio game
  Given I am on "http://studio.code.org/s/playlab/lessons/1/levels/10?noautoplay=true"
  And I wait for the page to fully load
  And I've initialized the workspace with a studio say block saying "800.555.5555"
  Then I press "runButton"
  Then I press ".share" using jQuery
  Then I wait to see "#share-fail-explanation"

Scenario: Sharing an email studio game
  Given I am on "http://studio.code.org/s/playlab/lessons/1/levels/10?noautoplay=true"
  And I wait for the page to fully load
  And I've initialized the workspace with a studio say block saying "brian@code.org"
  Then I press "runButton"
  Then I press ".share" using jQuery
  Then I wait to see "#share-fail-explanation"
