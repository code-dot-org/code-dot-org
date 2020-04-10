Feature: Using the Script Edit Page

Scenario: View the script edit page
Given I create a levelbuilder named "Levi"
And I create a temp script
And I view the temp script overview page
And I view the temp script edit page
And I delete the temp script

Scenario: Save changes to a script
  Given I create a levelbuilder named "Levi"
  And I create a temp script
  And I view the temp script overview page
  And element ".uitest-bubble" does not contain text "1"

  When I view the temp script edit page
  And I type "stage 'My Lesson'\nlevel 'Standalone_Artist_1'\n" into "#script_text"
  And I click selector ".btn-primary" to load a new page
  And I wait until element "#script-title" is visible

  Then element ".uitest-bubble" contains text "1"
  And I delete the temp script
