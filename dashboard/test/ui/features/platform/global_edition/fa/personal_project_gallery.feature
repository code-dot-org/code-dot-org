@chrome
@no_mobile
@single_session
Feature: Global Edition - Farsi MVP - Personal Project Gallery

  Background:
    Given Global Edition is enabled
    And I create a teacher-associated student named "Lillian"

  Scenario: The student sees only the projects available in Farsi MVP
    Given I am on "http://studio.code.org/projects"
    And I select the "فارسی" option in dropdown "locale" to load a new page
    And I wait until current URL contains "http://studio.code.org/fa/projects"

    When I reload the page
    Then element "html[lang='fa-IR'][data-ge-region='fa']" is visible

    When I wait until element "h4.new-project-heading" is visible
    # The "Create a new project" section contains exactly: Sprite Lab, Artist, App Lab, and Game Lab
    Then element "div a[href='/projects/spritelab/new']" is visible
    And element "div a[href='/projects/artist/new']" is visible
    And element "div a[href='/projects/applab/new']" is visible
    And element "div a[href='/projects/gamelab/new']" is visible

    When I click "#uitest-view-full-list" once it exists
    Then I wait until element "#full-list-projects" is visible
    # The full list contains exactly the same 4 project types, no others
    And element "a[href='/projects/spritelab/new']" is visible
    And element "a[href='/projects/artist/new']" is visible
    And element "a[href='/projects/applab/new']" is visible
    And element "a[href='/projects/gamelab/new']" is visible
    And element "a[href='/projects/dance/new']" is not visible
    And element "a[href='/projects/playlab/new']" is not visible
    And element "a[href='/projects/weblab/new']" is not visible
