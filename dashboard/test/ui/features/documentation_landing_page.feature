@no_mobile
@single_session
Feature: Documentation Landing Page

  Scenario: Documentation landing page displays
    Given I am on "http://studio.code.org/docs/"
    And I wait until element ".logo" is visible
    And I wait until ".content" contains text "IDEs"
    And I wait until ".content" contains text "Sprite Lab"
    And I wait until ".content" contains text "Concepts"

  Scenario: Applab Documentation landing page displays
    Given I am on "http://studio.code.org/docs/applab/"
    And I wait until element ".container" is visible
    And I wait until "#doc_header" contains text "App Lab Documentation:"
    And I wait until ".content" contains text "UI Controls"
    And I wait until ".content" contains text "onEvent"
    And I wait until ".category_list" contains text "UI Controls"

  Scenario: Maps Documentation landing page displays
    Given I am on "http://studio.code.org/docs/concepts/"
    And I wait until element ".container" is visible
    And I wait until ".content" contains text "Concepts"
    And I wait until "#categories" contains text "Drawing Shapes"
