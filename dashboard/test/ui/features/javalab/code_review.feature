@no_mobile
@no_ie
Feature: Code review

Background:
  Given I create a teacher named "Dumbledore"
  And I create a new section
  Given I create a student named "Hermione"
  And I join the section
  And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
  And I load the review tab
  And I enable code review

  Scenario: Students can see each others comments
    When I write a code review comment with text "Hermione's comment"
    Given I create a student named "Harry"
    And I join the section
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the peer project for peer number 1 in the list
    And I wait until element ".code-review-comment-body" is visible
    And element ".code-review-comment-body" has text "Hermione's comment"

  Scenario: Students who do not have code review enabled don't show up in peer dropdown
    And I press ".enable-review-checkbox" using jQuery
    And I wait until element ".enable-review-checkbox" is not checked
    Given I create a student named "Harry"
    And I join the section
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the review tab
    When I press ".peer-dropdown-button" using jQuery
    And I wait until element ".code-review-no-peers" is visible

  Scenario: The author can see teacher comments
    When I sign in as "Dumbledore"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load student number 1's project from the blue teacher panel
    And I wait to see ".code-review-comment-input"
    And I write a code review comment with text "Teacher's comment"
    When I sign in as "Hermione"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the review tab
    Then element ".code-review-comment-body" has text "Teacher's comment"

  Scenario: The other student cannot see teacher comments
    When I sign in as "Dumbledore"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load student number 1's project from the blue teacher panel
    And I wait to see ".code-review-comment-input"
    And I write a code review comment with text "Teacher's comment"
    Given I create a student named "Harry"
    And I join the section
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the peer project for peer number 1 in the list
    Then element ".code-review-comment-body" is not visible

  Scenario: The student can reveal a completed comment
    When I write a code review comment with text "Hermione's comment"
    And I mark the review comment complete
    And I press ".comment-right-header button" using jQuery
    And I wait to see ".comment-menu-item"
    And element ".comment-menu-item:first-child" has text "Show"
    And I click selector ".comment-menu-item:first-child"
    Then I see ".code-review-comment-body"

  Scenario: The other student can reveal a completed comment
    When I write a code review comment with text "Hermione's comment"
    And I mark the review comment complete
    Given I create a student named "Harry"
    And I join the section
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the peer project for peer number 1 in the list
    And element ".code-review-comment-body" is not visible
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
    And I load student number 1's project from the blue teacher panel
    And I wait to see ".code-review-comment-input"
    And I write a code review comment with text "Teacher's comment"
    Then I mark the review comment complete

  Scenario: Other student does not have comment menu if comment is not complete
    Given I create a student named "Harry"
    And I join the section
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the review tab
    And I load the peer project for peer number 1 in the list
    And I write a code review comment with text "Harry's comment"
    Then element ".comment-right-header button" is not visible

  Scenario: Teacher can delete comments
    When I write a code review comment with text "Hermione's comment"
    When I sign in as "Dumbledore"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load student number 1's project from the blue teacher panel
    And I wait to see ".code-review-comment-input"
    And I press ".comment-right-header button" using jQuery
    And I wait to see ".comment-menu-item"
    And element ".comment-menu-item:nth-child(2)" has text "Delete"
    And I click selector ".comment-menu-item:nth-child(2)"
    Then I wait until element ".code-review-comment-body" is not visible

  Scenario: Student cannot toggle another students review state
    Given I create a student named "Harry"
    And I join the section
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the review tab
    And I load the peer project for peer number 1 in the list
    Then element ".enable-review-checkbox" is not visible
