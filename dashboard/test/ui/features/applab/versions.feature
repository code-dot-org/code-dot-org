@dashboard_db_access
@as_student
Feature: App Lab Versions

Scenario: Script Level Versions
  Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And I ensure droplet is in block mode
  And I switch to text mode
  And I add code "// comment 1" to ace editor
  And I click selector "#runButton"
  And element ".project_updated_at" eventually contains text "Saved"

  # reloading here creates a previous version containing only comment 1
  And I reload the page
  And I wait for the page to fully load
  And I add code "// comment 2" to ace editor
  And I click selector "#runButton"
  And element ".project_updated_at" eventually contains text "Saved"

  When I click selector "#versions-header"
  And I wait until element "button:contains(Restore this Version):eq(0)" is visible
  And element "button.version-preview" is visible
  And I make all links open in the current tab
  And I click selector "button.version-preview:eq(0)" to load a new page
  And I wait for the page to fully load
  Then ace editor code is equal to "// comment 1"
  And element "#workspace-header-span" contains text "View only"

  When I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/1?noautoplay=true"
  And I wait for the page to fully load
  Then ace editor code is equal to "// comment 2// comment 1"

Scenario: Project Load and Reload
  Given I am on "http://studio.code.org/projects/applab/new"
  And I rotate to landscape
  And I wait for the page to fully load
  # The initial load results in save only because this is a new project.
  And I wait for initial project save to complete

  When I reload the page
  And I wait for the page to fully load
  And I click selector "#versions-header"
  And I wait until element "button:contains(Current Version)" is visible

  # There is currently no guarantee that Version History will initially be
  # empty, because we don't necessarily clear past project data from S3 between
  # test runs in the test environment. Therefore, just check that we have no
  # version that was updated within the last 90 seconds, which will show as
  # "less than a minute ago" or "about a minute ago".
  Then element "#showVersionsModal tr:contains(a minute ago):contains(Restore this Version)" is not visible

  When I close the dialog
  # This run may nor may not trigger a save, because sometimes serializing
  # applab html causes some minor changes.
  And I press "runButton"
  And I wait until initial thumbnail capture is complete
  And I press "resetButton"
  # Triggers a save because the thumbnail url has changed
  And I click selector "#runButton" once I see it
  And element ".project_updated_at" eventually contains text "Saved"
  And I click selector "#versions-header"
  And I wait until element "button:contains(Current Version)" is visible
  Then element "#showVersionsModal tr:contains(a minute ago):contains(Restore this Version):eq(0)" is visible
  And element "#showVersionsModal tr:contains(a minute ago):contains(Restore this Version):eq(1)" is not visible

Scenario: Project Version Checkpoints
  Given I am on "http://studio.code.org/projects/applab/new"
  And I rotate to landscape
  And I wait for the page to fully load
  # The initial load results in save only because this is a new project.
  And I wait for initial project save to complete
  And I ensure droplet is in block mode
  And I switch to text mode

  When I add code "// comment A" to ace editor
  And I press "runButton"
  And element ".project_updated_at" eventually contains text "Saved"
  And I click selector "#versions-header"
  And I wait until element "button:contains(Current Version)" is visible
  # The dialog contains only the initial version and the current version, and
  # possibly some versions created more than 90 seconds ago which we ignore.
  Then element "#showVersionsModal tr:contains(a minute ago):contains(Restore this Version)" is not visible

  When I close the dialog
  And I set the project version interval to 1 second
  And I wait for 1.5 seconds
  And I ensure droplet is in text mode
  And I add code "// comment B" to ace editor
  And I press "resetButton"
  And I click selector "#runButton" once I see it
  And I click selector "#versions-header"
  And I wait until element "button:contains(Current Version)" is visible
  # The version containing "comment A" is saved as a checkpoint, because the
  # project version interval time period had passed.
  Then element "#showVersionsModal tr:contains(a minute ago):contains(Restore this Version):eq(0)" is visible
  And element "#showVersionsModal tr:contains(a minute ago):contains(Restore this Version):eq(1)" is not visible
