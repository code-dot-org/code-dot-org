Feature: Student pairing
  Scenario: Pair Programming submits levels for both students
    Given I create a teacher named "Dr_Seuss"
    And I create a new section
    Given I create a student named "Thing_One"
    And I join the section
    Given I create a student named "Thing_Two"
    And I join the section
    Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7"
    And I rotate to landscape
    And I wait for the page to fully load
    Then I initiate pairing
    # complete the level
    And I wait until element "#runButton" is visible
    And I click selector "#runButton"
    And I wait until element "#submitButton" is visible
    And I click selector "#submitButton"
    Then I wait to see ".modal"
    And I wait until element "#confirm-button" is visible
    And I click selector "#confirm-button"
    # safari sometimes doesn't wait for the page load to initiate before checking if it's finished
    And I wait for 5 seconds
    And I wait until I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/8"
    And I wait for the page to fully load
    And I verify progress in the header of the current page is "perfect_assessment" for level 7
    And I sign out
    # verify the level is completed for the other student
    When I sign in as "Thing_One"
    Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7"
    And I wait for the page to fully load
    And I verify progress in the header of the current page is "perfect_assessment" for level 7

  Scenario: Pair Programming attempts levels for both students
    Given I create a teacher named "Dr_Seuss"
    And I create a new section
    Given I create a student named "Thing_One"
    And I join the section
    Given I create a student named "Thing_Two"
    And I join the section
    Given I am on "http://studio.code.org/s/allthethings/stage/2/puzzle/2"
    And I rotate to landscape
    And I wait for the page to fully load
    Then I initiate pairing
    # complete the level
    And I wait until element "#runButton" is visible
    And I click selector "#runButton"
    And I wait until element ".uitest-topInstructions-inline-feedback" is visible
    And I verify progress in the header of the current page is "attempted" for level 2
    And I sign out
    # verify the level is completed for the other student
    When I sign in as "Thing_One"
    Given I am on "http://studio.code.org/s/allthethings/stage/2/puzzle/2"
    And I wait for the page to fully load
    And I verify progress in the header of the current page is "attempted" for level 2