Feature: CourseOverview
  Scenario: Viewing course overview signed out
    Given I am on "http://studio.code.org/courses/csp-2025"
    And I wait to see ".uitest-CourseScript"

  Scenario: Viewing course overview as a student not in a section
    Given I am a student
    And I am on "http://studio.code.org/courses/csp-2025"
    And I wait to see ".uitest-CourseScript"

  Scenario: Viewing course overview as a teacher with no sections
    Given I am a teacher
    And I am on "http://studio.code.org/courses/csp-2025"
    And I wait to see ".uitest-CourseScript"

  Scenario: Viewing course overview as a student in a section
    Given I create an authorized teacher-associated student named "Ron"
    Then I sign in as "Teacher_Ron" and go home
    And I click selector ".ui-test-section-dropdown" once I see it
    And I click selector ".edit-section-details-link"
    And I press the first "input[name='grades[]']" element
    And I wait until element "button:contains(High School)" is visible
    And I click selector "button:contains(High School)"
    And I press the first "input[name='Computer Science Principles']" element
    And I wait until element "#assignment-version-year" is visible
    And I press "assignment-version-year"
    And I click selector ".assignment-version-title:contains('25-'26)" once I see it
    And I select the "Digital Information" option in dropdown "uitest-secondary-assignment"
    And I press the first "#uitest-save-section-changes" element to load a new page

    Then I sign in as "Ron"
    And I am on "http://studio.code.org/courses/csp-2025"
    And I wait to see ".uitest-CourseScript"

    # Viewing course overview as a teacher with sections is covered in teacher_homepage.feature

  Scenario: Viewing course overview for a single-unit course
    # original course
    Given I am on "http://studio.code.org/courses/ui-test-single-unit-course-2026"
    And I get redirected to "/courses/ui-test-single-unit-course-2026/units/1" via "dashboard"

    # modular course
    Given I am on "http://studio.code.org/courses/ui-test-versioned-script-2019"
    And I get redirected to "/courses/ui-test-versioned-script-2019/units/1" via "dashboard"
