@no_mobile
@eyes
Feature: Code review V2

  # Note: this test does not cover adding comments to the review because the slate text editor
  # does not work with automated testing.
  Scenario: Code review V2
    When I open my eyes to test "Javalab Code Review V2"
    Given I set up code review for teacher "Code Review Teacher" with 2 students in a group
    And I sign out using jquery

    # Sign in as a student in the code review group
    Given I sign in as "student_0"
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
    And I wait until element ".uitest-code-review-timeline-commit" is visible

    # Open a code review
    And I press ".uitest-open-code-review" using jQuery
    And I wait until element ".uitest-code-review-timeline-review" is visible
    And I sign out using jquery

    # Log in as another student and review their peer
    Given I sign in as "student_1"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the review tab
    And I load the code review for peer number 1 in the list
    Then I see no difference for "student code reviewing peer" using stitch mode "none"
    And I sign out using jquery

    # Log in as the teacher and look at the student's review
    Given I sign in as "Code Review Teacher"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load student number 1's project from the blue teacher panel
    And I load the review tab
    Then I see no difference for "teacher code reviewing student" using stitch mode "none"
    And I sign out using jquery

    # Log in as code review owner and close the code review
    Given I sign in as "student_0"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the review tab
    Then I see no difference for "student viewing own code review" using stitch mode "none"
    And I press ".uitest-close-code-review" using jQuery
    And I wait until element ".uitest-open-code-review" is visible
    And I close my eyes

