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
