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
  Then I click selector ".project_share"
  And I wait to see "#x-close"
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
  Then I click selector ".project_share"
  And I wait to see "#x-close"

  Then I navigate to the share URL
  And I wait to see "#footerDiv"
  Then I should see title "Code Ninja - App Lab"
  And element "#codeWorkspace" is hidden
  And I make all links open in the current tab
  And I press a button with xpath "//a[text() = ' View code']"

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
  And I press a button with xpath "//a[text() = ' View code']"

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

  And I switch to text mode
  And I append gamelab code to draw a ninja
  And I press "runButton"
  And I wait for 0.5 seconds

  Then I click selector ".project_share"
  And I wait to see "#x-close"

  # Test the "View code" button, as the owner goes to /edit
  When I navigate to the share URL
  And I wait to see "#footerDiv"
  Then I should see title "Code Ninja II: Uncaught Exception - Game Lab"
  And element "#codeWorkspace" is hidden
  When I make all links open in the current tab
  And I press a button with xpath "//a[text() = ' View code']"
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
  And I press a button with xpath "//div[@id = 'footerDiv']//a[text() = 'How it works']"
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
  And I press a button with xpath "//a[text() = ' View code']"
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
  And I press a button with xpath "//div[@id = 'footerDiv']//a[text() = 'How it works']"
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
