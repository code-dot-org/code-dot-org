Feature: Dance Party

  @no_mobile
  Scenario: Dance AI Modal
    Given I am on "http://studio.code.org/s/allthethings/lessons/37/levels/3"
    And I wait for the page to fully load
    And I select age 10 in the age dialog
    And I drag block "dance_ai" to block "setup"
    And I click block field "[data-id='setup'] > [data-id='dance_ai'] > .blocklyEditableText"

    And I press "runButton"
    And I wait until element ".congrats" is visible
