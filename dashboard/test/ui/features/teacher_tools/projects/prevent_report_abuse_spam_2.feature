@dashboard_db_access
@no_mobile
@no_firefox
@no_safari
Feature: Prevent Report Abuse Spam 2

# If someone has already reported abuse on a specific project, we hide the
# report abuse link so they can't spam Zendesk.

  Scenario: Report Abuse link hidden if the user already reported Game Lab project - share page
    Given I create a student named "Project Maker"
    And I make a "gamelab" project named "Game Lab Project 2"
    Then I navigate to the shared version of my project
    Then I open the small footer menu
    And element ".ui-test-how-it-works" is visible
    And element ".ui-test-report-abuse" is visible
    And I press menu item "Report Abuse"
    Then I report abuse on the project
    Then I wait until current URL contains "projects"
    Then I reload the page
    Then I open the small footer menu
    And element ".ui-test-how-it-works" is visible
    And element ".ui-test-report-abuse" is not visible

  Scenario: Abuse reports from verified teachers block a project for other viewers
    Given I create a teacher named "Creator"
    And I make a "applab" project named "Regular Project"
    And I click selector ".project_share"
    And I wait until element "#sharing-dialog-copy-button" is visible
    And I save the share URL
    Then I sign out

    Given I create a teacher named "Teacher_1"
    And I give user "Teacher_1" authorized teacher permission
    And I navigate to the last shared URL
    Then I open the small footer menu
    And element ".ui-test-report-abuse" is visible
    And I press menu item "Report Abuse"
    And I report abuse on the project
    Then I close the current tab
    Then I sign out

    Given I create a student named "Viewer"
    And I navigate to the last shared URL
    And I wait until element ".exclamation-abuse" is visible

  Scenario: Projects made by project validators are protected from abuse reports
    Given I create a teacher named "Project Validator"
    And I give user "Project Validator" project validator permission
    And I make a "applab" project named "Protected Project"
    And I click selector ".project_share"
    And I wait until element "#sharing-dialog-copy-button" is visible
    And I save the share URL
    Then I sign out

    Given I create a teacher named "Teacher_1"
    And I give user "Teacher_1" authorized teacher permission
    And I navigate to the last shared URL
    Then I open the small footer menu
    And element ".ui-test-report-abuse" is visible
    And I press menu item "Report Abuse"
    And I report abuse on the project
    Then I close the current tab
    Then I sign out

    Given I create a student named "Viewer2"
    And I navigate to the last shared URL
    And I wait until element ".exclamation-abuse" is not visible
