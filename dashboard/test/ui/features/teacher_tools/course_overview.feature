Feature: CourseOverview
  Scenario: Viewing course overview signed out
    Given I am on "http://studio.code.org/courses/csp-2019"
    And I wait to see ".uitest-CourseScript"

  Scenario: Viewing course overview as a student not in a section
    Given I am a student
    And I am on "http://studio.code.org/courses/csp-2019"
    And I wait to see ".uitest-CourseScript"

  Scenario: Viewing course overview as a teacher with no sections
    Given I am a teacher
    And I am on "http://studio.code.org/courses/csp-2019"
    And I wait to see ".uitest-CourseScript"

  Scenario: Viewing course overview as a student in a section
    Given I create an authorized teacher-associated student named "Ron"
    Then I sign in as "Teacher_Ron" and go home
    And I click selector ".ui-test-section-dropdown" once I see it
    And I click selector ".edit-section-details-link"
    And I wait until element "#uitest-assignment-family" is visible
    And I select the "Computer Science Principles" option in dropdown "uitest-assignment-family"
    And I wait until element "#assignment-version-year" is visible
    And I press "assignment-version-year"
    And I click selector ".assignment-version-title:contains('19-'20)" once I see it
    And I select the "CSP Unit 1 - The Internet ('19-'20)" option in dropdown "uitest-secondary-assignment"
    Then I sign in as "Ron"
    And I am on "http://studio.code.org/courses/csp-2019"
    And I wait to see ".uitest-CourseScript"

    # Viewing course overview as a teacher with sections is covered in teacher_homepage.feature
