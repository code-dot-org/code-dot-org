@no_mobile
@as_young_student

Feature: Project Sharing - Young Students
  Scenario: Share dialog can be opened and closed
    Then I make a "dance" project named "Dance Project"
    And I open the project share dialog
    Then I wait until element "#project-share" is visible
    And I close the dialog
    Then I wait until element "#project-share" is gone

  Scenario: Young Student Can Share Non-Open-ended Projects via URL
    Then I make a "dance" project named "Dance Project"
    And I open the project share dialog
    And element "#sharing-dialog-copy-button" is enabled
  
  Scenario: Young Student Not In Teacher Section Cannot Share Open-ended Projects via URL
    Then I make a "spritelab" project named "Sprite Lab Project"
    Then I click selector ".project_share"
    And I wait until element "#uitest-sharing-disabled-button" is visible

  Scenario: Young Students Can Not By Default Make App Lab Projects
    Then I am on "http://studio.code.org/projects/applab/new"
    And I get redirected to "/home" via "dashboard"
    And element ".alert" is visible
