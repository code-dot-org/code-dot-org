Feature: Public Project Gallery - Signed Out

Background:
  Given I am on "http://studio.code.org/projects/public"

Scenario: Public Gallery Shows Expected Elements
  Then I wait until element "#header-banner" is visible
  Then I wait until element "#public-gallery" is visible

Scenario: Public Gallery Shows Expected Project Types
  Then I wait until element "#public-gallery" is visible
  Then I wait until element ".ui-project-app-type-area" is in the DOM
  And the project gallery contains 7 project types
  And element ".ui-project-app-type-area:eq(0)" contains text "Game Lab"
  And element ".ui-project-app-type-area:eq(1)" contains text "App Lab"
  And element ".ui-project-app-type-area:eq(2)" contains text "Play Lab"
  And element ".ui-project-app-type-area:eq(3)" contains text "Games with Events"
  And element ".ui-project-app-type-area:eq(4)" contains text "Drawing"
  And element ".ui-project-app-type-area:eq(5)" contains text "Minecraft"
  And element ".ui-project-app-type-area:eq(6)" contains text "Pre-reader"

Scenario: View More Links for App Lab and Game Lab Based on DCDO
  Then I wait until element ".ui-project-app-type-area" is in the DOM
  And the project gallery contains 7 project types
  And I confirm correct visibility of view more links
