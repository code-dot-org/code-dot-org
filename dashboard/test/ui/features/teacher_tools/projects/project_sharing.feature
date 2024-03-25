@no_mobile
@as_young_student

Feature: Project Sharing - Young Students
  Scenario: Share dialog can be opened and closed
    Then I make a "spritelab" project named "Spritelab Project"
    And I open the project share dialog
    Then I wait until element "#project-share" is visible
    And I close the dialog
    Then I wait until element "#project-share" is gone

  Scenario: Young Students Cannot Publish New Play Lab Projects
    Then I make a "playlab" project named "Playlab Project!"
    And I open the project share dialog
    And I wait until element "#share-dialog-publish-button" is visible
    Then element "#share-dialog-publish-button" is disabled

  Scenario: Young Student Can Always Share via URL
    Then I make a "playlab" project named "Playlab Project!"
    And I open the project share dialog
    And element "#sharing-dialog-copy-button" is enabled

  Scenario: Young Students Can Not By Default Make App Lab Projects
    Then I am on "http://studio.code.org/projects/applab/new"
    And I get redirected to "/home" via "dashboard"
    And element ".alert" is visible
