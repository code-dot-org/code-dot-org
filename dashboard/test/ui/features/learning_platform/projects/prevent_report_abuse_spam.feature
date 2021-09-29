@dashboard_db_access
@no_mobile
@no_firefox
Feature: Prevent Report Abuse Spam

# If someone has already reported abuse on a specific project, we hide the
# report abuse link so they can't spam Zendesk.

Scenario: Report Abuse link hidden if the user already reported AppLab project - studio
  Given I create a student named "Project Maker"
  And I make a "applab" project named "App Lab Project 1"
  Then I open the help menu
  And element "#report-abuse" is visible
  And I press help menu item "#report-abuse"

  Then I report abuse on the project
  Then I wait until current URL contains "projects"
  Then I reload the page
  Then I open the help menu
  And element "#report-abuse" is not visible

Scenario: Report Abuse link hidden if the user already reported AppLab project - share page
  Given I create a student named "Project Maker"
  And I make a "applab" project named "App Lab Project 2"
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

Scenario: Report Abuse link hidden if the user already reported GameLab project - studio
  Given I create a student named "Project Maker"
  And I make a "gamelab" project named "Game Lab Project 1"
  Then I open the help menu
  And element "#report-abuse" is visible
  And I press help menu item "#report-abuse"

  Then I report abuse on the project

  Then I wait until current URL contains "projects"
  Then I reload the page
  Then I open the help menu
  And element "#report-abuse" is not visible

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

@no_ie @no_chrome
Scenario: Abuse reports block a project for other viewers
  Given I create a student named "Creator"
  And I make a "applab" project named "Regular Project"
  And I click selector ".project_share"
  And I wait until element "#sharing-input" is visible
  And I save the share URL
  Then I sign out

  Given I create a student named "Spammer"
  And I navigate to the last shared URL
  Then I open the small footer menu
  And element ".ui-test-report-abuse" is visible
  And I press menu item "Report Abuse"
  And I report abuse on the project
  Then I close the current tab
  Then I sign out

  Given I create a student named "Spammer2"
  And I delete the cookie named "reported_abuse"
  And I navigate to the last shared URL
  Then I open the small footer menu
  And element ".ui-test-report-abuse" is visible
  And I press menu item "Report Abuse"
  And I report abuse on the project
  Then I sign out

  Given I create a student named "Viewer"
  And I navigate to the last shared URL
  And I wait until element ".exclamation-abuse" is visible

@no_ie @no_chrome
Scenario: Projects made by project validators are protected from abuse reports
  Given I create a teacher named "Project Validator"
  And I give user "Project Validator" project validator permission
  And I make a "applab" project named "Protected Project"
  And I click selector ".project_share"
  And I wait until element "#sharing-input" is visible
  And I save the share URL
  Then I sign out

  Given I create a student named "Spammer3"
  And I navigate to the last shared URL
  Then I open the small footer menu
  And element ".ui-test-report-abuse" is visible
  And I press menu item "Report Abuse"
  And I report abuse on the project
  Then I close the current tab
  Then I sign out

  Given I create a student named "Spammer4"
  And I delete the cookie named "reported_abuse"
  And I navigate to the last shared URL
  Then I open the small footer menu
  And element ".ui-test-report-abuse" is visible
  And I press menu item "Report Abuse"
  And I report abuse on the project
  Then I sign out

  Given I create a student named "Viewer2"
  And I navigate to the last shared URL
  And I wait until element ".exclamation-abuse" is not visible
