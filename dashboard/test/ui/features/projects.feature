Feature: Projects

Scenario: Save Artist Project
  Given I am on "http://studio.code.org/projects/artist"
  And I get redirected to "/projects/artist/([^\/]*?)/edit" via "dashboard"
  And I rotate to landscape
  And I wait for the page to fully load
  And element "#runButton" is visible
  And element ".project_updated_at" eventually contains text "Saved"
  Then I open the topmost blockly category "Brushes"
  And I drag block matching selector "#draw-color" to block matching selector "#when_run"

  When I am not signed in
  And I open the project share dialog
  Then the project cannot be published

  And I navigate to the share URL
  And I wait until element "#visualization" is visible
  Then element "draw-color" is a child of element "when_run"

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

@dashboard_db_access @as_student @no_mobile
Scenario: Gamelab Flow
  Given I am on "http://studio.code.org/projects/gamelab"
  And I get redirected to "/projects/gamelab/([^\/]*?)/edit" via "dashboard"
  And I rotate to landscape
  And I wait for the page to fully load
  Then evaluate JavaScript expression "localStorage.setItem('is13Plus', 'true'), true"
  And element "#runButton" is visible
  And element ".project_updated_at" eventually contains text "Saved"
  And I click selector ".project_edit"
  And I type "Code Ninja II: Uncaught Exception" into "input.project_name"
  And I click selector ".project_save"
  And I wait until element ".project_edit" is visible
  Then I should see title "Code Ninja II: Uncaught Exception - Game Lab"

  And I ensure droplet is in text mode
  And I append gamelab code to draw a ninja

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

  # Test the "View code" button, as the owner goes to /edit
  When I navigate to the share URL
  And I wait to see "#footerDiv"
  Then I should see title "Code Ninja II: Uncaught Exception - Game Lab"
  And element "#codeWorkspace" is hidden
  When I make all links open in the current tab
  And I click selector "a:contains('View code')"
  Then I get redirected to "/projects/gamelab/([^\/]*?)/edit" via "pushState"
  And I wait to see "#codeWorkspace"
  And I should see title "Code Ninja II: Uncaught Exception - Game Lab"
  And selector "#codeWorkspace" doesn't have class "readonly"

  # Test the "How it works" link, as the owner goes to /edit
  When I navigate to the last shared URL
  And I wait to see "#footerDiv"
  Then I should see title "Code Ninja II: Uncaught Exception - Game Lab"
  And element "#codeWorkspace" is hidden
  When I make all links open in the current tab
  And I press the first "#footerDiv .more-link" element
  And I press a button with xpath "//div[@id = 'footerDiv']//a[text() = 'How it Works (View Code)']"
  Then I get redirected to "/projects/gamelab/([^\/]*?)/edit" via "nothing"
  And I wait to see "#codeWorkspace"
  And I should see title "Code Ninja II: Uncaught Exception - Game Lab"
  And selector "#codeWorkspace" doesn't have class "readonly"

  # Test the "View code" button, as an anonymous user goes to /view
  When I am on "http://studio.code.org/users/sign_out"
  And I navigate to the last shared URL
  And I wait to see "#footerDiv"
  Then I should see title "Code Ninja II: Uncaught Exception - Game Lab"
  And element "#codeWorkspace" is hidden
  When I make all links open in the current tab
  And I click selector "a:contains('View code')"
  Then I get redirected to "/projects/gamelab/([^\/]*?)/view" via "nothing"
  And I wait to see "#codeWorkspace"
  And I should see title "Code Ninja II: Uncaught Exception - Game Lab"
  And selector "#codeWorkspace" has class "readonly"

  # Test the "How it works" link, as an anonymous user goes to /view
  When I navigate to the last shared URL
  And I wait to see "#footerDiv"
  Then I should see title "Code Ninja II: Uncaught Exception - Game Lab"
  And element "#codeWorkspace" is hidden
  When I make all links open in the current tab
  And I press the first "#footerDiv .more-link" element
  And I press a button with xpath "//div[@id = 'footerDiv']//a[text() = 'How it Works (View Code)']"
  Then I get redirected to "/users/sign_in" via "nothing"
  # It'd be nicer if we went to /view in this case, but that's a future feature.

  # Test navigating to /edit as a non-owner user redirects to /view
  Given I am on "http://studio.code.org/"
  And I am a teacher
  And I am on "http://studio.code.org/users/sign_in"
  And I reload the page
  When I navigate to the last shared URL
  And I append "/edit" to the URL
  Then I get redirected to "/projects/gamelab/([^\/]*?)/view" via "pushState"
  And I wait to see "#codeWorkspace"
  And selector "#codeWorkspace" has class "readonly"

@dashboard_db_access @as_student @no_mobile
Scenario: Starwars Flow
  Given I am on "http://studio.code.org/projects/starwars"
  And I get redirected to "/projects/starwars/([^\/]*?)/edit" via "dashboard"
  And I rotate to landscape
  And I wait for the page to fully load
  Then evaluate JavaScript expression "localStorage.setItem('is13Plus', 'true'), true"
  And element "#runButton" is visible
  And element ".project_updated_at" eventually contains text "Saved"
  And I click selector ".project_edit"
  And I type "Code Ninja III: Revenge of the Semicolon" into "input.project_name"
  And I click selector ".project_save"
  And I wait until element ".project_edit" is visible
  Then I should see title "Code Ninja III: Revenge of the Semicolon - Play Lab"
  And I press "runButton"

  When I open the project share dialog
  Then the project is unpublished

  When I navigate to the share URL
  And I wait to see "#footerDiv"
  Then I should see title "Code Ninja III: Revenge of the Semicolon - Play Lab"
  And element "#codeWorkspace" is hidden

@eyes
@as_student
Scenario: My Projects
  When I open my eyes to test "My Projects page"
  And I am on "http://studio.code.org/projects/"
  And I wait to see ".header_user"
  And I wait until element "#uitest-view-full-list" is visible
  And element "a[href='/projects/artist/new']" is visible
  And element "a[href='/projects/gumball/new']" is not visible
  Then I see no difference for "page load"

  When I click selector "#uitest-view-full-list"
  And I wait until element "a[href='/projects/gumball/new']" is visible
  Then I see no difference for "view full list of new project types"
  And I close my eyes
