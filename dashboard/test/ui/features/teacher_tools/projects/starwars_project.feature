Feature: Starwars Project

@as_student @no_mobile
Scenario: Starwars Flow
  Given I am on "http://studio.code.org/projects/starwars"
  And I get redirected to "/projects/starwars/([^\/]*?)/edit" via "dashboard"
  And I wait for the lab page to fully load
  Then evaluate JavaScript expression "localStorage.setItem('is13Plus', 'true'), true"
  And element "#runButton" is visible
  And element ".project_updated_at" eventually contains text "Saved"
  And I click selector ".project_edit"
  And I type "Code Ninja III: Revenge of the Semicolon" into "input.project_name"
  And I click selector ".project_save"
  And I wait until element ".project_edit" is visible
  Then I should see title includes "Code Ninja III: Revenge of the Semicolon - Play Lab - Code.org"

  Then I open the project share dialog
  When I navigate to the share URL
  And I wait to see "#footerDiv"
  Then I should see title includes "Code Ninja III: Revenge of the Semicolon - Play Lab - Code.org"
  And element "#codeWorkspace" is hidden
