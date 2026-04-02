@chrome
@no_mobile
@single_session
Feature: Global Edition - Farsi MVP - Personal Project Gallery

  Background:
    Given I create a teacher-associated student named "Lillian"
    And I use a cookie to mock the DCDO key "global_edition_enabled" as "true"

  Scenario: The student sees only the projects available in Farsi MVP
    Given I am on "http://studio.code.org/global/fa/projects"
    And I select the "English" option in dropdown "locale" to load a new page

    When I wait until element "h4.new-project-heading:contains(Start a new project)" is visible
    # The section "Start a new project" contains projects: "Sprite Lab", "Artist", "App Lab", and "Game Lab"
    Then element "h4.new-project-heading + div" has text "Sprite LabArtistApp LabGame Lab"

    When I click "#uitest-view-full-list" once it exists
    Then I wait until element "#full-list-projects" is visible
    And element "#full-list-projects div:contains(Open-Ended Creativity) a " has text "Sprite Lab"
    And element "#full-list-projects div:contains(Drawing) a" has text "Artist"
    # The section "Beyond Blocks" contains projects: "App Lab", and "Game Lab"
    And element "#full-list-projects div:contains(Beyond Blocks) a" has text "App LabGame Lab"
