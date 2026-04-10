@chrome
@no_mobile
@single_session
Feature: Global Edition - Farsi MVP - Personal Project Gallery

  Background:
    Given I create a teacher-associated student named "Lillian"
    And I use a cookie to mock the DCDO key "global_edition_enabled" as "true"

  Scenario: The student sees only the projects available in Farsi MVP
    Given I am on "http://studio.code.org/projects"
    And I select the "فارسی" option in dropdown "locale" to load a new page
    And I wait until current URL contains "http://studio.code.org/fa/projects"

    When I reload the page
    Then element "script[data-ge-region='fa']" does exist
    And element "html[lang='fa-IR']" is visible

    When I wait until element "h4.new-project-heading" is visible
    # The "Create a new project" section contains exactly: Sprite Lab, Artist, App Lab, and Game Lab
    Then element "h4.new-project-heading + div a[href='/projects/spritelab/new']" is visible
    And element "h4.new-project-heading + div a[href='/projects/artist/new']" is visible
    And element "h4.new-project-heading + div a[href='/projects/applab/new']" is visible
    And element "h4.new-project-heading + div a[href='/projects/gamelab/new']" is visible

    When I click "#uitest-view-full-list" once it exists
    Then I wait until element "#full-list-projects" is visible
    # The full list contains exactly the same 4 project types, no others
    And element "#full-list-projects a[href='/projects/spritelab/new']" is visible
    And element "#full-list-projects a[href='/projects/artist/new']" is visible
    And element "#full-list-projects a[href='/projects/applab/new']" is visible
    And element "#full-list-projects a[href='/projects/gamelab/new']" is visible
    And element "#full-list-projects a[href='/projects/dance/new']" does not exist
    And element "#full-list-projects a[href='/projects/playlab/new']" does not exist
    And element "#full-list-projects a[href='/projects/weblab/new']" does not exist
