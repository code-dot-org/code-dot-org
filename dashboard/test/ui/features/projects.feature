Feature: Projects

# Scenario: Save Artist Project
#   Given I am on "http://learn.code.org/p/artist"
#   And I rotate to landscape
#   And element "#runButton" is visible
#   And element ".project_updated_at" has text "Not saved"
#   Then I open the topmost blockly category "Color"
#   And I drag block matching selector "#draw-color" to block matching selector "#when_run"
#   And I press "runButton"
# #  Then element ".project_updated_at" contains text "Saving..." # I think browserstack is too slow to catch this
#   Then I wait until element ".project_updated_at" contains text "Saved"
#   And I reload the page
#   Then element "#draw-color" is a child of element "#when_run"

@dashboard_db_access
Scenario: Applab Flow
  Given I am on "http://studio.code.org/"
  And I am a student
  And I am on "http://studio.code.org/users/sign_in"
  Then I am on "http://studio.code.org/projects/applab"
  And I rotate to landscape
  # TODO  ideally we should probably create some code and/or design elements here
  And element "#runButton" is visible
  And element ".project_updated_at" has text "Not saved"
  Then I click selector ".project_share"
  And I wait to see "#x-close"
  Then I navigate to the share URL
  And I wait to see "#open-workspace"
  And element "#codeWorkspace" is hidden
  Then I click selector "#open-workspace"
  # it should be readonly
  # And I wait for 30 seconds
