@no_mobile
Feature: Legacy Share Remix

  Background:
    Given I am on "http://studio.code.org/s/artist/stage/1/puzzle/10?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I close the instructions overlay if it exists
    And element "#runButton" is visible
    And element "#resetButton" is hidden

  Scenario: Remixing a legacy /c/ share link
    Then I press "runButton"
    And I wait to see ".congrats"
    And I navigate to the share URL
    And I select the "How it works" small footer item
    And I wait to see ".project_remix"
    And I press the first ".project_remix" element
    And I wait for 10 seconds
    And check that the URL contains "/projects/artist/"
    And check that the URL contains "/edit"
