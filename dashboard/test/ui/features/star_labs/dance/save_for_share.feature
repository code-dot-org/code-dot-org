# Testing that various paths out of a project-backed level to a sharing link trigger
# a save at the appropriate time so the student's latest changes are saved.

@no_mobile @no_ie
Feature: Saving project before sharing
  Background:
    # Block numbers are based on default code of free-play level
    Given "setup" refers to block "1"
    Given "set background effect" refers to block "2"
    Given "make a new duck" refers to block "3"
    Given "make a new moose" refers to block "4"
    Given "make a new cat" refers to block "5"

  Scenario: Free play level saves when Share is clicked
    Given I load the Dance Party free play level
    And I wait to see "#clear-puzzle-header"
    And I reset the puzzle
    And I drag block "make a new cat" to offset "-2000, 0"
    Then block "make a new cat" has been deleted

    Given I memorize my code
    When I click ".project_share"
    # Wait a moment to reduce flakiness from slow saves
    And I wait for 0.5 seconds
    And I reload the page
    And I wait until I see selector "#runButton"
    Then the project matches my memorized code

  @as_student
  Scenario: Free play level saves when Remix is clicked
    Given I load the Dance Party free play level
    And I wait to see "#clear-puzzle-header"
    And I reset the puzzle
    And I drag block "make a new cat" to offset "-2000, 0"
    Then block "make a new cat" has been deleted

    Given I memorize my code
    When I click ".project_remix" to load a new page
    And I wait until I see selector "#runButton"
    Then the project matches my memorized code

  Scenario: Free play level saves when Finish is clicked
    Given I load the Dance Party free play level
    And I wait to see "#clear-puzzle-header"
    And I reset the puzzle
    And I drag block "make a new cat" to offset "-2000, 0"
    Then block "make a new cat" has been deleted

    Given I memorize my code
    When I click "#finishButton"
    Then I wait until element ".project_updated_at" contains text "Saved"
    And I reload the page
    And I wait until I see selector "#runButton"
    Then the project matches my memorized code

  @as_student
  Scenario: Project level saves when Share is clicked
    Given I load the Dance Party project level
    And I reset the puzzle
    And I drag block "make a new cat" to offset "-2000, 0"
    Then block "make a new cat" has been deleted

    Given I memorize my code
    When I click ".project_share"
    # Wait a moment to reduce flakiness from slow saves
    And I wait for 0.5 seconds
    And I reload the page
    And I wait until I see selector "#runButton"
    Then the project matches my memorized code

  @as_student
  Scenario: Project level saves when Remix is clicked
    Given I load the Dance Party project level
    And I reset the puzzle
    And I drag block "make a new cat" to offset "-2000, 0"
    Then block "make a new cat" has been deleted

    Given I memorize my code
    When I click ".project_remix" to load a new page
    And I wait until I see selector "#runButton"
    Then the project matches my memorized code
