@chrome
@no_mobile
@single_session
Feature: Global Edition - Farsi MVP - Personal Project Gallery

  Background:
    Given I create a teacher-associated student named "Lillian"
    And I use a cookie to mock the DCDO key "global_edition_enabled" as "true"

  Scenario: The student sees only the projects available in Farsi MVP
    Given I am on "http://studio.code.org/fa/projects"

    When I wait until element "h4.new-project-heading:contains(شروع پروژه جدید)" is visible
    # The section "Start a new project" contains projects: "Sprite Lab", "Artist", "App Lab", and "Game Lab"
    Then element "h4.new-project-heading + div" has text "لابراتوار اسپرایتهنرمندلابراتوار اپلابراتوار بازی"

    When I click "#uitest-view-full-list" once it exists
    Then I wait until element "#full-list-projects" is visible
    And element "#full-list-projects div:contains(خلاقیت دارای پایان باز) a " has text "لابراتوار اسپرایت"
    And element "#full-list-projects div:contains(ترسیم) a" has text "هنرمند"
    # The section "Beyond Blocks" contains projects: "App Lab", and "Game Lab"
    And element "#full-list-projects div:contains(فراتر از بلوک) a" has text "لابراتوار اپلابراتوار بازی"
