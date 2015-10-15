@eyes
Feature: App Lab Eyes

@dashboard_db_access
Scenario: Button shows up on top of canvas
  Given I am on "http://learn.code.org/"
  And I am a student
  When I open my eyes to test "applab eyes"
  And I am on "http://learn.code.org/projects/applab"
  And I rotate to landscape
  Then I see no difference for "initial load"
  And I press "show-code-header"
  And I add code for a canvas and a button
  And I press "runButton"
  Then I see no difference for "button should be visible"
  And I click selector ".project_share"
  And I wait to see a dialog titled "Share your project"
  And I navigate to the share URL
  And I wait until element "#divApplab" is visible
  Then I see no difference for "app lab share"
  And I close my eyes
