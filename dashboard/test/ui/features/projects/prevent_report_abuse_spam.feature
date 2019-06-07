Feature: Prevent Report Abuse Spam

Scenario: Report Abuse link hidden if the user already reported AppLab project - mini link
  Given I create a student named "Project Maker"
  And I make a "applab" project named "App Lab Project 1"
  Then I open the small footer menu
  And element ".ui-test-help-support" is visible
  And element ".ui-test-report-abuse" is visible
  And I press menu item "Report Abuse"
  Then I report abuse on the project
  Then I wait until current URL contains "projects"
  Then I reload the page
  Then I open the small footer menu
  And element ".ui-test-help-support" is visible
  And element ".ui-test-report-abuse" is not visible

Scenario: Report Abuse link hidden if the user already reported AppLab project - share page
  Given I create a student named "Project Maker"
  And I make a "applab" project named "App Lab Project 2"
  Then I navigate to the shared version of my project
  Then I open the small footer menu
  And element ".ui-test-how-it-works" is visible
  And element ".ui-test-report-abuse" is visible
  Then I open the small footer menu
  And I press menu item "Report Abuse"
  Then I report abuse on the project
  Then I wait until current URL contains "projects"
  Then I reload the page
  Then I open the small footer menu
  And element ".ui-test-how-it-works" is visible
  And element ".ui-test-report-abuse" is not visible
