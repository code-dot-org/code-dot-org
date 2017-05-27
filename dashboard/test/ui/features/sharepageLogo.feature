@no_mobile
@as_student
Feature: Lab share page logo

  Scenario: Select the logo on an applab share page while logged in and visit the homepage
    Given I am on "http://studio.code.org/projects/applab"
    And I wait for the page to fully load
    Then I click selector ".project_share"
    And I wait until element "#sharing-input" is visible
    And I navigate to the share URL
    And I wait for the page to fully load
    And element "#logo-link" is visible
    And I press "logo-link" to load a new page
    And I wait until current URL contains "/studio.code.org/"

  Scenario: Select the logo on a playlab share page while logged in and visit the homepage
    Given I am on "http://studio.code.org/projects/playlab"
    And I wait for the page to fully load
    Then I click selector ".project_share"
    And I wait until element "#sharing-input" is visible
    And I navigate to the share URL
    And I wait for the page to fully load
    And element "#logo-link" is visible
    And I press "logo-link" to load a new page
    And I wait until current URL contains "/studio.code.org/"

  Scenario: Select the logo on a gamelab share page while logged in and visit the homepage
    Given I am on "http://studio.code.org/projects/gamelab"
    And I wait for the page to fully load
    Then I click selector ".project_share"
    And I wait until element "#sharing-input" is visible
    And I navigate to the share URL
    And I wait for the page to fully load
    And element "#logo-link" is visible
    And I press "logo-link" to load a new page
    And I wait until current URL contains "/studio.code.org/"

  Scenario: Select the logo on an artist share page while logged in and visit the homepage
    Given I am on "http://studio.code.org/projects/artist"
    And I wait for the page to fully load
    Then I click selector ".project_share"
    And I wait until element "#sharing-input" is visible
    And I navigate to the share URL
    And I wait for the page to fully load
    And element "#logo-link" is visible
    And I press "logo-link" to load a new page
    And I wait until current URL contains "/studio.code.org/"