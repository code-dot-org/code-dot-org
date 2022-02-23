@no_mobile
@no_ie
Feature: Commit Code

Background:
  Given I create a teacher-associated student named "Lillian"
  And I am on "http://studio.code.org/s/allthethings/lessons/44/levels/1?noautoplay=true"
  And I wait to see "#javalab-editor-save"

Scenario: Open the commit code dialog, enter commit notes, commit, and see commit in version history.
  # Open the commit code dialog
  Then I press "javalab-editor-save"
  And I wait to see "#commit-notes"

  # Enter commit notes
  And I press keys "my commit notes" for element "#commit-notes"
  And element "#commit-notes" contains text "my commit notes"

  # Commit Code
  Then I press "confirmationButton"
  And I wait until element "#commit-notes" is not visible
  And I wait until jQuery Ajax requests are finished

  # View version history and wait for versions to load
  Then I press "data-mode-versions-header"
  And I wait to see ".modal"
  And I wait until ".modal tr:last-child p" contains text "Initial version"

  # Verify the latest version contains commit notes
  And element ".modal tr:nth-child(1) p:nth-child(2)" contains text "my commit notes"

Scenario: Open the commit code dialog and try committing without notes, student should not be able to submit.
  # Open the commit code dialog
  Then I press "javalab-editor-save"
  And I wait to see "#commit-notes"

  # Try committing, dialog should not close
  Then I press "confirmationButton"
  And I wait for 1 seconds
  And element "#commit-notes" is visible
  Then I sign out
