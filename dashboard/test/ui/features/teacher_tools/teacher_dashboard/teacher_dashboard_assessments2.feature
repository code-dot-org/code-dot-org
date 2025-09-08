@no_mobile
Feature: Using the assessments tab in the teacher dashboard

  Scenario: Assessments tab survey submissions
    Given I create an authorized teacher-associated student named "Sally"
    # Create all students first so that we can unlock the assessment for all of them at once
    And I create a student named "Student2"
    And I join the section
    And I create a student named "Student3"
    And I join the section
    And I create a student named "Student4"
    And I join the section
    And I create a student named "Student5"
    And I join the section

    When I sign in as "Teacher_Sally" and go home
    And I am on "http://studio.code.org/courses/csp-2024/units/11"
    And I wait until element "span:contains(Course Survey)" is visible
    And I open the lesson lock dialog
    And I unlock the lesson for students
    And I wait until element ".modal-backdrop" is gone

    And I sign in as "Sally" and go home
    And I submit the assessment on "http://studio.code.org/courses/csp-2024/units/11/lockable/1/levels/1/page/5"
    
    And I sign in as "Student2" and go home
    And I submit the assessment on "http://studio.code.org/courses/csp-2024/units/11/lockable/1/levels/1/page/5"

    And I sign in as "Student3" and go home
    And I submit the assessment on "http://studio.code.org/courses/csp-2024/units/11/lockable/1/levels/1/page/5"

    And I sign in as "Student4" and go home
    And I submit the assessment on "http://studio.code.org/courses/csp-2024/units/11/lockable/1/levels/1/page/5"

    And I sign in as "Student5" and go home
    And I submit the assessment on "http://studio.code.org/courses/csp-2024/units/11/lockable/1/levels/1/page/5"

    # Assign a unit with an unlocked survey
    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    And I click selector "#section-options-dropdown-dropdown-button" once I see it
    And I click selector "#ui-test-Section-settings"
    And I press the first "input[name='grades[]']" element
    And I wait until element "button:contains(High School)" is visible
    And I click selector "button:contains(High School)"
    And I press the first "input[name='Computer Science Principles']" element
    And I wait until element "#assignment-version-year" is visible
    And I press "assignment-version-year"
    And I click selector ".assignment-version-title:contains('24-'25)" once I see it
    And I select the "CS Principles Post-Course Survey" option in dropdown "uitest-secondary-assignment"
    And I press the first "#uitest-save-section-changes" element to load a new page

    # Progress tab
    And I wait until element "#uitest-course-dropdown" contains text "CS Principles Post-Course Survey"

    # Assessments tab
    And I click selector "#ui-test-teacher-sidebar a:contains(Assessments)" once I see it
    And I wait until element "#uitest-course-dropdown" is visible
    Then I wait until element "h2:contains(Multiple choice questions overview)" is visible
