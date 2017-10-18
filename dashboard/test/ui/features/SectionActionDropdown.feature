@no_mobile
@dashboard_db_access
@pegasus_db_access
Feature: Using the SectionActionDropdown
  Scenario: Viewing progress from SectionActionDropdown
    Given I create a teacher-associated student named "Sally"
    And I give user "Teacher_Sally" hidden script access
    And I complete the level on "http://studio.code.org/s/allthethings/stage/2/puzzle/1"
    And I complete the free response on "http://studio.code.org/s/allthethings/stage/27/puzzle/1"
    And I submit the assessment on "http://studio.code.org/s/allthethings/stage/33/puzzle/1"
    And I sign out

    When I sign in as "Teacher_Sally"
    And I am on "http://code.org/teacher-dashboard?no_home_redirect=1"
    And I click selector "div.title:contains('Student Accounts and Progress')" once I see it
    And I click selector ".fa-chevron-down" once I see it
    And I click selector "a:contains('View Progress')" once I see it
    And I wait for 4 seconds
    And I wait until current URL contains "/progress"

  Scenario: Managing students from SectionActionDropdown
    Given I am a teacher
    And I am on "http://studio.code.org/"
    And I create a new section
    And I click selector ".fa-chevron-down" once I see it
    And I click selector "a:contains('Manage Students')" once I see it
    And I wait until current URL contains "/manage"

  Scenario: Printing Login Cards from SectionActionDropdown
    Given I am a teacher
    And I am on "http://studio.code.org/"
    And I create a new section
    And I click selector ".fa-chevron-down" once I see it
    And I click selector "a:contains('Print Login Cards')" once I see it
    And I wait until current URL contains "/print_signin_cards"

  Scenario: Editing Section Information from SectionActionDropdown
    Given I am a teacher
    And I am on "http://studio.code.org/"
    And I create a new section
    And I click selector ".fa-chevron-down" once I see it
    And I click selector "#ui-test-edit-section" once I see it
    And I press the save button to create a new section

  # This should adequately test section down
  # * Check that section has hide value
  #   * If it has hide then we toggle it
  #   * If it is correctly toggled, it will show up is the hidden sections && display 'Show Section'
  Scenario: Hiding/Showing Section from SectionActionDropdown
    Given I am a teacher
    And I am on "http://studio.code.org/"
    And I create a new section
    And I click selector ".fa-chevron-down" once I see it
    And I click selector "#ui-test-hide-section" once I see it
    And I click selector ".ui-test-show-hide" once I see it
    And I click selector ".fa-chevron-down" once I see it
    And I click selector "a:contains('Show Section')" once I see it