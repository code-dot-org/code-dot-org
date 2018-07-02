# Brad investigating (2018-04-25)
@skip
@no_circle
@dashboard_db_access
@as_student
Feature: Weblab Versions

Background:
  Given I am on "http://studio.code.org/s/allthethings/stage/32/puzzle/1?noautoplay=true"
  Then I rotate to landscape
  And I debug channel id
  And I wait until element "#submitButton" is visible

Scenario: Weblab Versions
  # Create the initial version by adding a CSS file:
  When I click selector "#headers div:nth-child(2)"
  And I wait for 3 seconds

  # Click save & refresh:
  Then I click selector "#versions-header ~ div"
  And I wait for 7 seconds

  # Reset the puzzle to the start
  Then I reset the puzzle to the starting version
  And I wait until element "#submitButton" is visible

  # Restore to the previous version
  Then I click selector "#versions-header"
  And I wait to see a dialog titled "Version History"
  And I close the dialog
  And I wait for 3 seconds
  Then I click selector "#versions-header"
  And I wait until element "button:contains(Restore this Version):eq(0)" is visible
  And element "button.version-preview" is visible
  And I click selector "button:contains(Restore this Version):eq(0)"
  And I wait until element "#showVersionsModal" is gone
  And I wait for 3 seconds
  And I wait until element "#submitButton" is visible

  # Ideally, we could verify that the new-1.css file is present, but can't because
  # the bramble IFRAME is served from a different domain
  # And I wait until element ".jstree-brackets li:nth-child(2)" contains text "new-1"

  # Instead, we simply verify that there are now 2 earlier versions that can be restored
  Then I click selector "#versions-header"
  And I wait to see a dialog titled "Version History"
  And I wait until element "button:contains(Restore this Version):eq(1)" is visible
  And I close the dialog
