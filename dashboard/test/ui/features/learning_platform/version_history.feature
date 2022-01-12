@no_ie
Feature: Version History in Teacher View

Scenario: Teacher can view student versions
  Given I create an authorized teacher-associated student named "Ron"
  Then I sign in as "Ron"
  And I am on "http://studio.code.org/s/allthethings/lessons/18/levels/1"
  And I wait for the page to fully load
  And I click selector "#runButton"
  And I press "show-code-header"

  And I add another version to the project
  And element ".project_updated_at" eventually contains text "Saved"
  And I press "versions-header"
  And I wait until element "div:contains(Latest Version)" is visible
  Then I save the text from ".versionRow:nth-child(1) p"
  
  When I close the dialog
  And I set the project version interval to 1 second
  And I wait for 1.5 seconds
  And I ensure droplet is in text mode
  And I add another version to the project
  And element ".project_updated_at" eventually contains text "Saved"
  And I press "versions-header"
  And I wait until element "div:contains(Latest Version)" is visible
  Then ".versionRow:nth-child(2) p" contains the saved text
  And element ".versionRow:nth-child(2) .btn-info" contains text "Restore this Version"

  # Teacher cannot restore a version
  Then I sign in as "Teacher_Ron"
  And I am on "http://studio.code.org/s/allthethings/lessons/18/levels/1"
  And I wait until element ".student-table" is visible
  And I click selector "#teacher-panel-container tr:nth(1)" to load a new page
  And I wait for the page to fully load
  And I press "versions-header"
  And I wait until element "div:contains(Latest Version)" is visible
  And element ".versionRow:nth-child(0) .btn-info" does not contain text "Restore this Version"
  And element ".versionRow:nth-child(1) .btn-info" does not contain text "Restore this Version"
  And element ".versionRow:nth-child(2) .btn-info" does not contain text "Restore this Version"

Scenario: Teacher can view own versions
  Given I create an authorized teacher-associated student named "Ron"
  Then I sign in as "Teacher_Ron"
  And I am on "http://studio.code.org/s/allthethings/lessons/18/levels/1"
  And I dismiss the teacher panel
  And I click selector "#runButton" once I see it

  And I add another version to the project
  And element ".project_updated_at" eventually contains text "Saved"

  And I wait for 1.5 seconds
  And I ensure droplet is in text mode
  And I add another version to the project
  And element ".project_updated_at" eventually contains text "Saved"

  And I press "show-code-header"
  And I press "versions-header"
  And I wait until element "div:contains(Latest Version)" is visible
  And element ".versionRow:nth-child(2) .btn-info" contains text "Restore this Version"
  And I close the dialog