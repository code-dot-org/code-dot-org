@no_mobile
Feature: Code review V2

  Scenario: Code review v2
    Given I set up code review for teacher "Code Review Teacher" with 3 students in a group
    And I sign out using jquery
    Given I sign in as "student_0"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?enableExperiments=code_review_v2&noautoplay=true"

    # Create a commit
    And I wait to see "#javalab-editor-save"
    Then I press "javalab-editor-save"
    And I wait to see "#commit-notes"
    And I press keys "my first commit" for element "#commit-notes"
    And element "#commit-notes" contains text "my first commit"
    Then I press "confirmationButton"
    And I wait until element "#commit-notes" is not visible
    And I wait until jQuery Ajax requests are finished

    # something else
    And I load the review tab
