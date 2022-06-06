@no_mobile
@single_session
Feature: Documentation Landing Page

  Scenario: Documentation landing page displays
    Given I am on "http://studio.code.org/docs/"
    And I wait until element ".container" is visible
    And I wait until ".container" contains text "IDEs"
    And I wait until ".container" contains text "Sprite Lab"

  Scenario: Applab Documentation landing page displays
    Given I am on "http://studio.code.org/docs/ide/applab/"
    And I wait until element ".container" is visible
    And I wait until "h1:first" contains text "App Lab Documentation"
    And I wait until ".page-content" contains text "UI controls"
    And I wait until ".page-content" contains text "onEvent"
    And I wait until ".nav-bar" contains text "UI controls"
