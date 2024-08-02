@no_circle
@no_mobile
Feature: Code review Finish Button
  Background:
    Given I set up code review for teacher "Code Review Teacher" with 2 students in a group
    And I sign out using jquery
    And I sign in as "student_0"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"

    # Create a commit
    And I wait to see "#javalab-editor-save"
    Then I press "javalab-editor-save"
    And I wait to see "#commit-notes"
    And I press keys "my first commit" for element "#commit-notes"
    And element "#commit-notes" contains text "my first commit"
    Then I press "confirmationButton"
    And I wait until element "#commit-notes" is not visible

    # Check out review tab
    And I load the review tab
    And I wait until element ".uitest-open-code-review" is visible

    # Open a code review
    And I press ".uitest-open-code-review" using jQuery
    And I wait until element ".uitest-code-review-timeline-review" is visible

  Scenario: Running code in your own code review does not enable the finish button
    And I wait to see "#finishButton"
    Then element "#finishButton" is disabled
    Then I press "runButton"
    And I wait until element ".javalab-console" contains text "What's your name?"
    And I type "Harry" into "#console-input"
    And I press enter key
    And I wait until element ".javalab-console" contains text "[JAVALAB] Program completed."
    Then element "#finishButton" is disabled

  @skip
  Scenario: Running code in your peer's code review does not enable the finish button
    Given I sign in as "student_1"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the review tab
    And I load the code review for peer number 1 in the list
    Then element "#finishButton" is disabled
    Then I press "runButton"
    And I wait until element ".javalab-console" contains text "What's your name?"
    And I type "Harry" into "#console-input"
    And I press enter key
    And I wait until element ".javalab-console" contains text "[JAVALAB] Program completed."
    Then element "#finishButton" is disabled
    And I sign out using jquery
