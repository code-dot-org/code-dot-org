# Deprecated - remove after confirming coverage on new homepage: https://codedotorg.atlassian.net/browse/TEACH-2165
@skip
@as_teacher
@no_mobile
@no_firefox
@no_safari
Feature: Using the teacher homepage sections feature
  Scenario: See a section creation dialog when logging for the first time
    # After a teacher creates an account, they see the section create dialog
    Given I create a teacher who has never signed in named "Ariel" and go home
    And I wait until I am on "http://studio.code.org/home"
    And I wait to see a modal containing text "Let's get you started teaching with Code.org!"

    # Section Creation dialog is not displayed when reloaded
    Then I reload the page
    And element ".modal" is not visible

  Scenario: Do not see a section creation dialog when logging after first time
    # After a teacher creates an account and logins in multiple times,
      # they do not see the section create dialog
    Given I create a teacher named "Belle" and go home
    And I wait until I am on "http://studio.code.org/home"
    And element ".modal" is not visible

  Scenario: Loading the teacher homepage with new sections
    # Create my first section (via the SetUpSections component)
    When I create a new student section and go home
    Then the student section table should have 1 row

    And I wait until element "a:contains(Untitled Section)" is visible
    And the href of selector "a:contains(Untitled Section)" contains "/teacher_dashboard/sections/"

    # Create my second section (via the button in OwnedSections)
    When I create a new student section and go home
    Then the student section table should have 2 rows

  @properties_encryption_key
  Scenario: Assign hidden unit to section
    Given I am on "http://studio.code.org/home"
    And I create a new "High School" student section with course "Computer Science Principles", version "'25-'26" and unit "Digital Information"
    Then the student section table should have 1 rows
    And I save the section id from row 0 of the section table

    When I am on "http://studio.code.org/courses/csp-2025"
    And I wait until element ".uitest-CourseScript" is visible
    Then the teacher_dashboard url contains the section id

    # Hide a unit from the section
    When I hide unit "The Internet"
    And unit "The Internet" is marked as not visible

    # Verify hidden unit warning banner appears
    When I am on "http://studio.code.org/courses/csp-2025/units/2"
    And I wait until element "#script-title" is visible
    Then I wait until element ".announcement-notification:contains(unit is hidden)" is visible

    # Try to assign the unit
    Given I am on "http://studio.code.org/home"
    And I click selector ".ui-test-section-dropdown" once I see it
    And I click selector ".edit-section-details-link" once I see it
    And I wait until element "#uitest-secondary-assignment" is visible
    And I select the "The Internet" option in dropdown "uitest-secondary-assignment"
    And I press the first "#uitest-save-section-changes" element to load a new page
    And I wait until element "h1:contains(Progress)" is visible

    # TODO: TEACH-537 If we add in this confirmation dialogue later, uncomment this test
    # Then I wait to see a dialog containing text "unit is currently hidden"

    # Confirm the assignment
    # When I press "confirm-assign"
    # And I wait for the dialog to close

    # Verify the unit was unhidden
    When I am on "http://studio.code.org/courses/csp-2025"
    And I wait until element ".uitest-CourseScript" is visible
    Then unit "The Internet" is marked as visible

  @skip
  # TODO TEACH-538: Reenable with new section setup flow
  Scenario: Assign a Course assigns first Unit in Course by default
    Given I am on "http://studio.code.org/home"
    When I see the section set up box
    And I create a new "High School" student section with course "Computer Science Principles", version "'25-'26"
    Then the student section table should have 1 rows
    And the section table row at index 0 has secondary assignment path "/courses/csp-2025/units/1"

  Scenario: Assign a CSF course with multiple versions
    Given I am on "http://studio.code.org/home"
    When I see the section set up box
    And I create a new "Elementary School" student section with course "CS Fundamentals: Course A", version "2017"
    Then the student section table should have 1 rows

    Given I am on "http://studio.code.org/home"
    And I wait until element "#classroom-sections" is visible
    And the section table row at index 0 has primary assignment path "/courses/coursea-2017"

    When I click selector ".ui-test-section-dropdown"
    And I click selector ".edit-section-details-link"
    And I wait until element "#assignment-version-year" is visible
    And element "#assignment-version-year" contains text "2017"
    And I press "assignment-version-year"
    And I click selector ".assignment-version-title:contains(2019)" once I see it
    And I press the first "#uitest-save-section-changes" element to load a new page
    And I wait until element "h1:contains(Progress)" is visible
    Given I am on "http://studio.code.org/home"
    And I wait until element "#classroom-sections" is visible
    And I wait until element "#ui-test-section-list" is visible
    And the section table row at index 0 has primary assignment path "/courses/coursea-2019"

  Scenario: Navigate to course pages with course versions enabled
    Given I am on "http://studio.code.org/home"
    When I see the section set up box
    And I create a new "High School" student section with course "Computer Science Principles", version "'25-'26" and unit "Digital Information"
    Then the student section table should have 1 rows

    # save the older section id, from the last row of the table
    And I save the section id from row 0 of the section table

    And the teacher_dashboard href of selector ".uitest-owned-sections a:contains('Computer Science Principles')" contains the section id
    And the teacher_dashboard href of selector ".uitest-owned-sections a:contains('Digital Information')" contains the section id

    When I click selector ".uitest-owned-sections a:contains('Computer Science Principles')" to load a new page
    And I wait to see ".uitest-CourseScript"
    Then the teacher_dashboard url contains the section id
    And check that the URL contains "/courses/csp-2025"

    And element "#uitest-version-selector" is visible
    And I click selector "#assignment-version-year" once I see it
    And I wait until element ".assignment-version-title" is visible
    When I click selector ".assignment-version-title:contains('24-'25)" to load a new page
    And I wait to see ".uitest-CourseScript"

  Scenario: Loading the print certificates page for a section
    Given I create a teacher-associated student named "Sally"
    And I sign in as "Teacher_Sally" and go home
    And I click selector ".ui-test-section-dropdown" once I see it

    And I wait until element ".uitest-certs-link" is visible
    And I press the first ".uitest-certs-link" element to load a new page
    And I wait until current URL contains "/certificates/batch"
    And element "#certificate-batch" is visible
    Then element "#certificate-batch" contains text "Sally"

  Scenario: Do not see the unit when a section is assigned a single-unit course
    Given I create a teacher-associated student named "Sally"
    Given I am assigned to course "ui-test-single-unit-course-2025" unit 1 with teacher "Teacher_Sally"

    Given I sign in as "Teacher_Sally" and go home
    Then the student section table should have 2 rows
    And the section table row at index 0 has primary assignment path "/courses/ui-test-single-unit-course-2025"
    And element ".uitest-owned-sections" does not contain text "Current unit:"

    When I click selector ".uitest-owned-sections a:contains('Single Unit Course 2025')" to load a new page
    Then check that the URL contains "/unit/ui-test-single-unit-2025"
