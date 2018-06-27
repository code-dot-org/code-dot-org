@dashboard_db_access
@pegasus_db_access
@as_teacher
@no_mobile
Feature: Using the teacher homepage sections feature

  Scenario: Loading the teacher homepage with new sections
    # Create my first section (via the SetUpSections component)
    When I see the section set up box
    And I create a new section
    Then the section table should have 1 row

    # Create my second section (via the button in OwnedSections)
    When I create a new section
    Then the section table should have 2 rows

  Scenario: Loading teacher homepage with course experiment enabled
    Given I enable the "subgoals-group-a" course experiment
    And I wait for the pegasus and dashboard experiment caches to expire
    And I reload the page
    And I wait to see ".uitest-newsection"
    And check that the URL contains "/home"
    And I create a new section with course "Computer Science Principles", version "'17-'18" and unit "CSP Unit 3 - Subgoals Group A *"
    Then the section table should have 1 row
    And the section table row at index 0 has secondary assignment path "/s/csp3-a"

  Scenario: Navigate to course and unit pages
    When I see the section set up box
    And I create a new section with course "Computer Science Principles", version "'17-'18" and unit "CSP Unit 1 - The Internet"
    And I create a new section
    Then the section table should have 2 rows

    # save the older section id, from the last row of the table
    And I save the section id from row 1 of the section table

    And the href of selector ".uitest-owned-sections a:contains('Computer Science Principles')" contains the section id
    And the href of selector ".uitest-owned-sections a:contains('Unit 1')" contains the section id

    When I click selector ".uitest-owned-sections a:contains('Computer Science Principles')" to load a new page
    And I wait to see ".uitest-CourseScript"
    Then the url contains the section id
    And check that the URL contains "/courses/csp-2017"

    When I click selector ".uitest-CourseScript:contains(CSP Unit 2) .uitest-go-to-unit-button" to load a new page
    And I wait to see ".uitest-script-next-banner"
    Then the url contains the section id

    And the href of selector ".uitest-script-next-banner" contains the section id
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

  Scenario: Assign a CSF course with multiple versions
    When I see the section set up box
    And I create a new section with course "Course A", version "2017 (Recommended)"
    Then the section table should have 1 rows
    And the section table row at index 0 has primary assignment path "/s/coursea-2017"

    When I click selector ".ui-test-section-dropdown"
    And I click selector ".edit-section-details-link"
    And I wait until element "#assignment-version-year" is visible
    And I select the "2018" option in dropdown "assignment-version-year"
    And I press the first ".uitest-saveButton" element
    And I wait for the dialog to close
    Then I should see the section table
    And the section table row at index 0 has primary assignment path "/s/coursea-2018"

  Scenario: Navigate to course pages with course versions enabled
    Given I am on "http://studio.code.org/home"
    When I see the section set up box
    And I create a new section with course "Computer Science Principles", version "'18-'19 (Recommended)" and unit "CSP Unit 1 - The Internet"
    Then the section table should have 1 rows

    # save the older section id, from the last row of the table
    And I save the section id from row 0 of the section table

    And the href of selector ".uitest-owned-sections a:contains('Computer Science Principles')" contains the section id
    And the href of selector ".uitest-owned-sections a:contains('Unit 1')" contains the section id

    When I click selector ".uitest-owned-sections a:contains('Computer Science Principles')" to load a new page
    And I wait to see ".uitest-CourseScript"
    Then the url contains the section id
    And check that the URL contains "/courses/csp-2018"

    When I select the "'17-'18" option in dropdown "version-selector" to load a new page
    And I wait to see ".uitest-CourseScript"
    Then the url contains the section id
    And check that the URL contains "/courses/csp-2017"

    And the href of selector ".uitest-CourseScript:contains(CSP Unit 2) .uitest-go-to-unit-button" contains the section id

  Scenario: Loading the print certificates page for a section
    Given I create a teacher-associated student named "Sally"
    And I sign in as "Teacher_Sally"
    And I click selector ".ui-test-section-dropdown" once I see it

    And I click selector ".uitest-certs-link" once I see it
    And I wait to see "#uitest-cert-names"

    And check that the URL contains "/certificates"
    Then element "#uitest-cert-names" contains text "Sally"
