Feature: Applab Project

# dashboard_db_access for sign in
# as_student to actually perform sign-in/out before/after scenario
# no_mobile because we don't end up with open-workspace on mobile
# no_ie because applab is broken on IE9, and on IE10 this test crashes when we
#   try to execute any JS after our redirect on line 42
@dashboard_db_access @as_student
@no_mobile @no_ie
Scenario: Applab Flow
  Given I am on "http://studio.code.org/projects/applab"
  And I get redirected to "/projects/applab/([^\/]*?)/edit" via "dashboard"
  And I rotate to landscape
  And I wait for the page to fully load
  Then evaluate JavaScript expression "localStorage.setItem('is13Plus', 'true'), true"
  # TODO  ideally we should probably create some code and/or design elements here
  # looks like we have add_code_to_editor
  And element "#runButton" is visible
  And element ".project_updated_at" eventually contains text "Saved"
  And I click selector ".project_edit"
  And I type "Code Ninja" into "input.project_name"
  And I click selector ".project_save"
  And I wait until element ".project_edit" is visible
  Then I should see title "Code Ninja - App Lab"

  # Thumbnail is required to publish the project
  And I press "runButton"
  And I wait until element ".project_updated_at" contains text "Saved"
  And I wait until initial thumbnail capture is complete

  Given I open the project share dialog
  And the project is unpublished
  When I publish the project from the share dialog
  And I open the project share dialog
  Then the project is published

  When I reload the project page
  And I open the project share dialog
  Then the project is published

  When I unpublish the project from the share dialog
  And I open the project share dialog
  Then the project is unpublished

  When I reload the project page
  And I open the project share dialog
  Then the project is unpublished

  Then I navigate to the share URL
  And I wait to see "#footerDiv"
  Then I should see title "Code Ninja - App Lab"
  And element "#codeWorkspace" is hidden
  And I make all links open in the current tab
  And I click selector "a:contains('View code')"

  # We'll originally go to /view, then get pushStated to /edit
  And I get redirected to "/projects/applab/([^\/]*?)/edit" via "pushState"
  And I wait to see "#codeWorkspace"
  And selector "#codeWorkspace" doesn't have class "readonly"
  And I should see title "Code Ninja - App Lab"

  Then I am on "http://studio.code.org/users/sign_out"
  And I navigate to the last shared URL
  And I wait to see "#footerDiv"
  And element "#codeWorkspace" is hidden
  And I should see title "Code Ninja - App Lab"
  And I make all links open in the current tab
  And I click selector "a:contains('View code')"

  # Don't actually get redirect this time (stay on /view)
  And I get redirected to "/projects/applab/([^\/]*?)/view" via "nothing"
  And I wait to see "#codeWorkspace"
  And selector "#codeWorkspace" has class "readonly"
  And I should see title "Code Ninja - App Lab"

  # Now view the /edit page as a signed in, non-owner
  Given I am on "http://studio.code.org/"
  And I am a teacher
  And I am on "http://studio.code.org/users/sign_in"
  And I reload the page
  And I navigate to the last shared URL
  Then I append "/edit" to the URL
  And I get redirected to "/projects/applab/([^\/]*?)/view" via "pushState"
  And I wait to see "#codeWorkspace"
  And selector "#codeWorkspace" has class "readonly"

  Then I am on "http://studio.code.org/users/sign_out"
  And I am on "http://studio.code.org/"

  # TODO - maybe we do a remix and/or create new as well

Scenario: Save Project After Signing Out
  Given I create a student named "Sally Student"
  And I am on "http://studio.code.org/projects/applab/new"
  And I get redirected to "/projects/applab/([^\/]*?)/edit" via "dashboard"
  And I wait for the page to fully load
  And I wait for initial project save to complete
  And I ensure droplet is in block mode
  And I switch to text mode
  And I add code "// comment 1" to ace editor
  And I press "runButton"
  And element ".project_updated_at" eventually contains text "Saved"

  When I sign out using jquery
  And I add code "// comment 2" to ace editor
  And ace editor code is equal to "// comment 1// comment 2"
  And I press "resetButton"
  And I click selector "#runButton" once I see it
  Then I get redirected to "/users/sign_in" via "dashboard"

  When I sign in as "Sally Student" from the sign in page
  And I get redirected to "/projects/applab/([^\/]*?)/edit" via "dashboard"
  And I wait for the page to fully load
  And I ensure droplet is in text mode
  Then ace editor code is equal to "// comment 1"

Scenario: Save Script Level After Signing Out
  Given I create a student named "Sally Student"
  And I am on "http://studio.code.org/s/csp3/stage/5/puzzle/3"
  And I wait for the page to fully load
  And I wait for initial project save to complete
  And I ensure droplet is in block mode
  And I switch to text mode
  And I add code "// turtle 1" to ace editor
  And I press "runButton"
  And element ".project_updated_at" eventually contains text "Saved"

  When I sign out using jquery
  And I add code "// turtle 2" to ace editor
  And ace editor code is equal to "// turtle 1// turtle 2"
  And I press "resetButton"
  And I click selector "#runButton" once I see it
  Then I get redirected to "/users/sign_in" via "dashboard"

  When I sign in as "Sally Student" from the sign in page
  And I get redirected to "/s/csp3/stage/5/puzzle/3" via "dashboard"
  And I wait for the page to fully load
  And I ensure droplet is in text mode
  Then ace editor code is equal to "// turtle 1"
