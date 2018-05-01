@no_mobile
@as_young_student

Feature: Project Sharing - Young Students

Scenario: Young Students Can Always Share Play Lab Projects
  Then I make a playlab project named "Playlab Project!"
  And I open the project share dialog
  Then the project can be published
  Then I open the project share dialog
  And I click selector "#share-dialog-publish-button"
  And I wait to see a dialog containing text "Publish to Public Gallery"
  And element "#publish-dialog-publish-button" is visible
  And I click selector "#publish-dialog-publish-button"
  Given I open the project share dialog
  And the project is published

Scenario: Young Students Can Not By Default Make App Lab Projects
  Then I am on "http://studio.code.org/projects/applab/new"
  And I get redirected to "/home" via "dashboard"
  And element ".alert" is visible
