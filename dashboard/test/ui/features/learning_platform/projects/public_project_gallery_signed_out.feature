Feature: Public Project Gallery - Signed Out

Background:
  Given I am on "http://studio.code.org/projects/public"

Scenario: Public Gallery Shows Expected Elements
  Then I wait until element "#header-banner" is visible
  Then I wait until element "#uitest-public-projects" is visible

Scenario: Public Gallery Shows Expected Project Types
  Then I wait until element "#uitest-public-projects" is visible
  Then I wait until element ".ui-project-app-type-area" is in the DOM
  And the project gallery contains 9 project types
  And element ".ui-dance" contains text "Dance Party"
  And element ".ui-gamelab" contains text "Game Lab"
  And element ".ui-applab" contains text "App Lab"
  And element ".ui-spritelab" contains text "Sprite Lab"
  And element ".ui-playlab" contains text "Play Lab"
  And element ".ui-events" contains text "Games with Events"
  And element ".ui-artist" contains text "Drawing"
  And element ".ui-minecraft" contains text "Minecraft"
  And element ".ui-k1" contains text "Pre-reader"

Scenario: View More Links for App Lab and Game Lab Based on DCDO
  Then I wait until element ".ui-project-app-type-area" is in the DOM
  And the project gallery contains 9 project types
  And I confirm correct visibility of view more links
