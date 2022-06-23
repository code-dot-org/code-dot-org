@no_mobile
Feature: Code review V2

  Scenario: Code review v2
    Given I set up code review for teacher "Code Review Teacher" with 2 students in a group
    And I sign out using jquery

    # Sign in as a student in the code review group
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

    # Check out review tab
    And I load the review tab
    And I wait until element ".uitest-code-review-timeline-commit" is visible

    # Peer dropdown has no peers

    # Open a code review
    And I press ".uitest-open-code-review" using jQuery
    And I wait until element ".uitest-code-review-timeline-review" is visible
    And I sign out using jquery

    # Log in as another student and review their peer
    Given I sign in as "student_1"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?enableExperiments=code_review_v2&noautoplay=true"
    And I load the review tab
    And I load the code review for peer number 1 in the list
    And I write a code review v2 comment with text "Great work!"
    And I sign out using jquery

    # Log in as code review owner
    Given I sign in as "student_0"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?enableExperiments=code_review_v2&noautoplay=true"
    And I load the review tab
    And I wait until element ".code-review-comment-body" is visible
    And I wait for 5 seconds

