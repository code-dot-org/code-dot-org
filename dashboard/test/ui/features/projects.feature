Feature: Projects

Scenario: Save Artist Project
  Given I am on "http://learn.code.org/p/artist"
  And I rotate to landscape
  And element "#runButton" is visible
  And element ".project_updated_at" has text "Not saved"
  Then I open the topmost blockly category "Color"
  And I drag block matching selector "#draw-color" to block matching selector "#when_run"
  And I press "runButton"
#  Then element ".project_updated_at" contains text "Saving..." # I think browserstack is too slow to catch this
  Then I wait until element ".project_updated_at" contains text "Saved"
  And I reload the page
  Then element "#draw-color" is a child of element "#when_run"

# dashboard_db_access for sign in
# no_mobile because we don't end up with open-workspace on mobile
@dashboard_db_access @no_mobile
Scenario: Applab Flow
  Given I am on "http://studio.code.org/"
  And I am a student
  And I am on "http://studio.code.org/users/sign_in"
  Then I am on "http://studio.code.org/projects/applab"
  And I rotate to landscape
  # TODO  ideally we should probably create some code and/or design elements here
  # looks like we have add_code_to_editor
  And I wait to see "#runButton"
  And element "#runButton" is visible
  And element ".project_updated_at" has text "Not saved"
  Then I click selector ".project_share"
  And I wait to see "#x-close"

  # now we're at /projects/applab/channel_id
  Then I navigate to the share URL
  And I wait to see "#open-workspace"
  And element "#codeWorkspace" is hidden
  Then I click selector "#open-workspace"

  # We'll originally go to /view, then get pushStated to /edit
  And I get redirected to "/projects/applab/([^\/]*?)/edit" via "pushState"
  And I wait to see "#codeWorkspace"
  And selector "#codeWorkspace" doesn't have class "readonly"

  Then I sign out
  And I navigate to the last shared URL
  And I wait to see "#open-workspace"
  And element "#codeWorkspace" is hidden
  Then I click selector "#open-workspace"

  # Don't actually get redirect this time (stay on /view)
  And I get redirected to "/projects/applab/([^\/]*?)/view" via "nothing"
  And I wait to see "#codeWorkspace"
  And selector "#codeWorkspace" has class "readonly"

  # Now view the /edit page as a signed in, non-owner
  Given I am on "http://studio.code.org/"
  And I am a teacher
  And I am on "http://studio.code.org/users/sign_in"
  And I navigate to the last shared URL
  Then I append "/edit" to the URL
  And I get redirected to "/projects/applab/([^\/]*?)/view" via "pushState"
  And I wait to see "#codeWorkspace"
  And selector "#codeWorkspace" has class "readonly"

  Then I sign out
  And I am on "http://studio.code.org/"

  # TODO - maybe we do a remix and/or create new as well
