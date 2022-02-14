# For performance purposes, we split code review scenarios into those that require
# creating a second student in the section (code_review_peer_scenarios.feature)
# and those that do not (code_review_project_owner_and_teacher_scenarios.feature)

@no_mobile
@no_ie
Feature: Code review (peer scenarios)

# At the end of the setup, we will have created
# a CSA section with an associated code review group.
# That code review group should have two students in it.
# The section itself will also have code review enabled.
  Background:
  # Create a section
    Given I create a levelbuilder named "Dumbledore"
    And I sign in as "Dumbledore" and go home
    And I create a new section named "CSA Section" assigned to "CSA Pilot"
    And I save the section url
    And I save the section id from row 0 of the section table
    Given I create a student named "Hermione"
    And I join the section
    Given I create a student named "Harry"
    And I join the section
  # Create a code review group with students in it.
  # Save the group, and enable code review for the section.
    Given I sign in as "Dumbledore" and go home
    And I create a new code review group for the section I saved
    And I add the first student to the first code review group
    And I add the first student to the first code review group
    And I click selector ".uitest-base-dialog-confirm"
    And I click selector ".toggle-input"
  # Visit Javalab level as student, and enable code review on the level
    Given I sign in as "Hermione"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the review tab
    And I enable code review

  Scenario: Students can see each others comments
    When I write a code review comment with text "Hermione's comment"
    Given I sign in as "Harry"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the peer project for peer number 1 in the list
    And I wait until element ".code-review-comment-body" is visible
    And element ".code-review-comment-body" has text "Hermione's comment"

  Scenario: Students who do not have code review enabled don't show up in peer dropdown
    And I press ".enable-review-checkbox" using jQuery
    And I wait until element ".enable-review-checkbox" is not checked
    Given I sign in as "Harry"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the review tab
    When I press ".peer-dropdown-button" using jQuery
    And I wait until element ".code-review-no-peers" is visible

  Scenario: The other student cannot see teacher comments
    When I sign in as "Dumbledore"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    Then I press "#levelbuilder-menu-toggle" using jQuery
    And I load student number 2's project from the blue teacher panel
    And I wait to see ".code-review-comment-input"
    And I write a code review comment with text "Teacher's comment"
    Given I sign in as "Harry"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the peer project for peer number 1 in the list
    Then element ".code-review-comment-body" is not visible

  Scenario: The other student can reveal a completed comment
    When I write a code review comment with text "Hermione's comment"
    And I mark the review comment complete
    Given I sign in as "Harry"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the peer project for peer number 1 in the list
    And element ".code-review-comment-body" is not visible
    And I press ".comment-right-header button" using jQuery
    And I wait to see ".comment-menu-item"
    And element ".comment-menu-item:first-child" has text "Show"
    And I click selector ".comment-menu-item:first-child"
    Then I see ".code-review-comment-body"

  Scenario: Other student does not have comment menu if comment is not complete
    Given I sign in as "Harry"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the review tab
    And I load the peer project for peer number 1 in the list
    And I write a code review comment with text "Harry's comment"
    Then element ".comment-right-header button" is not visible

  Scenario: Student cannot toggle another students review state
    Given I sign in as "Harry"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the review tab
    And I load the peer project for peer number 1 in the list
    Then element ".enable-review-checkbox" is not visible
