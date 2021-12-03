# @eyes
Feature: Code review

Background:
  Given I create a teacher named "Dumbledore"
  And I create a new section
  Given I create a student named "Harry"
  And I join the section
  Given I create a student named "Hermione"
  And I join the section
  And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
  # click on review tab
  And I load the review tab
  And I enable peer review

#  Scenario: Students can see each others comments
#    # add a comment as Hermione
#    When I write a peer review comment with text "Hermione's comment"
#    # log into Harry's account
#    When I sign in as "Harry"
#    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
#    And I load the review tab
#    # load Hermione's project
#    When I press ".peer-dropdown-button" using jQuery
#    And I wait until the first ".peer-review-link" has text "Hermione"
#    Then I click selector ".peer-review-link"
#    And I wait to see ".uitest-reviewTab"
#    # verify we can see Hermione's comment from Harry's view
#    And I wait until element ".code-review-comment-body" is visible
#    And element ".code-review-comment-body" has text "Hermione's comment"
#
#  Scenario: Students who do not have code review enabled don't show up in peer dropdown
#    # un-check the enable review checkbox
#    And I press ".enable-review-checkbox" using jQuery
#    And I wait until element ".enable-review-checkbox" is not checked
#    # log into Harry's account
#    When I sign in as "Harry"
#    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
#    And I wait to see ".uitest-reviewTab"
#    # go to review tab
#    Then I click selector ".uitest-reviewTab"
#    And I wait to see ".enable-review-checkbox"
#    When I press ".peer-dropdown-button" using jQuery
#    And I wait until element ".peer-review-no-reviews" is visible
#
#  Scenario: The author can see teacher comments
#    # Sign in as teacher, go to Hermione's page and leave a comment
#    When I sign in as "Dumbledore"
#    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
#    And I wait to see ".show-handle"
#    And I click selector ".show-handle .fa-chevron-left"
#    And I wait until element ".student-table" is visible
#    And I click selector "#teacher-panel-container tr:nth(2)" to load a new page
#    And I wait to see ".code-review-comment-input"
#    And I write a peer review comment with text "Teacher's comment"
#    # Sign in as Harry and view comment
#    When I sign in as "Hermione"
#    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
#    And I load the review tab
#    Then element ".code-review-comment-body" has text "Teacher's comment"
#
#  Scenario: The other student cannot see teacher comments
#    # Sign in as teacher, go to Hermione's page and leave a comment
#    When I sign in as "Dumbledore"
#    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
#    And I wait to see ".show-handle"
#    And I click selector ".show-handle .fa-chevron-left"
#    And I wait until element ".student-table" is visible
#    And I click selector "#teacher-panel-container tr:nth(2)" to load a new page
#    And I wait to see ".code-review-comment-input"
#    And I write a peer review comment with text "Teacher's comment"
#    # Sign in as Harry, verify we cannot see the teacher comment
#    When I sign in as "Harry"
#    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
#    And I load the review tab
#    # load Hermione's project
#    When I press ".peer-dropdown-button" using jQuery
#    And I wait until the first ".peer-review-link" has text "Hermione"
#    And I click selector ".peer-review-link"
#    And I wait to see ".uitest-reviewTab"
#    And I load the review tab
#    Then element ".code-review-comment-body" is not visible
#
#  Scenario: The student can reveal a completed comment
#    When I write a peer review comment with text "Hermione's comment"
#    And I mark the review comment complete
#    And I press ".comment-right-header button" using jQuery
#    And I wait to see ".comment-menu-item"
#    And element ".comment-menu-item:first-child" has text "Show"
#    And I click selector ".comment-menu-item:first-child"
#    Then I see ".code-review-comment-body"

  Scenario: The other student can reveal a completed comment
    When I write a peer review comment with text "Hermione's comment"
    And I mark the review comment complete
    And I sign in as "Harry"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    # And I load the peer project for peer named "Hermione"
    And I load the review tab
    When I press ".peer-dropdown-button" using jQuery
    And I wait to see ".peer-review-link:contains(Hermione)"
    And I click selector ".peer-review-link:contains(Hermione)" to load a new page
    And I wait to see ".uitest-reviewTab"
    And element ".code-review-comment-body" is not visible
    And I wait to see ".comment-menu-item"
    And element ".comment-menu-item:first-child" has text "Show"
    And I click selector ".comment-menu-item:first-child"
    Then I see ".code-review-comment-body"

  # Scenario: Teacher can reveal a completed comment
#
#  Scenario: Author can mark comment complete
#

  @skip
  # this scenario doesn't currently work because of a bug.
  # remove skip once we fix this bug: https://codedotorg.atlassian.net/browse/CSA-1068
  Scenario: The teacher can mark a comment complete
    When I sign in as "Dumbledore"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I wait to see ".show-handle"
    And I click selector ".show-handle .fa-chevron-left"
    And I wait until element ".student-table" is visible
    And I click selector "#teacher-panel-container tr:nth(2)" to load a new page
    And I wait to see ".code-review-comment-input"
    And I write a peer review comment with text "Teacher's comment"
    And I mark the review comment complete
    And I press ".comment-right-header button" using jQuery
    And I wait to see ".comment-menu-item"
    And element ".comment-menu-item:first-child" has text "Show"
    And I click selector ".comment-menu-item:first-child"
    Then I see ".code-review-comment-body"
#
#  Scenario: Other student does not have comment menu
#
#  Scenario: Teacher can delete comments
#
#  Scenario: Student cannot delete comments
#
#  Scenario: Student cannot toggle another students review state


