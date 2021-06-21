Feature: Starwars Project

@skip
@as_student @no_mobile
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
