@as_student
@single_session
Feature: Lab share page logo

  @no_mobile
  Scenario: Select the logo on an applab share page while logged in and visit the homepage
    Given I am on "http://studio.code.org/projects/applab"
    And I wait for the lab page to fully load
    Then I click selector ".project_share"
    And I wait until element "#sharing-dialog-copy-button" is visible
    And I navigate to the share URL
    And I wait to see "#runButton"
    And element "div:contains('STUDIO')" does not exist
    And I press the first "#logo-img img" element to load a new page
    And check that I am on "http://studio.code.org/home"

  @no_mobile
  Scenario: Select the logo on a playlab share page while logged in and visit the homepage
    Given I am on "http://studio.code.org/projects/playlab"
    And I wait for the lab page to fully load
    Then I click selector ".project_share"
    And I wait until element "#sharing-dialog-copy-button" is visible
    And I navigate to the share URL
    And I wait to see "#runButton"
    And element "div:contains('STUDIO')" does not exist
    And I press the first "#logo-img img" element to load a new page
    And check that I am on "http://studio.code.org/home"

  @no_mobile
  Scenario: Select the logo on a gamelab share page while logged in and visit the homepage
    Given I am on "http://studio.code.org/projects/gamelab"
    And I wait for the lab page to fully load
    Then I click selector ".project_share"
    And I wait until element "#sharing-dialog-copy-button" is visible
    And I navigate to the share URL
    And I wait to see "#runButton"
    And element "div:contains('STUDIO')" does not exist
    And I press the first "#logo-img img" element to load a new page
    And check that I am on "http://studio.code.org/home"

  @no_mobile
  Scenario: Select the logo on an artist share page while logged in and visit the homepage
    Given I am on "http://studio.code.org/projects/artist"
    And I wait for the lab page to fully load
    Then I click selector ".project_share"
    And I wait until element "#sharing-dialog-copy-button" is visible
    And I navigate to the share URL
    And I wait to see "#runButton"
    And element "div:contains('STUDIO')" does not exist
    And I press the first "#logo-img img" element to load a new page
    And check that I am on "http://studio.code.org/home"

  @no_mobile
  Scenario: Select the logo on a playlab share page while logged out and visit the homepage
    Given I am on "http://studio.code.org/projects/playlab"
    And I wait for the lab page to fully load
    Then I click selector ".project_share"
    And I wait until element "#sharing-dialog-copy-button" is visible
    And I navigate to the share URL
    And I wait to see "#runButton"
    And I sign out using jquery
    And I navigate to the last shared URL
    And element "div:contains('STUDIO')" does not exist
    And I press the first "#logo-img img" element to load a new page
    And check that I am on "http://code.org/"

  @no_mobile
  Scenario: Select the logo on a gamelab share page while logged out and visit the homepage
    Given I am on "http://studio.code.org/projects/gamelab"
    And I wait for the lab page to fully load
    Then I click selector ".project_share"
    And I wait until element "#sharing-dialog-copy-button" is visible
    And I navigate to the share URL
    And I wait to see "#runButton"
    And I sign out using jquery
    And I navigate to the last shared URL
    And element "div:contains('STUDIO')" does not exist
    And I press the first "#logo-img img" element to load a new page
    And check that I am on "http://code.org/"

  @only_mobile
  Scenario: When on an applab share page while logged out on mobile, there is no logo.
    Given I am on "http://studio.code.org/projects/applab"
    And I wait for the lab page to fully load
    Then I click selector ".project_share"
    And I wait until element "#sharing-dialog-copy-button" is visible
    And I navigate to the share URL
    And I wait to see "#runButton"
    And element "#main_logo" does not exist

  @only_mobile
  Scenario: When on a gamelab share page while logged out on mobile, there is no logo.
    Given I am on "http://studio.code.org/projects/gamelab"
    And I wait for the lab page to fully load
    Then I click selector ".project_share"
    And I wait until element "#sharing-dialog-copy-button" is visible
    And I navigate to the share URL
    And I wait to see "#runButton"
    And element "#main_logo" does not exist
