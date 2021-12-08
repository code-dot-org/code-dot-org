@eyes
@no_mobile
@no_ie
Feature: Code Review Eyes

  @no_circle
  Scenario:
    When I open my eyes to test "Javalab Code Review"
    Given I create a teacher named "Dumbledore"
    And I create a new section
    Given I create a student named "Hermione"
    And I join the section
    And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/2?noautoplay=true"
    And I load the review tab
    Then I see no difference for "initial review tab state" using stitch mode "none"
    When I enable code review
    And I write a code review comment with text "Hermione's comment"
    Then I see no difference for "review tab with comment" using stitch mode "none"
    When I mark the review comment complete
    Then I see no difference for "resolved comment state" using stitch mode "none"
    And I close my eyes
