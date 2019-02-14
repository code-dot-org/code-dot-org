@no_mobile
@dashboard_db_access
@pegasus_db_access
Feature: Using the assessments tab in the teacher dashboard

  Scenario: Assessments tab survey submissions
    Given I create an authorized teacher-associated student named "Sally"
    And I give user "Teacher_Sally" hidden script access
    And I submit the assessment on "http://studio.code.org/s/csp-post-survey/stage/1/puzzle/1/page/6"
    And I sign out

    And I create a student named "Student2"
    And I navigate to the section url
    And I submit the assessment on "http://studio.code.org/s/csp-post-survey/stage/1/puzzle/1/page/6"
    And I sign out

    And I create a student named "Student3"
    And I navigate to the section url
    And I submit the assessment on "http://studio.code.org/s/csp-post-survey/stage/1/puzzle/1/page/6"
    And I sign out

    And I create a student named "Student4"
    And I navigate to the section url
    And I submit the assessment on "http://studio.code.org/s/csp-post-survey/stage/1/puzzle/1/page/6"
    And I sign out

    And I create a student named "Student5"
    And I navigate to the section url
    And I submit the assessment on "http://studio.code.org/s/csp-post-survey/stage/1/puzzle/1/page/6"
    And I sign out

    # Assign a script with an unlocked survey
    When I sign in as "Teacher_Sally"
    And I am on "http://studio.code.org/home"
    And I click selector ".ui-test-section-dropdown" once I see it
    And I click selector ".edit-section-details-link"
    And I wait until element "#uitest-assignment-family" is visible
    And I select the "Computer Science Principles" option in dropdown "uitest-assignment-family"
    And I wait until element "#assignment-version-year" is visible
    And I press "assignment-version-year"
    And I click selector ".assignment-version-title:contains('17-'18)" once I see it
    And I select the "CSP Student Post-Course Survey ('17-'18)" option in dropdown "uitest-secondary-assignment"
    And I press the first ".uitest-saveButton" element
    And I wait until element ".modal-backdrop" is gone

    # Progress tab
    When I click selector "a:contains('Untitled Section')" once I see it
    And I wait until element "#uitest-course-dropdown" contains text "CSP Student Post-Course Survey ('17-'18)"

    # Assessments tab
    When I click selector "#learn-tabs a:contains('Assessments/Surveys')" once I see it
    And I wait until element "#uitest-course-dropdown" is visible
    Then I wait until element "h2:contains(Multiple choice questions overview)" is visible
