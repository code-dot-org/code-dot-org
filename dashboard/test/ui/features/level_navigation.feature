Feature: Continue button on levels

Scenario: External Video Level
  Given I am on "http://studio.code.org/s/coursec-2019/stage/14/puzzle/1"
  And I wait to see ".video-download"
  And I wait to see ".submitButton"
  Then I click ".submitButton" to load a new page
  Then I wait until I am on "http://studio.code.org/s/coursec-2019/stage/15/puzzle/1"
