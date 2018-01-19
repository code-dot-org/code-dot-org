@dashboard_db_access
@pegasus_db_access
@as_teacher
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
    And check that the URL contains "/home"
    And I create a new section with course "Computer Science Principles" and unit "Unit 3: Intro Programming (version A)"
    Then the section table should have 1 row
    And the section table row at index 0 has script path "/s/csp3-a"

  Scenario: Navigate to course and unit pages
    When I see the section set up box
    And I create a new section with course "Computer Science Principles" and unit "Unit 1: The Internet"
    And I create a new section
    Then the section table should have 2 rows

    # save the older section id, from the last row of the table
    And I save the section id from row 1 of the section table

    And the href of selector ".uitest-owned-sections a:contains('Computer Science Principles')" contains the section id
    And the href of selector ".uitest-owned-sections a:contains('Unit 1')" contains the section id

    When I click selector ".uitest-owned-sections a:contains('Computer Science Principles')" to load a new page
    Then the url contains the section id

    When I click selector ".uitest-CourseScript:contains(CSP Unit 2) .uitest-go-to-unit-button" to load a new page
    Then the url contains the section id

    And the href of selector ".uitest-script-next-banner" contains the section id
    And the href of selector ".uitest-ProgressPill:first" contains the section id
    And the href of selector ".uitest-ProgressBubble:first" contains the section id
    And the href of selector "a:contains(View all units)" contains the section id

    # navigate to a script level
    When I click selector ".uitest-ProgressBubble:first" to load a new page
    Then the url contains the section id
    And the href of selector ".progress_container .uitest-ProgressBubble:first" contains the section id

    # open the More menu in the progress bar
    When I click selector ".header_popup_link"
    And I wait until element "a:contains(View Unit Overview)" is visible
    And the href of selector "a:contains(View Unit Overview)" contains the section id
