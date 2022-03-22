# For performance purposes, we split code review scenarios into those that require
# creating a second student in the section (code_review_peer_scenarios.feature)
# and those that do not (code_review_project_owner_and_teacher_scenarios.feature)

@no_mobile
Feature: Code review (project owner/teacher scenarios)

  # At the end of the setup, we will have created
  # a CSA section with an associated code review group.
  # That code review group should have one student in it.
  # The section itself will also have code review enabled.
  Background:
    # Create a section
    Given I create a levelbuilder named "Dumbledore"
    And I create a new section assigned to "ui-test-csa-family-script"
    And I sign in as "Dumbledore" and go home
    And I save the section url
    And I save the section id from row 0 of the section table
    Given I create a student named "Hermione"
    And I join the section
    # Observed flakiness trying to navigate to teacher dashboard while still signed in as Hermione.
    # Explicitly wait for sign out to occur to avoid this.
    And I wait to see ".alert-success"
    And I sign out using jquery
    # Create a code review group with students in it.
    # Save the group, and enable code review for the section.
    Given I sign in as "Dumbledore" and go home
    And I create a new code review group for the section I saved
    And I add the first student to the first code review group
    And I click selector ".uitest-base-dialog-confirm"
    And I click selector ".toggle-input"
    # Visit Javalab level as student, and enable code review on the level
    Given I sign in as "Hermione"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the review tab
    And I enable code review

  Scenario: The author can see teacher comments
    When I sign in as "Dumbledore"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    Then I press "#levelbuilder-menu-toggle" using jQuery
    And I load student number 1's project from the blue teacher panel
    And I wait to see ".code-review-comment-input"
    And I write a code review comment with text "Teacher's comment"
    When I sign in as "Hermione"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the review tab
    Then element ".code-review-comment-body" has text "Teacher's comment"

  Scenario: The student can reveal a completed comment
    When I write a code review comment with text "Hermione's comment"
    And I mark the review comment complete
    And I press ".comment-right-header button" using jQuery
    And I wait to see ".comment-menu-item"
    And element ".comment-menu-item:first-child" has text "Show"
    And I click selector ".comment-menu-item:first-child"
    Then I see ".code-review-comment-body"

  Scenario: Teacher can reveal a completed comment
    When I write a code review comment with text "Hermione's comment"
    And I mark the review comment complete
    When I sign in as "Dumbledore"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    Then I press "#levelbuilder-menu-toggle" using jQuery
    And I load student number 1's project from the blue teacher panel
    And I wait to see ".code-review-comment-input"
    And I press ".comment-right-header button" using jQuery
    And I wait to see ".comment-menu-item"
    And element ".comment-menu-item:first-child" has text "Show"
    And I click selector ".comment-menu-item:first-child"
    Then I see ".code-review-comment-body"

  @skip
  # this scenario doesn't currently work because of a bug.
  # remove skip once we fix this bug: https://codedotorg.atlassian.net/browse/CSA-1068
  Scenario: The teacher can mark a comment complete
    When I sign in as "Dumbledore"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    Then I press "#levelbuilder-menu-toggle" using jQuery
    And I load student number 1's project from the blue teacher panel
    And I wait to see ".code-review-comment-input"
    And I write a code review comment with text "Teacher's comment"
    Then I mark the review comment complete

  # Note that because we are using a levelbuilder account for the teacher in this scenario
  # to give access to the code review groups UI (only visible if section is assigned CSA),
  # we encounter a bug here that hides the "resolve comment" option
  # from the list of comment menu items. For "normal" teacher accounts,
  # the "resolve comment" option appears, but does not in these UI tests.
  # See this Jira ticket and Slack thread for related information:
  # https://codedotorg.atlassian.net/browse/LP-2142
  # https://codedotorg.slack.com/archives/C01EF4GJ9GE/p1638989368018100
  Scenario: Teacher can delete comments
    When I write a code review comment with text "Hermione's comment"
    When I sign in as "Dumbledore"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    Then I press "#levelbuilder-menu-toggle" using jQuery
    And I load student number 1's project from the blue teacher panel
    And I wait to see ".code-review-comment-input"
    And I press ".comment-right-header button" using jQuery
    And I wait to see ".comment-menu-item"
    And element ".comment-menu-item:nth-child(1)" has text "Delete"
    And I click selector ".comment-menu-item:nth-child(1)"
    Then I wait until element ".code-review-comment-body" is not visible
