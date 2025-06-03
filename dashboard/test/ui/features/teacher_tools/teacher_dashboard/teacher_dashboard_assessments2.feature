@no_mobile

Feature: Using the assessments tab in the teacher dashboard

  Scenario: Assessments tab survey submissions
    Given I create an authorized teacher-associated student named "Sally"
    And I submit the assessment on "http://studio.code.org/courses/csp-2017/units/9/lessons/1/levels/1/page/6"

    And I create a student named "Student2"
    And I join the section
    And I submit the assessment on "http://studio.code.org/courses/csp-2017/units/9/lessons/1/levels/1/page/6"

    And I create a student named "Student3"
    And I join the section
    And I submit the assessment on "http://studio.code.org/courses/csp-2017/units/9/lessons/1/levels/1/page/6"

    And I create a student named "Student4"
    And I join the section
    And I submit the assessment on "http://studio.code.org/courses/csp-2017/units/9/lessons/1/levels/1/page/6"

    And I create a student named "Student5"
    And I join the section
    And I submit the assessment on "http://studio.code.org/courses/csp-2017/units/9/lessons/1/levels/1/page/6"

    # Assign a unit with an unlocked survey
    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    And I click selector ".ui-test-section-dropdown" once I see it
    And I click selector ".edit-section-details-link"
    And I press the first "input[name='grades[]']" element
    And I wait until element "button:contains(High School)" is visible
    And I click selector "button:contains(High School)"
    And I press the first "input[name='Computer Science Principles']" element
    And I wait until element "#assignment-version-year" is visible
    And I press "assignment-version-year"
    And I click selector ".assignment-version-title:contains('17-'18)" once I see it
    And I select the "CSP Student Post-Course Survey ('17-'18)" option in dropdown "uitest-secondary-assignment"
    And I press the first "#uitest-save-section-changes" element to load a new page

    # Progress tab
    And I wait until element "#uitest-course-dropdown" contains text "CSP Student Post-Course Survey ('17-'18)"

    # Assessments tab
    And I click selector "#ui-test-teacher-sidebar a:contains(Assessments)" once I see it
    And I wait until element "#uitest-course-dropdown" is visible
    Then I wait until element "h2:contains(Multiple choice questions overview)" is visible
