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
  And I wait to see ".uitest-reviewTab"
  Then I click selector ".uitest-reviewTab"

  @no_circle
  Scenario: Students can see each others comments
    # check the enable peer review checkbox
    And I wait to see ".enable-review-checkbox"
    When I press ".enable-review-checkbox" using jQuery
    And I wait until element ".enable-review-checkbox" is checked
    # add a comment
    And I press keys "Hermione's comment" for element ".code-review-comment-input"
    And element ".code-review-comment-input" contains text "Hermione's comment"
    Then I press "code-review-comment-submit"
    # log into other student
    When I sign in as "Harry"
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I wait to see ".uitest-reviewTab"
    # go to review tab
    Then I click selector ".uitest-reviewTab"
    And I wait to see ".enable-review-checkbox"
    # load other students project
    When I press ".peer-dropdown-button" using jQuery
    And I wait until the first ".peer-review-link" has text "Hermione"
    Then I click selector ".peer-review-link"
    And I wait to see ".uitest-reviewTab"
    # verify we can see Hermione's comment from Harry's view
    And I wait until element ".code-review-comment-body" is visible
    And element ".code-review-comment-body" has text "Hermione's comment"


