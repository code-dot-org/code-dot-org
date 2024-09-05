Feature: BubbleChoice
  Scenario: Viewing BubbleChoice progress
    Given I create a teacher-associated student named "Alice"

    # Go to BubbleChoice sublevel
    Given I am on "http://studio.code.org/s/allthethings/lessons/40/levels/1/sublevel/1"

    # Complete the level
    And I wait until element ".submitButton" is visible
    And I click selector ".submitButton" to load a new page

    # Make sure you are taken back to the BubbleChoice activity page with progress
    And I wait until current URL contains "/lessons/40/levels/1"
    And I wait for jquery to load
    And I wait until element ".uitest-bubble-choice:eq(0)" is visible
    And element ".uitest-bubble-choice:eq(0) .progress-bubble:first" is visible
    And check that the url contains "/s/allthethings/lessons/40/levels/1"
    Then I verify progress for the sublevel with selector ".uitest-bubble-choice:eq(0) .progress-bubble" is "perfect"

    And I sign out

    # View student's BubbleChoice progress as a teacher
    When I sign in as "Teacher_Alice"

    # View progress from script overview page
    Given I am on "http://studio.code.org/s/allthethings"
    And I wait until element ".teacher-panel" is visible
    When I click selector ".teacher-panel table td:contains(Alice)" once I see it
    And I wait until current URL contains "user_id="
    And I wait until element "td:contains(Lesson Name)" is visible
    And I wait until element "td:contains(Bubble Choice)" is visible
    Then I verify progress for lesson 42 level 1 is "perfect"

    # View progress from BubbleChoice activity page
    Given I am on "http://studio.code.org/s/allthethings/lessons/40/levels/1"
    And I wait until element ".teacher-panel" is visible
    # Teacher has not completed level, so make sure it is not shown as complete
    Then I verify progress for the sublevel with selector ".uitest-bubble-choice:eq(0) .progress-bubble:first" is "not_tried"
    When I click selector ".teacher-panel table td:contains(Alice)" once I see it to load a new page
    And I wait for 4 seconds
    Then I verify progress for the sublevel with selector ".uitest-bubble-choice:eq(0) .progress-bubble:first" is "perfect"

  Scenario: Lab2 BubbleChoice progress
    Given I create a teacher-associated student named "Alice"

    # Go to Lab2 BubbleChoice sublevel
    Given I am on "http://studio.code.org/s/allthethings/lessons/52/levels/8/sublevel/1"

    # Dismiss the dialog
    And I click selector "#ui-close-dialog" once I see it
    And I wait until element "#ui-close-dialog" is not visible

    # Complete the level
    And I click selector "#instructions-continue-button" to load a new page

    # Make sure you are taken back to the Lab2 BubbleChoice activity page with progress
    And I wait until current URL contains "/lessons/52/levels/8"
    And I wait for jquery to load
    And I wait until element ".uitest-bubble-choice:eq(0)" is visible
    And element ".uitest-bubble-choice:eq(0) .progress-bubble:first" is visible
    And check that the url contains "/s/allthethings/lessons/52/levels/8"
    Then I verify progress for the sublevel with selector ".uitest-bubble-choice:eq(0) .progress-bubble" is "perfect"

    And I sign out

    # View student's Lab2 BubbleChoice progress as a teacher
    When I sign in as "Teacher_Alice"

    # View progress from script overview page
    Given I am on "http://studio.code.org/s/allthethings"
    And I wait until element ".teacher-panel" is visible
    When I click selector ".teacher-panel table td:contains(Alice)" once I see it
    And I wait until current URL contains "user_id="
    And I wait until element "td:contains(Lesson Name)" is visible
    And I wait until element "td:contains(Lab2 Showcase)" is visible
    Then I verify progress for lesson 55 level 8 is "perfect"

    # View progress from BubbleChoice activity page
    Given I am on "http://studio.code.org/s/allthethings/lessons/52/levels/8"
    And I wait until element ".teacher-panel" is visible
    # Teacher has not completed level, so make sure it is not shown as complete
    Then I verify progress for the sublevel with selector ".uitest-bubble-choice:eq(0) .progress-bubble:first" is "not_tried"
    When I click selector ".teacher-panel table td:contains(Alice)" once I see it to load a new page
    And I wait for 4 seconds
    Then I verify progress for the sublevel with selector ".uitest-bubble-choice:eq(0) .progress-bubble:first" is "perfect"

    # View progress from BubbleChoice sublevel activity page
    Given I am on "http://studio.code.org/s/allthethings/lessons/52/levels/8/sublevel/1"

    # Dismiss the dialog
    And I click selector "#ui-close-dialog" once I see it
    And I wait until element "#ui-close-dialog" is not visible

    # Teacher has not completed level, so make sure it is not shown as complete
    Then I verify progress for the sublevel with selector ".teacher-panel .progress-bubble:first" is "not_tried"
    When I click selector ".teacher-panel table td:contains(Alice)" once I see it
    And I wait until element "#lab2-aichat" is visible
    Then I verify progress for the sublevel with selector ".teacher-panel .progress-bubble:first" is "perfect"

  Scenario: Navigating between a Lab2 sublevel and another Lab2 level
    Given I create a teacher-associated student named "Alice"

    # Go to Lab2 BubbleChoice sublevel
    Given I am on "http://studio.code.org/s/allthethings/lessons/52/levels/8/sublevel/1"

    # Dismiss the dialog
    And I click selector "#ui-close-dialog" once I see it
    And I wait until element "#ui-close-dialog" is not visible

    # Go to another Lab2 level (panels)
    And I click selector ".progress-bubble:nth(5)"
    And I wait until element "#lab2-panels" is visible
    And check that the url contains "/s/allthethings/lessons/52/levels/6"

    # Go back to the Lab2 BubbleChoice sublevel
    And I go back
    And I wait until element "#lab2-aichat" is visible
    And check that the url contains "/s/allthethings/lessons/52/levels/8/sublevel/1"

