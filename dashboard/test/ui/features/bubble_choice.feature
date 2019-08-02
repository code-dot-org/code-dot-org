Feature: BubbleChoice
  Scenario: Viewing BubbleChoice progress
    Given I create a teacher-associated student named "Alice"

    # Go to BubbleChoice sublevel
    Given I am on "http://studio.code.org/s/allthethings/stage/40/puzzle/1/sublevel/1"

    # Complete the level
    And I wait until element ".submitButton" is visible
    And I click selector ".submitButton"

    # Make sure you are taken back to the BubbleChoice activity page with progress
    And I wait until element ".uitest-bubble-choice:eq(0)" is visible
    And check that the url contains "/s/allthethings/stage/40/puzzle/1"
    And element ".uitest-bubble-choice:eq(0) i.fa-check" is visible

    And I sign out

    # View student's BubbleChoice progress as a teacher
    When I sign in as "Teacher_Alice"

    # View progress from script overview page
    Given I am on "http://studio.code.org/s/allthethings"
    And I wait until element ".teacher-panel" is visible
    When I click selector ".teacher-panel table td:contains(Alice)" once I see it
    And I wait until element "td:contains(Bubble Choice)" is visible
    And I wait for 2 seconds
    Then I verify progress for stage 40 level 1 is "perfect"

    # View progress from BubbleChoice activity page
    Given I am on "http://studio.code.org/s/allthethings/stage/40/puzzle/1"
    And I wait until element ".teacher-panel" is visible
    # Teacher has not completed level, so make sure it is not shown as complete
    And element ".uitest-bubble-choice:eq(0) i.fa-check" is not visible
    When I click selector ".teacher-panel table td:contains(Alice)" once I see it
    And I wait until element ".uitest-bubble-choice:eq(0)" is visible
    And I wait for 2 seconds
    And element ".uitest-bubble-choice:eq(0) i.fa-check" is visible
