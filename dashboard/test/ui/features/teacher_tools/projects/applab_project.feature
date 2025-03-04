Feature: Applab Project

# as_student to actually perform sign-in/out before/after scenario
# no_mobile because we don't end up with open-workspace on mobile
@as_taught_student
@no_mobile
Scenario: Applab Flow
  Given I am on "http://studio.code.org/projects/applab"
  And I get redirected to "/projects/applab/([^\/]*?)/edit" via "dashboard"
  And I wait for the lab page to fully load
  Then evaluate JavaScript expression "localStorage.setItem('is13Plus', 'true'), true"
  And I switch to text mode
  And I add code "image('id', 'https://code.org/images/logo.png')" to ace editor
  And element ".project_updated_at" eventually contains text "Saved"
  And I click selector ".project_edit"
  And I type "Code Ninja" into "input.project_name"
  And I click selector ".project_save"
  And I wait until element ".project_edit" is visible
  Then I should see title includes "Code Ninja - App Lab - Code.org"

  # Thumbnail is required to publish the project
  And I press "runButton"
  And I wait until element ".project_updated_at" contains text "Saved"
  And I wait until initial thumbnail capture is complete

  Then I open the project share dialog
  And I navigate to the share URL
  And I wait to see "#footerDiv"
  Then I should see title includes "Code Ninja - App Lab - Code.org"
  And element "#codeWorkspace" is hidden
  And I make all links open in the current tab
  And I click selector "a:contains('View code')"

  # We'll originally go to /view, then get pushStated to /edit
  And I get redirected to "/projects/applab/([^\/]*?)/edit" via "pushState"
  And I wait to see "#codeWorkspace"
  And selector "#codeWorkspace" doesn't have class "readonly"
  And I should see title includes "Code Ninja - App Lab - Code.org"

  And I sign out
  And I navigate to the last shared URL
  And I wait to see "#footerDiv"
  And element "#codeWorkspace" is hidden
  And I should see title includes "Code Ninja - App Lab - Code.org"
  And I make all links open in the current tab
  And I click selector "a:contains('View code')"

  # Don't actually get redirect this time (stay on /view)
  And I get redirected to "/projects/applab/([^\/]*?)/view" via "nothing"
  And I wait to see "#codeWorkspace"
  And selector "#codeWorkspace" has class "readonly"
  And I should see title includes "Code Ninja - App Lab - Code.org"

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

  And I sign out
  And I am on "http://studio.code.org/"
  # TODO - maybe we do a remix and/or create new as well

@as_student
@no_mobile
Scenario: Remix project creates and redirects to new channel
  Given I am on "http://studio.code.org/projects/applab"
  And I get redirected to "/projects/applab/([^\/]*?)/edit" via "dashboard"
  And I wait for the lab page to fully load
  Then evaluate JavaScript expression "localStorage.setItem('is13Plus', 'true'), true"
  And element "#runButton" is visible
  And element ".project_updated_at" eventually contains text "Saved"
  And I click selector ".project_edit"
  And I type "Code Ninja" into "input.project_name"
  And I click selector ".project_save"
  And I wait until element ".project_edit" is visible
  Then I should see title includes "Code Ninja - App Lab - Code.org"
  And I save the URL

  Then I click selector ".project_remix" to load a new page
  And I wait for the lab page to fully load
  And I should see title includes "Remix: Code Ninja - App Lab - Code.org"
  And check that the URL contains "/edit"
  And check that the URL contains "http://studio.code.org/projects/applab"
  And current URL is different from the last saved URL
  And element "#runButton" is visible
  And I press "runButton"
