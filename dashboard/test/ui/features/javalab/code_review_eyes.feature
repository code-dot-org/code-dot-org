@eyes
@no_mobile
@no_ie
Feature: Code Review Eyes

  @no_circle
  Scenario:
    When I open my eyes to test "Javalab Code Review"
    # Create a section
    Given I create a levelbuilder named "Dumbledore"
    And I sign in as "Dumbledore" and go home
    And I create a new section named "CSA Section" assigned to "CSA Pilot"
    And I save the section url
    And I save the section id from row 0 of the section table
    Given I create a student named "Hermione"
    And I join the section
    # Create a code review group with a student in it.
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
    Then I see no difference for "initial review tab state" using stitch mode "none"
    When I enable code review
    And I write a code review comment with text "Hermione's comment"
    Then I see no difference for "review tab with comment" using stitch mode "none"
    When I mark the review comment complete
    Then I see no difference for "resolved comment state" using stitch mode "none"
    And I close my eyes
