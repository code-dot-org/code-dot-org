@no_mobile
@eyes
Feature: Student Snapshot page - Eyes

  Scenario: All widgets render with real progress and saved Python Lab code
    Given I create an authorized teacher-associated student named "PySnapshotStudent"
    And I am assigned to course "ui-test-student-labs" unit 1 with teacher "Teacher_PySnapshotStudent"

    Given I am on "http://studio.code.org/courses/ui-test-student-labs/units/1/lessons/50/levels/1?hideProductTours=true"
    And I wait to see "#uitest-codebridge-run"
    And I wait until "#uitest-codebridge-run" is not disabled
    And I focus selector ".cm-content"
    And I press keys "print('more code')\n"
    And I wait for 1 second
    And I press "uitest-codebridge-run"
    And I wait until "#uitest-codebridge-console" contains text "more code"
    And I press "instructions-continue-button"
    And I wait until current URL contains "http://studio.code.org/courses/ui-test-student-labs/units/1/lessons/50/levels/2"

    Given I am on "http://studio.code.org/courses/ui-test-student-labs/units/1/lessons/50/levels/14?hideProductTours=true"
    And I wait to see "#uitest-codebridge-run"
    And I wait until "#uitest-codebridge-run" is not disabled
    And I focus selector ".cm-content"
    And I press keys "print('student snapshot test code')\n"
    And I wait for 1 second
    And I press "uitest-codebridge-run"
    And I wait until "#uitest-codebridge-console" contains text "student snapshot test code"
    Then I sign out

    When I sign in as "Teacher_PySnapshotStudent" and go home
    And I get levelbuilder access
    And I click selector "#task-button-View-progress-New-Section" once I see it
    Then I wait until element "#ui-test-teacher-sidebar" is visible

    Given I click selector "#ui-test-teacher-sidebar a:contains('Student Snapshot')" once I see it
    And I wait until element "#unit-selector-v2" is visible
    And I wait until element "#ui-test-lessons-in-assigned-unit-dropdown" is visible
    And I wait until element "select[name='student']" is visible
    And I select the "Lesson 50 — Python Lab" option in dropdown "ui-test-lessons-in-assigned-unit-dropdown"
    And I select the "PySnapshotStudent" option in dropdown named "student"

    When I open my eyes to test "student snapshot"
    And I wait until element "#uitest-spinner" is not visible
    And I wait until element "div:contains('Loading rubric...')" is not visible

    # Always-present widgets (StudentSnapshot.tsx's widgetGrid).
    Then I wait until element "span:contains('Lesson Details')" is visible
    And I wait until element "span:contains('Lesson Insight')" is visible
    And I wait until element "span:contains('Lesson Feedback')" is visible

    # Lesson-conditional widgets: absence isn't a failure, only mounted-but-hidden is.
    And element "span:contains('Check For Understanding Questions')" is visible if present
    And element "span:contains('Rubric')" is visible if present
    And element "span:contains('Exemplar Code')" is visible if present

    And I wait until element "span:contains('Student Code')" is visible
    And element "div:contains('No student response')" is not visible
    And element ".codemirror-container" is visible

    And I see no difference for "student snapshot"
    And I close my eyes
