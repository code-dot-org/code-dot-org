Feature: Gamelab Projects

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
  And I create a teacher named "Non-Owner"
  And I am on "http://studio.code.org/users/sign_in"
  And I reload the page
  When I navigate to the last shared URL
  And I append "/edit" to the URL
  Then I get redirected to "/projects/gamelab/([^\/]*?)/view" via "pushState"
  And I wait to see "#codeWorkspace"
  And selector "#codeWorkspace" has class "readonly"

@dashboard_db_access @as_student
@no_mobile
Scenario: Remix project creates and redirects to new channel
  Given I am on "http://studio.code.org/projects/gamelab"
  And I get redirected to "/projects/gamelab/([^\/]*?)/edit" via "dashboard"
  And I rotate to landscape
  And I wait for the page to fully load
  Then evaluate JavaScript expression "localStorage.setItem('is13Plus', 'true'), true"
  And element "#runButton" is visible
  And element ".project_updated_at" eventually contains text "Saved"
  And I click selector ".project_edit"
  And I type "Code Ninja" into "input.project_name"
  And I click selector ".project_save"
  And I wait until element ".project_edit" is visible
  Then I should see title "Code Ninja - Game Lab"
  And I save the URL

  Then I click selector ".project_remix" to load a new page
  And I should see title "Remix: Code Ninja - Game Lab"
  And check that the URL contains "/edit"
  And check that the URL contains "http://studio.code.org/projects/gamelab"
  And current URL is different from the last saved URL
  And I wait for the page to fully load
  And element "#runButton" is visible
  And I click selector "#runButton"