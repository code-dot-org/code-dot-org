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

