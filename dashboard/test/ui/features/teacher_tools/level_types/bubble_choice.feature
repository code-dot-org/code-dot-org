Feature: BubbleChoice
  @no_mobile
  @properties_encryption_key
  Scenario: Viewing BubbleChoice progress
    Given I create a teacher-associated student named "Alice"
    Given I am assigned to course "allthethingscourse" unit 1 with teacher "Teacher_Alice"

    # Go to BubbleChoice sublevel
    Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/40/levels/1/sublevel/1"

    # Complete the level
    And I wait until element ".submitButton" is visible
    And I debug milestone callback
    And I click selector ".submitButton" to load a new page

    # Make sure you are taken back to the BubbleChoice activity page with progress
    And I wait until current URL contains "/lessons/40/levels/1"
    And I wait for jquery to load
    And I wait until element ".uitest-bubble-choice:eq(0)" is visible
    And element ".uitest-bubble-choice:eq(0) .progress-bubble:first" is visible
    And check that the url contains "/courses/allthethingscourse/units/1/lessons/40/levels/1"
    Then I verify progress for the sublevel with selector ".uitest-bubble-choice:eq(0) .progress-bubble" is "perfect"

    And I sign out

    # View student's BubbleChoice progress as a teacher
    When I sign in as "Teacher_Alice"

    # View progress from script overview page
    Given I am on "http://studio.code.org/courses/allthethingscourse/units/1"
    And I wait until element "#uitest-view-as-student-selector" is visible
    Then I select the "Alice" option in dropdown "uitest-view-as-student-selector"
    And I wait until current URL contains "user_id="
    And I wait until element "td:contains(Lesson Name)" is visible
    And I wait until element "td:contains(Bubble Choice)" is visible
    Then I verify progress for lesson 42 level 1 is "perfect"

    # View progress from BubbleChoice activity page
    Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/40/levels/1"
    And I wait until element ".teacher-panel" is visible
    # Teacher has not completed level, so make sure it is not shown as complete
    And I wait for jquery to load
    Then I verify progress for the sublevel with selector ".uitest-bubble-choice:eq(0) .progress-bubble:first" is "not_tried"
    Then I select the "New Section" option in dropdown with class "uitest-sectionselect"
    And I wait for 5 seconds
    Then I wait until element "a:contains(View Teacher Dashboard)" is visible
    And element ".teacher-panel td:eq(1)" contains text "Alice"
    And I click selector ".teacher-panel td:eq(1)" to load a new page
    Then I verify progress for the sublevel with selector ".uitest-bubble-choice:eq(0) .progress-bubble:first" is "perfect"

  # Mobile re-enable ticket: https://codedotorg.atlassian.net/browse/TEACH-1752
  @no_mobile
  @no_firefox
  @no_safari
  @properties_encryption_key
  Scenario: Lab2 BubbleChoice progress
    Given I create a teacher-associated student named "Alice"
    Given I am assigned to course "allthethingscourse" unit 1 with teacher "Teacher_Alice"

    # Go to Lab2 BubbleChoice sublevel
    Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/52/levels/8/sublevel/1"

    # Dismiss the dialog
    And I click selector "#ui-close-dialog" once I see it
    And I wait until element "#ui-close-dialog" is not visible

    # Complete the level
    And I click selector "#instructions-continue-button"

    # Make sure you are taken back to the Lab2 BubbleChoice activity page with progress
    And I wait until current URL contains "/lessons/52/levels/8"
    And I wait until element ".uitest-bubble-choice:eq(0)" is visible
    And element ".uitest-bubble-choice:eq(0) .progress-bubble:first" is visible
    And check that the url contains "/courses/allthethingscourse/units/1/lessons/52/levels/8"
    Then I verify progress for the sublevel with selector ".uitest-bubble-choice:eq(0) .progress-bubble" is "perfect"

    And I sign out

    # View student's Lab2 BubbleChoice progress as a teacher
    When I sign in as "Teacher_Alice"

    # View progress from script overview page
    Given I am on "http://studio.code.org/courses/allthethingscourse/units/1"
    And I wait until element "#uitest-view-as-student-selector" is visible
    Then I select the "Alice" option in dropdown "uitest-view-as-student-selector"
    And I wait until current URL contains "user_id="
    And I wait until element "td:contains(Lesson Name)" is visible
    And I wait until element "td:contains(Lab2 Showcase)" is visible
    Then I verify progress for lesson 55 level 8 is "perfect"

    # View progress from BubbleChoice activity page
    Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/52/levels/8"
    And I wait until element ".teacher-panel" is visible
    And I wait for jquery to load
    And I select the "New Section" option in dropdown with class "uitest-sectionselect"
    # Teacher has not completed level, so make sure it is not shown as complete
    Then I verify progress for the sublevel with selector ".uitest-bubble-choice:eq(0) .progress-bubble:first" is "not_tried"
    When I click selector ".teacher-panel table td:contains(Alice)" once I see it
    Then I verify progress for the sublevel with selector ".uitest-bubble-choice:eq(0) .progress-bubble:first" is "perfect"

    # View progress from BubbleChoice sublevel activity page
    Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/52/levels/8/sublevel/1"

    # Dismiss the dialog
    And I click selector "#ui-close-dialog" once I see it
    And I wait until element "#ui-close-dialog" is not visible

    # Teacher has not completed level, so make sure it is not shown as complete
    And I wait until element ".teacher-panel" is visible
    Then I select the "New Section" option in dropdown with class "uitest-sectionselect"
    Then I verify progress for the sublevel with selector ".teacher-panel .progress-bubble:first" is "not_tried"
    When I click selector ".teacher-panel table td:contains(Alice)" once I see it
    And I wait until element "#lab2-aichat" is visible
    Then I verify progress for the sublevel with selector ".teacher-panel .progress-bubble:first" is "perfect"

  Scenario: Navigating between a Lab2 sublevel and another Lab2 level
    Given I create a teacher-associated student named "Alice"

    # Go to Lab2 BubbleChoice sublevel
    Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/52/levels/8/sublevel/1"

    # Dismiss the dialog
    And I click selector "#ui-close-dialog" once I see it
    And I wait until element "#ui-close-dialog" is not visible

    # Go to another Lab2 level (panels)
    And I click selector ".progress-bubble:eq(5)"
    And I wait until element "#lab2-panels" is visible
    And check that the url contains "/courses/allthethingscourse/units/1/lessons/52/levels/6"

    # Go back to the Lab2 BubbleChoice sublevel
    And I go back
    And I wait until element "#lab2-aichat" is visible
    And check that the url contains "/courses/allthethingscourse/units/1/lessons/52/levels/8/sublevel/1"
