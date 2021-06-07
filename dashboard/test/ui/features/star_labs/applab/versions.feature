@as_student
Feature: App Lab Versions

Scenario: Script Level Versions
  Given I am on "http://studio.code.org/s/allthethings/lessons/18/levels/1?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load
  And I ensure droplet is in block mode
  And I switch to text mode
  And I add code "// comment 1" to ace editor
  And I press "runButton"
  And element ".project_updated_at" eventually contains text "Saved"

  # reloading here creates a previous version containing only comment 1
  And I reload the page
  And I wait for the page to fully load
  # this particular level is set to always start in block mode
  And I ensure droplet is in block mode
  And I switch to text mode
  And I add code "// comment 2" to ace editor
  Then ace editor code is equal to "// comment 2// comment 1"
  And I press "runButton"
  And element ".project_updated_at" eventually contains text "Saved"

  When I press "versions-header"
  And I wait until element "button:contains(Restore this Version):eq(0)" is visible
  And element "button.version-preview" is visible
  And I make all links open in the current tab
  And I click selector "button.version-preview:eq(0)" to load a new page
  And I wait for the page to fully load
  Then ace editor code is equal to "// comment 1"
  And element "#workspace-header-span" contains text "View only"

  When I am on "http://studio.code.org/s/allthethings/lessons/18/levels/1?noautoplay=true"
  And I wait for the page to fully load
  Then ace editor code is equal to "// comment 2// comment 1"

@no_ie
Scenario: Project Load and Reload
  Given I am on "http://studio.code.org/projects/applab/new"
  And I rotate to landscape
  And I wait for the page to fully load
  # The initial load results in save only because this is a new project.
  And I wait for initial project save to complete

  When I reload the page
  And I wait for the page to fully load
  And I press "versions-header"
  And I wait until element "button:contains(Current Version)" is visible
  And I save the text from ".versionRow:nth-child(1) p"

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
  And I press "versions-header"
  And I wait until element "button:contains(Current Version)" is visible

  Then ".versionRow:nth-child(2) p" contains the saved text
  And element ".versionRow:nth-child(2) .btn-info" contains text "Restore this Version"

  And element "#showVersionsModal tr:contains(a minute ago):contains(Restore this Version):eq(1)" is not visible

@no_ie
@no_mobile
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
  And I press "versions-header"
  And I wait until element "button:contains(Current Version)" is visible
  Then I save the text from ".versionRow:nth-child(1) p"

  When I close the dialog
  And I set the project version interval to 1 second
  And I wait for 1.5 seconds
  And I ensure droplet is in text mode
  And I add code "// comment B" to ace editor
  And I press "resetButton"
  And I click selector "#runButton" once I see it
  And element ".project_updated_at" eventually contains text "Saved"
  And I press "versions-header"
  And I wait until element "button:contains(Current Version)" is visible
  # The version containing "comment A" is saved as a checkpoint, because the
  # project version interval time period had passed.
  Then ".versionRow:nth-child(2) p" contains the saved text
  And element ".versionRow:nth-child(2) .btn-info" contains text "Restore this Version"

# Skip on IE due to blocked pop-ups
@no_mobile @no_ie
Scenario: Project page refreshes when other client adds a newer version
  Given I am on "http://studio.code.org/projects/applab/new"
  And I get redirected to "/projects/applab/([^\/]*?)/edit" via "dashboard"
  And I rotate to landscape
  And I wait for the page to fully load
  And element ".project_updated_at" eventually contains text "Saved"
  And I ensure droplet is in block mode
  And I switch to text mode

  # Browser tab 0 writes version X
  When I add code "// comment X" to ace editor
  And I press "runButton"
  Then element ".project_updated_at" eventually contains text "Saved"

  When I go to a new tab
  And I am on "http://studio.code.org/projects/applab/"
  And I get redirected to "/projects/applab/([^\/]*?)/edit" via "dashboard"
  And I wait for the page to fully load
  And element ".project_updated_at" eventually contains text "Saved"
  Then ace editor code is equal to "// comment X"

  # Browser tab 1 writes version Y
  When I add code "// comment Y" to ace editor
  And ace editor code is equal to "// comment Y// comment X"
  And I press "runButton"
  And element ".project_updated_at" eventually contains text "Saved"

  When I close the current tab
  Then ace editor code is equal to "// comment X"

  # Browser tab 0 tries to write version Z, which fails because tab 1 has
  # written a newer version (Y) than tab 0's last known version (X).
  When I add code "// comment Z" to ace editor
  And I click selector "#runButton" to load a new page
  And I wait for the page to fully load
  Then ace editor code is equal to "// comment Y// comment X"

# Skip on IE due to blocked pop-ups
@no_mobile @no_ie
Scenario: Project page refreshes when other client replaces current version
  Given I am on "http://studio.code.org/projects/applab/new"
  And I get redirected to "/projects/applab/([^\/]*?)/edit" via "dashboard"
  And I rotate to landscape
  And I wait for the page to fully load
  And element ".project_updated_at" eventually contains text "Saved"
  And I ensure droplet is in block mode
  And I switch to text mode

  # Browser tab 0 writes version Alpha
  When I add code "// Alpha" to ace editor
  And I press "runButton"
  And element ".project_updated_at" eventually contains text "Saved"
  And I press "resetButton"

  # Browser tab 1 loads version Alpha
  When I go to a new tab
  And I am on "http://studio.code.org/projects/applab/"
  And I get redirected to "/projects/applab/([^\/]*?)/edit" via "dashboard"
  And I wait for the page to fully load
  And element ".project_updated_at" eventually contains text "Saved"
  And ace editor code is equal to "// Alpha"

  # Browser tab 0 writes version Bravo.
  When I switch tabs
  And ace editor code is equal to "// Alpha"
  And I add code "// Bravo" to ace editor
  And ace editor code is equal to "// Alpha// Bravo"
  And I press "runButton"
  And element ".project_updated_at" eventually contains text "Saved"
  And I reload the project page
  # Make sure the change stuck
  And ace editor code is equal to "// Alpha// Bravo"

  # Browser tab 1 tries to write version Charlie, which fails because
  # tab 0 has already replaced the latest version known to tab 1.
  When I switch tabs
  And ace editor code is equal to "// Alpha"
  And I add code "// Charlie" to ace editor
  And I click selector "#runButton" to load a new page
  And I wait for the page to fully load
  Then ace editor code is equal to "// Alpha// Bravo"
