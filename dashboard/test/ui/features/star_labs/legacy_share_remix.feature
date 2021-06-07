@no_mobile
@as_student
Feature: Legacy Share Remix

  Background:
    Given I am on "http://studio.code.org/s/artist/lessons/1/levels/10?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And element "#runButton" is visible
    And element "#resetButton" is hidden

  Scenario: Remixing a legacy /c/ share link
    Then I press "runButton"
    Then I press "finishButton"
    And I wait to see ".congrats"
    And I navigate to the share URL
    And I select the "How it Works (View Code)" small footer item
    And I wait to see ".project_remix"
    And I press the first ".project_remix" element to load a new page
    And check that the URL contains "/projects/artist/"
    And check that the URL contains "/edit"
