@as_teacher
@no_mobile
Feature: Using the teacher homepage sections feature

  Scenario: Loading the teacher homepage with new sections
    # Create my first section (via the SetUpSections component)
    When I create a new section and go home
    Then the section table should have 1 row

    And I wait until element "a:contains(Untitled Section)" is visible
    And the href of selector "a:contains(Untitled Section)" contains "/teacher_dashboard/sections/"

    # Create my second section (via the button in OwnedSections)
    When I create a new section and go home
    Then the section table should have 2 rows

  Scenario: Loading teacher homepage with course experiment enabled
    Given I am on "http://studio.code.org/home"
    Given I enable the "subgoals-group-a" course experiment
    And I reload the page
    And I wait to see ".uitest-newsection"
    And check that the URL contains "/home"
    And I create a new section with course "Computer Science Principles", version "'17-'18" and unit "CSP Unit 3 - Subgoals Group A *"
    Then the section table should have 1 row
    And the section table row at index 0 has secondary assignment path "/s/csp3-a"

  @no_firefox @no_safari @no_ie
  Scenario: Navigate to course and unit pages
    # No sections, ensure that levels load correctly after navigating from MiniView
    Given I am on "http://studio.code.org/s/csp2-2017/lessons/1/levels/1"
    And I wait to see ".header_popup_link"
    When I wait for jquery to load
    And I click selector ".header_popup_link"
    And I wait until element "a:contains(View Unit Overview)" is visible
    Then I click selector "a:contains(View Unit Overview)"
    And I wait until current URL contains "/s/csp2-2017"
    Then I press the first ".uitest-ProgressPill" element
    And I wait until current URL contains "/s/csp2-2017/lessons/1/levels/1"

    Given I am on "http://studio.code.org/home"
    When I see the section set up box
    And I create a new section with course "Computer Science Principles", version "'17-'18" and unit "CSP Unit 1 - The Internet ('17-'18)"
    And I create a new section and go home
    Then the section table should have 2 rows

    # save the older section id, from the last row of the table
    And I save the section id from row 1 of the section table

    And the href of selector ".uitest-owned-sections a:contains('Computer Science Principles')" contains the section id
    And the href of selector ".uitest-owned-sections a:contains('Unit 1')" contains the section id

    When I click selector ".uitest-owned-sections a:contains('Computer Science Principles')" to load a new page
    And I wait to see ".uitest-CourseScript"
    Then the url contains the section id
    And I wait until current URL contains "/courses/csp-2017"

    When I click selector ".uitest-CourseScript:contains(CSP Unit 2) .uitest-go-to-unit-button" to load a new page
    And I wait to see ".uitest-script-next-banner"
    Then the url contains the section id

    And the href of selector ".uitest-script-next-banner" contains the section id
    And I wait for 3 seconds
    And the href of selector ".uitest-ProgressPill:first" contains the section id
    And the href of selector ".uitest-ProgressBubble:first" contains the section id
    And the href of selector "a:contains(Computer Science Principles)" contains the section id

    # navigate to a script level
    When I click selector ".uitest-script-next-banner" to load a new page
    And I wait to see ".header_popup_link"
    Then the url contains the section id

    # open the More menu in the progress bar
    When I wait for jquery to load
    And I click selector ".header_popup_link"
    And I wait until element "a:contains(View Unit Overview)" is visible
    And the href of selector "a:contains(View Unit Overview)" contains the section id
    And I wait until element ".header_popup_body .uitest-ProgressBubble:first" is visible
    And the href of selector ".header_popup_body .uitest-ProgressBubble:first" contains the section id

    # Save the newer section id
    Given I am on "http://studio.code.org/home"
    Then the section table should have 2 rows
    And I save the section id from row 0 of the section table

    # Test that the overview pages add the newer section id to the url

    When I am on "http://studio.code.org/courses/csp-2018"
    And I wait until element ".uitest-CourseScript" is visible
    Then the url contains the section id

    When I am on "http://studio.code.org/s/csp1-2018"
    And I wait until element "#script-title" is visible
    Then the url contains the section id

    When I am on "http://studio.code.org/s/coursea-2018"
    And I wait until element "#script-title" is visible
    Then the url contains the section id

    # loading non-existent section succeeds, with no section selected
    When I am on "http://studio.code.org/s/coursea-2018?section_id=99999"
    And I wait until element "#script-title" is visible
    And element ".uitest-sectionselect" has value ""

  Scenario: Assign hidden unit to section
    Given I am on "http://studio.code.org/home"
    And I create a new section with course "Computer Science Principles", version "'17-'18" and unit "CSP Unit 1 - The Internet ('17-'18)"
    Then the section table should have 1 rows
    And I save the section id from row 0 of the section table

    When I am on "http://studio.code.org/courses/csp-2017"
    And I wait until element ".uitest-CourseScript" is visible
    Then the url contains the section id

    # Hide a unit from the section
    When I hide unit "CSP Unit 2 - Digital Information ('17-'18)"
    And unit "CSP Unit 2 - Digital Information ('17-'18)" is marked as not visible

    # Verify hidden unit warning banner appears
    When I am on "http://studio.code.org/s/csp2-2017"
    And I wait until element "#script-title" is visible
    Then I wait until element ".announcement-notification:contains(unit is hidden)" is visible

    # Try to assign the unit
    Given I am on "http://studio.code.org/home"
    And I click selector ".ui-test-section-dropdown" once I see it
    And I click selector ".edit-section-details-link" once I see it
    And I wait until element "#uitest-secondary-assignment" is visible
    And I select the "CSP Unit 2 - Digital Information ('17-'18)" option in dropdown "uitest-secondary-assignment"
    And I press the first ".uitest-saveButton" element
    Then I wait to see a dialog containing text "unit is currently hidden"

    # Confirm the assignment
    When I press "confirm-assign"
    And I wait for the dialog to close
    And the section table row at index 0 has secondary assignment path "/s/csp2-2017"

    # Verify the unit was unhidden
    When I am on "http://studio.code.org/courses/csp-2017"
    And I wait until element ".uitest-CourseScript" is visible
    Then unit "CSP Unit 2 - Digital Information ('17-'18)" is marked as visible

  Scenario: Assign a Course assigns first Unit in Course by default
    Given I am on "http://studio.code.org/home"
    When I see the section set up box
    And I create a new section with course "Computer Science Principles", version "'17-'18"
    Then the section table should have 1 rows
    And the section table row at index 0 has secondary assignment path "/s/csp1-2017"

  Scenario: Assign a CSF course with multiple versions
    Given I am on "http://studio.code.org/home"
    When I see the section set up box
    And I create a new section with course "Course A", version "2017"
    Then the section table should have 1 rows
    And the section table row at index 0 has primary assignment path "/s/coursea-2017"

    When I click selector ".ui-test-section-dropdown"
    And I click selector ".edit-section-details-link"
    And I wait until element "#assignment-version-year" is visible
    And element "#assignment-version-year" has value "2017"
    And I press "assignment-version-year"
    And I click selector ".assignment-version-title:contains(2018)" once I see it
    And I press the first ".uitest-saveButton" element
    And I wait for the dialog to close
    Then I should see the section table
    And the section table row at index 0 has primary assignment path "/s/coursea-2018"

  Scenario: Navigate to course pages with course versions enabled
    Given I am on "http://studio.code.org/home"
    When I see the section set up box
    And I create a new section with course "Computer Science Principles", version "'18-'19" and unit "CSP Unit 1 - The Internet ('18-'19)"
    Then the section table should have 1 rows

    # save the older section id, from the last row of the table
    And I save the section id from row 0 of the section table

    And the href of selector ".uitest-owned-sections a:contains('Computer Science Principles')" contains the section id
    And the href of selector ".uitest-owned-sections a:contains('Unit 1')" contains the section id

    When I click selector ".uitest-owned-sections a:contains('Computer Science Principles')" to load a new page
    And I wait to see ".uitest-CourseScript"
    Then the url contains the section id
    And check that the URL contains "/courses/csp-2018"

    And element "#uitest-version-selector" is visible
    And I click selector "#assignment-version-year" once I see it
    And I wait until element ".assignment-version-title" is visible
    When I click selector ".assignment-version-title:contains('17-'18)" to load a new page
    And I wait to see ".uitest-CourseScript"
    Then the url contains the section id

    And the href of selector ".uitest-CourseScript:contains(CSP Unit 2) .uitest-go-to-unit-button" contains the section id

  Scenario: Loading the print certificates page for a section
    Given I create a teacher-associated student named "Sally"
    And I sign in as "Teacher_Sally" and go home
    And I click selector ".ui-test-section-dropdown" once I see it

    And I click selector ".uitest-certs-link" once I see it
    And I wait to see "#uitest-cert-names"

    And check that the URL contains "/certificates"
    Then element "#uitest-cert-names" contains text "Sally"
