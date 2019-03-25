@no_mobile
@dashboard_db_access
@pegasus_db_access
Feature: Using the assessments tab in the teacher dashboard to get feedback for script

  Scenario: Assessments tab feedback download
    Given I create an authorized teacher-associated student named "Sally"
    And I sign out

    # Assign a script with feedback
    When I sign in as "Teacher_Sally"
    And I am on "http://studio.code.org/home"
    And I click selector ".ui-test-section-dropdown" once I see it
    And I click selector ".edit-section-details-link"
    And I wait until element "#uitest-assignment-family" is visible
    And I select the "Computer Science Discoveries" option in dropdown "uitest-assignment-family"
    And I wait until element "#assignment-version-year" is visible
    And I press "assignment-version-year"
    And I click selector ".assignment-version-title:contains('18-'19)" once I see it
    And I select the "CSD Unit 3 - Animations and Games ('18-'19)" option in dropdown "uitest-secondary-assignment"
    And I press the first ".uitest-saveButton" element
    And I wait until element ".modal-backdrop" is gone

    # Assessments tab
    And I wait until element "a:contains('Untitled Section')" is visible
    And I save the section id from row 0 of the section table
    Then I navigate to teacher dashboard for the section I saved
    And I wait until element "#uitest-teacher-dashboard-nav a:contains(Assessments/Surveys)" is visible
    # Old teacher dashboard
    And I click selector "#learn-tabs a:contains(Assessments/Surveys)" once I see it
    # New teacher dashboard. TODO: (madelynkasula) re-enable once all users are on new teacher dashboard
    And I click selector "#uitest-teacher-dashboard-nav a:contains(Assessments/Surveys)" once I see it
    And I wait until element "#uitest-course-dropdown" is visible
    Then I wait until element "#uitest-course-dropdown:contains(All feedback)" is visible

   # Assign a script without feedback
    When I sign in as "Teacher_Sally"
    And I am on "http://studio.code.org/home"
    And I click selector ".ui-test-section-dropdown" once I see it
    And I click selector ".edit-section-details-link"
    And I wait until element "#uitest-assignment-family" is visible
    And I select the "Express Course (2018)" option in dropdown "uitest-assignment-family"
    And I press the first ".uitest-saveButton" element
    And I wait until element ".modal-backdrop" is gone

    # Assessments tab
    And I wait until element "a:contains('Untitled Section')" is visible
    And I save the section id from row 0 of the section table
    Then I navigate to teacher dashboard for the section I saved
    And I wait until element "#uitest-teacher-dashboard-nav a:contains(Assessments/Surveys)" is visible
    # Old teacher dashboard
    And I click selector "#learn-tabs a:contains(Assessments/Surveys)" once I see it
    # New teacher dashboard. TODO: (madelynkasula) re-enable once all users are on new teacher dashboard
    #And I click selector "#uitest-teacher-dashboard-nav a:contains(Assessments/Surveys)" once I see it
    And I wait until element "#uitest-course-dropdown" is visible
    Then I wait until element "#uitest-course-dropdown:contains(All feedback)" is not visible
