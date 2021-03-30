Feature: Continue button on levels

Scenario: External Video Level
  Given I am a teacher
  Given I am on "http://studio.code.org/s/coursec-2019/lessons/14/levels/1"
  And I dismiss the teacher panel
  And I wait to see ".video-download"
  And I wait to see ".submitButton"
  Then I click ".submitButton" to load a new page
  Then I wait until I am on "http://studio.code.org/s/coursec-2019/lessons/15/levels/1"

Scenario: External Markdown Level
  Given I am on "http://studio.code.org/s/allthethings/lessons/21/levels/1"
  And I wait to see ".submitButton"
  Then I click ".submitButton" to load a new page
  And I wait until I am on "http://studio.code.org/s/allthethings/lessons/21/levels/2"

Scenario: Complete an auto-success level signed-out, continue, the auto-success level should show up as completed
  Given I am on "http://studio.code.org/s/allthethings/lessons/18/levels/14"
  And I rotate to landscape
  And I wait to see ".submitButton"
  Then I click ".submitButton" to load a new page
  And I wait until I am on "http://studio.code.org/s/allthethings/lessons/18/levels/15"
  And I wait for the page to fully load
  And I verify progress in the header of the current page is "perfect" for level 14
